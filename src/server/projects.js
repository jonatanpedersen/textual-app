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
	};
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

export function createGetProjectsByRepositoryUrls (db) {
	return async function getProjectsByRepositoryUrls (repositoryUrls) {
		return db.collection('projects')
			.find({repositoryUrl: { $in: repositoryUrls}})
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
	};
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

export function createGetProjectsRouteHandler (getProjectsByRepositoryUrls, getUserRepositories) {
	return async (req, res, next) => {
		try {
			let userRepositories = await getUserRepositories(req.user._id);
			let userRepositoryUrls = userRepositories.map(userRepository => userRepository.url);

			let projects = await getProjectsByRepositoryUrls(userRepositoryUrls);
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

export function createGetProjectTextsRouteHandler (getProjectId, getProject, GitHub) {
	return async function getProjectTextsRouteHandler (req, res, next) {
		try {
			let github = new GitHub();
			github.authenticate({
		    type: 'oauth',
		    token: req.user.github.accessToken
			});

			let projectIdOrName = req.params.projectIdOrName;
			let projectId = await getProjectId(projectIdOrName);
			let project = await getProject(projectId);
			let repositoryNameParts = getRepositoryNameFromRepositoryUrl(project.repositoryUrl).split('/');
			let user = repositoryNameParts[0];
			let repo = repositoryNameParts[1];
			let ref = 'heads/master';
			let reference = await github.gitdata.getReference({user, repo, ref});
			let tree = await github.gitdata.getTree({user, repo, sha: reference.object.sha});
			let item = tree.tree.find(item => item.path === 'texts.json');
			let blob = await github.gitdata.getBlob({user, repo, sha: item.sha});
			let json = Buffer.from(blob.content, blob.encoding).toString();
			let data = JSON.parse(json);

			res.json(data);
		} catch (err) {
			return next(err);
		}
	};
}


export function createPatchProjectTextsRouteHandler (getProjectId, getProject, jsonPatch, GitHub) {
	return async function patchProjectTextsRouteHandler (req, res, next) {
		try {
			let github = new GitHub();
			github.authenticate({
		    type: 'oauth',
		    token: req.user.github.accessToken
			});
			let patch = req.body;
			let projectIdOrName = req.params.projectIdOrName;
			let projectId = await getProjectId(projectIdOrName);
			let project = await getProject(projectId);
			let repositoryNameParts = getRepositoryNameFromRepositoryUrl(project.repositoryUrl).split('/');
			let user = repositoryNameParts[0];
			let repo = repositoryNameParts[1];
			let ref = 'heads/master';
			let reference = await github.gitdata.getReference({user, repo, ref });
			let tree = await github.gitdata.getTree({user, repo, sha: reference.object.sha});
			let item = tree.tree.find(item => item.path === 'texts.json');
			let blob = await github.gitdata.getBlob({user, repo, sha: item.sha});
			let json = Buffer.from(blob.content, blob.encoding).toString();
			let data = JSON.parse(json);

			jsonPatch.apply(data, patch);

			let newJson = JSON.stringify(data, null, 4);
			let newContent = Buffer.from(newJson, 'utf8').toString('base64');
			let newBlob = await github.gitdata.createBlob({user, repo, content: newContent, encoding: 'base64'});

			let newTree = [
				{
					path: 'texts.json',
					mode: '100644',
					type: 'blob',
					sha: newBlob.sha
				}
			];
			let newlyCreatedTree = await github.gitdata.createTree({user, repo, tree: newTree, base_tree: tree.sha});
			let author = { name: req.user.profile.displayName, email: req.user.profile.email, date: new Date().toISOString() };
			let committer = author;
			let message = patch.reduce((messages, patchEntry) => {
				if (patchEntry.op === 'add') { messages.push(`add ${patchEntry.path}`); }
				if (patchEntry.op === 'replace') { messages.push(`update ${patchEntry.path}`); }
				if (patchEntry.op === 'remove') { messages.push(`remove ${patchEntry.path}`); }
				if (patchEntry.op === 'move') { messages.push(`move ${patchEntry.from} to $(patchEntry.path}`); }

				return messages;
			}, []).join('\n');

			let commit = await github.gitdata.createCommit({user, repo, message, author, committer, tree: newlyCreatedTree.sha, parents: [tree.sha]});
			await github.gitdata.updateReference({user, repo, ref, sha: commit.sha});

			res.end();
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
