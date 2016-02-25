import mongodb from 'mongodb';
import Github from 'github-api';

function ObjectId (objectId) {
  try {
    return mongodb.ObjectId(objectId);
  } catch (error) {
    return mongodb.ObjectId();
  }
}

export function makeCreateProject (db) {
  return async function createProject (projectName, repositoryUrl) {
    try {
      let projects = db.collection('projects');

      return new Promise((resolve, reject) => {
        projects.insert({
          name: projectName,
          repositoryUrl: repositoryUrl,
          settings: {
            languages: ['en']
          }
        }, (err, res) => {
          if (err)
            reject(err);

          resolve();
        });
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetProject (db) {
  return async function getProject (projectIdOrName) {
    try {
      let projects = db.collection('projects');

      return new Promise((resolve, reject) => {
        projects.findOne({ $or: [{ _id: ObjectId(projectIdOrName)}, { name: projectIdOrName }] }, (err, project) => {
          if (err)
            reject(err);

          resolve(project);
        });
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetProjects (db) {
  return async function getProjects () {
    try {
      let projects = db.collection('projects');

      return new Promise((resolve, reject) => {
        projects.find({}, (err, projects) => {
          if (err)
            reject(err);

          resolve(projects.toArray());
        });
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetProjectSettings (db) {
  return async function getProjectSettings (projectIdOrName) {
    try {
      let projects = db.collection('projects');

      return new Promise((resolve, reject) => {
        projects.findOne({ $or: [{ _id: ObjectId(projectIdOrName)}, { name: projectIdOrName }] }, (err, project) => {
          if (err)
            reject(err);

          resolve(project.settings);
        });
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeUpdateProjectSettings (db) {
  return async function updateProjectSettings (projectIdOrName, projectSettings) {
    try {
      let projects = db.collection('projects');

      return new Promise((resolve, reject) => {
        projects.findAndModify(
          { $or: [{ _id: ObjectId(projectIdOrName)}, { name: projectIdOrName }] },
          [],
          { $set: { settings: projectSettings } },
          {},
          (err) => {
            if (err)
              reject(err);

            resolve();
          }
        );
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makePostProjectsRouteHandler (createProject) {
  return async (req, res, next) => {
    try {
      await createProject(req.body.projectName, req.body.repositoryUrl);
      res.end();
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetProjectsRouteHandler (getProjects) {
  return async (req, res, next) => {
    try {
      let projects = await getProjects();
      res.json(projects);
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetProjectSettingsRouteHandler (getProjectSettings) {
  return async (req, res, next) => {
    try {
      let projectSettings = await getProjectSettings(req.params.projectIdOrName);
      res.json(projectSettings);
    } catch (ex) {
      next(ex);
    }
  };
}

export function makePostProjectSettingsRouteHandler (updateProjectSettings) {
  return async (req, res, next) => {
    try {
      await updateProjectSettings(req.params.projectIdOrName, req.body);
      res.end();
    } catch (ex) {
      next(ex);
    }
  };
}

function getRepositoryNameFromRepositoryUrl (repositoryUrl) {
	return /https:\/\/github\.com\/(.*\.*).git/.exec(repositoryUrl)[1];
}

export function makeGetProjectRepositoryTextsRouteHandler (getProject, Github) {
  return async function getProjectRepositoryTextsRouteHandler (req, res, next) {
    try {
      let github = new Github({
				token: req.user.github.accessToken,
				auth: 'oauth'
			});

      let projectIdOrName = req.params.projectIdOrName;
      let project = await getProject(projectIdOrName);
      let repositoryName = getRepositoryNameFromRepositoryUrl(project.repositoryUrl);
			let repo = github.getRepo(repositoryName);
			let branchName = 'master';
			let filePath = 'texts.json';

			repo.read(branchName, filePath, (err, data) => {
				if (err) {
					return next(err);
				}

				res.json(data);
			});
    } catch (ex) {
      return next(ex);
    }
  };
}

export function makePatchProjectRepositoryTextsRouteHandler (getProject, jsonPatch, Github) {
  return async function (req, res, next) {
    try {
      let github = new Github({
				token: req.user.github.accessToken,
				auth: "oauth"
			});

      let projectIdOrName = req.params.projectIdOrName;
      let project = await getProject(projectIdOrName);
      let repositoryName = getRepositoryNameFromRepositoryUrl(project.repositoryUrl);
			let repo = github.getRepo(repositoryName);
			let branchName = 'master';
			let filePath = 'texts.json';
      let patch = req.body;

			repo.read(branchName, filePath, (err, data) => {
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
        } catch (ex) {
          return next(ex);
        }
			});
    } catch (ex) {
      return next(ex);
    }
  };
}
