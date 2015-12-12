import mongodb from 'mongodb';

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

          let projectId = res.insertedIds[0];

          resolve(projectId);
        });
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetProject (db) {
  return async function getProject (projectId) {
    try {
      let projects = db.collection('projects');

      return new Promise((resolve, reject) => {
        projects.findOne({ _id: mongodb.ObjectId(projectId) }, (err, project) => {
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
  return async function getProjectSettings (projectId) {
    try {
      let projects = db.collection('projects');

      return new Promise((resolve, reject) => {
        projects.findOne({ _id: mongodb.ObjectId(projectId) }, (err, project) => {
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
  return async function updateProjectSettings (projectId, projectSettings) {
    try {
      let projects = db.collection('projects');

      return new Promise((resolve, reject) => {
        projects.findAndModify(
          { _id: mongodb.ObjectId(projectId)},
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
      let projectId = await createProject(req.body.projectName, req.body.repositoryUrl);
      res.json(projectId);
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
      let projectSettings = await getProjectSettings(req.params.projectId);
      res.json(projectSettings);
    } catch (ex) {
      next(ex);
    }
  };
}

export function makePostProjectSettingsRouteHandler (updateProjectSettings) {
  return async (req, res, next) => {
    try {
      await updateProjectSettings(req.params.projectId, req.body);
      res.end();
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetProjectRepositoryTextsRouteHandler (basePath, path, fs, url, mkdirp, simpleGit, getProject) {
  return async function getProjectRepositoryTextsRouteHandler (req, res, next) {
    try {
      let projectId = req.params.projectId;
      let project = await getProject(projectId);

      let repositoryName = projectId;
      let repositoryPath = path.join(basePath, req.user.id, repositoryName);

      try {
        let stats = fs.lstatSync(repositoryPath);
      } catch (e) {
        async function init () {
          return new Promise((resolve, reject) => {
            let parsedRepositoryUrl = url.parse(project.repositoryUrl);
            parsedRepositoryUrl.auth = req.user.github.accessToken;
            let signedRepositoryUrl = url.format(parsedRepositoryUrl);

            mkdirp(repositoryPath, (err) => {
              if (err)
                throw err;

              simpleGit(repositoryPath)
                .init(false, (err) => {
                  if (err)
                    throw err;
                })
                .addRemote('origin', project.repositoryUrl)
                .pull(signedRepositoryUrl, 'master', (err) => {
                  if (err)
                    throw err;

                  return resolve();
                });
            });
          });
        }

        await init();
      }

      let repositoryTextsPath = path.join(repositoryPath, 'texts.json');

      fs.readFile(repositoryTextsPath, 'utf8', function (err, data) {
        if (err) {
          return next(err);
        }

        try {
          let texts = JSON.parse(data);

          res.json(texts);
        }
        catch (ex) {
          return next(ex);
        }
      });
    } catch (ex) {
      return next(ex);
    }
  };
}

export function makePatchProjectRepositoryTextsRouteHandler (basePath, path, fs, jsonPatch, Repository, Signature) {
  return async function (req, res, next) {
    try {
      let repositoryName = req.params.projectId;
      let repositoryPath = path.join(basePath, req.user.id, repositoryName);
      let repositoryTextsPath = path.join(repositoryPath, 'texts.json');
      let patch = req.body;

      fs.readFile(repositoryTextsPath, 'utf8', function (err, data) {
        if (err) {
          return next(err);
        }

        let texts = JSON.parse(data);
        jsonPatch.apply(texts, patch);
        let newData = JSON.stringify(texts, null, 4);

        fs.writeFile(repositoryTextsPath, newData, 'utf8', function (err) {
          if (err) {
            return next(err);
          }

          Repository.open(repositoryPath)
            .then(repository => {
              let author = Signature.now(req.user.profile.displayName, req.user.profile.email);
              let committer = author;
              let message = patch.reduce((messages, patchEntry) => {
                if (patchEntry.op === 'add') messages.push(`add ${patchEntry.path}`);
                if (patchEntry.op === 'replace') messages.push(`update ${patchEntry.path}`);
                if (patchEntry.op === 'remove') messages.push(`remove ${patchEntry.path}`);
                if (patchEntry.op === 'move') messages.push(`move ${patchEntry.from} to $(patchEntry.path}`);

                return messages;
              }, []).join('\n');

              return repository.createCommitOnHead(['texts.json'], author, committer, message);
            })
            .done(oid => {
              res.json(oid);
            });
        });
      });
    } catch(ex) {
      next(ex);
    }
  };
}

export function makePostProjectRepositorySyncRouteHandler(basePath, path, url, getProject, simpleGit) {
  return async function (req, res, next) {
    try {
     let projectId = req.params.projectId;
     let project = await getProject(projectId);

     let repositoryName = req.params.projectId;
     let repositoryPath = path.join(basePath, req.user.id, repositoryName);

     let parsedRepositoryUrl = url.parse(project.repositoryUrl);
     parsedRepositoryUrl.auth = req.user.github.accessToken;
     let signedRepositoryUrl = url.format(parsedRepositoryUrl);

     simpleGit(repositoryPath)
       .pull(signedRepositoryUrl, 'master', (err, other) => {
         if (err)
           return next(err);
       })
       .push(signedRepositoryUrl, 'master', (err, other) => {
         if (err)
           return next(err);

         res.end();
       });
     }
     catch (ex) {
       next(ex);
     }
  };
}
