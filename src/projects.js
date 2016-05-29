import mongodb from 'mongodb';
import Github from 'github-api';

export function createGetProjectId (db) {
	return async function getProjectId (projectIdOrName) {
		return db.collection('projects')
			.findOne(
				{ $or: [ { _id: projectIdOrName }, { name: projectIdOrName } ] },
				{ _id: 1 }
			)
			.then(project =>  {
				if (project) {
					return project._id;
				}

				throw new Error(`Project with Id or Name '${projectIdOrName}' not found`);
			});
	}
}

export function createCreateProject (db) {
	return async function createProject (projectName, repositoryUrl) {
		assertNotObjectId(projectName);

		let project = {
			name: projectName,
			repositoryUrl: repositoryUrl,
			settings: {
				languages: ['en-GB', 'da-DK']
			}
		};

		return db.collection('projects')
			.insert(project);
	};
}

export function createGetProject (db) {
	return async function getProject (projectId) {
		return db.collection('projects')
			.findOne({ _id: projectId });
	};
}

export function createGetProjects (db) {
	return async function getProjects () {
		return db.collection('projects')
			.find({})
			.toArray();
	};
}

export function createGetProjectSettings (db) {
	return async function getProjectSettings (projectId) {
		return db.collection('projects')
			.findOne({ _id: projectId })
			.then(project => {
				return project.settings;
			});
	};
}

export function createUpdateProjectSettings (db) {
	return async function updateProjectSettings (projectId, newProjectSettings) {
		return db.collection('projects')
			.updateOne(
				{ _id: projectId },
				{ $set: { settings: newProjectSettings } }
			);
	};
}

export function createRenameProject (db) {
	return async function renameProject (projectId, newProjectName) {
		return db.collection('projects')
			.updateOne(
				{ _id: projectId },
				{ $set: { name: newProjectName } }
			);
	};
}

export function createDeleteProject (db) {
	return async function deleteProject(projectId) {
		return db.collection('projects')
			.remove({ _id: projectId });
	}
}

export function createPostProjectsRouteHandler (createProject) {
	return async (req, res, next) => {
		try {
			let projectName = req.body.projectName;
			let repositoryUrl = req.body.repositoryUrl;

			await createProject(projectName, repositoryUrl);
			res.end();
		} catch (err) {
			next(err);
		}
	};
}

export function createGetProjectsRouteHandler (getProjects) {
	return async (req, res, next) => {
		try {
			let projects = await getProjects();
			res.json(projects);
		} catch (err) {
			next(err);
		}
	};
}

export function createGetProjectRouteHandler (getProjectId, getProject) {
	return async (req, res, next) => {
		try {
			let projectIdOrName = req.params.projectIdOrName;
			let projectId = await getProjectId(projectIdOrName);
			let project = await getProject(projectId);
			res.json(project);
		} catch (err) {
			next(err);
		}
	};
}

export function createGetProjectMetricsRouteHandler (getProjectId, getProjectMetrics) {
	return async (req, res, next) => {
		try {
			let projectIdOrName = req.params.projectIdOrName;
			let projectId = await getProjectId(projectIdOrName);
			let projectMetrics = await getProjectMetrics(projectId);
			res.json(projectMetrics);
		} catch (err) {
			next(err);
		}
	};
}

export function createGetProjectSettingsRouteHandler (getProjectId, getProjectSettings) {
	return async (req, res, next) => {
		try {
			let projectIdOrName = req.params.projectIdOrName;
			let projectId = await getProjectId(projectIdOrName);
			let projectSettings = await getProjectSettings(projectId);
			res.json(projectSettings);
		} catch (err) {
			next(err);
		}
	};
}

export function createPostProjectSettingsRouteHandler (getProjectId, updateProjectSettings) {
	return async (req, res, next) => {
		try {
			let projectIdOrName = req.params.projectIdOrName;
			let projectId = await getProjectId(projectIdOrName);
			let newProjectSettings = req.body;
			await updateProjectSettings(projectId, newProjectSettings);
			res.end();
		} catch (err) {
			next(err);
		}
	};
}

export function createDeleteProjectRouteHandler (getProjectId, deleteProject) {
	return async (req, res, next) => {
		try {
			let projectIdOrName = req.params.projectIdOrName;
			let projectId = await getProjectId(projectIdOrName);
			await deleteProject(projectId);
			res.end();
		} catch (err) {
			next(err);
		}
	};
}

export function createPostProjectRenameRouteHandler (getProjectId, renameProject) {
	return async (req, res, next) => {
		try {
			let projectIdOrName = req.params.projectIdOrName;
			let projectId = await getProjectId(projectIdOrName);
			let newProjectName = req.body.newProjectName;
			await renameProject(projectId, newProjectName);
			res.end();
		} catch (err) {
			next(err);
		}
	};
}

export function createGetProjectTextsRouteHandler (getProjectId, getProject, Github) {
	return async function getProjectTextsRouteHandler (req, res, next) {
		try {
			let github = new Github({
				token: req.user.github.accessToken,
				auth: 'oauth'
			});

			let projectIdOrName = req.params.projectIdOrName;
			let projectId = await getProjectId(projectIdOrName);
			let project = await getProject(projectId);
			let repositoryName = getRepositoryNameFromRepositoryUrl(project.repositoryUrl);
			let repo = github.getRepo(repositoryName);
			let branchName = 'master';
			let filePath = 'texts.json';

			repo.getContents(branchName, filePath, true, (err, data) => {
				if (err) {
					return next(err);
				}

				res.json(data);
			});
		} catch (err) {
			return next(err);
		}
	};
}

export function createPatchProjectTextsRouteHandler (getProjectId, getProject, jsonPatch, Github) {
	return async function patchProjectTextsRouteHandler (req, res, next) {
		try {
			let github = new Github({
				token: req.user.github.accessToken,
				auth: "oauth"
			});

			let projectIdOrName = req.params.projectIdOrName;
			let projectId = await getProjectId(projectIdOrName);
			let project = await getProject(projectId);
			let repositoryName = getRepositoryNameFromRepositoryUrl(project.repositoryUrl);
			let repo = github.getRepo(repositoryName);
			let branchName = 'master';
			let filePath = 'texts.json';
			let patch = req.body;

			repo.getContents(branchName, filePath, true, (err, data) => {
				if (err) {
					return next(err);
				}

				try {
					jsonPatch.apply(data, patch);
					let newData = JSON.stringify(data, null, 4);

					let author = { name: req.user.profile.displayName, email: req.user.profile.email };
					let committer = author;
					let message = patch.reduce((messages, patchEntry) => {
						if (patchEntry.op === 'add') messages.push(`add ${patchEntry.path}`);
						if (patchEntry.op === 'replace') messages.push(`update ${patchEntry.path}`);
						if (patchEntry.op === 'remove') messages.push(`remove ${patchEntry.path}`);
						if (patchEntry.op === 'move') messages.push(`move ${patchEntry.from} to $(patchEntry.path}`);

						return messages;
					}, []).join('\n');

					let options = {
						author: author,
						committer: committer
					};

					repo.write(branchName, filePath, newData, message, options, function(err) {
						if (err) {
							return next(err);
						}

						return res.end();
					});
				} catch (err) {
					return next(err);
				}
			});
		} catch (err) {
			return next(err);
		}
	};
}

function assertNotObjectId (value) {
	if (/^[a-f0-9]{24}$/.test(value)) {
		throw new Error('Is ObjectID');
	}
}

function getRepositoryNameFromRepositoryUrl (repositoryUrl) {
	return /https:\/\/github\.com\/(.*\.*).git/.exec(repositoryUrl)[1];
}
