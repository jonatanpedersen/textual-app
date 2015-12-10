import mongodb from 'mongodb';

export default {
  makeCreateProject,
  makeGetProject,
  makeGetProjects,
  makeGetProjectSettings,
  makeUpdateProjectSettings,
  makePostProjectsRouteHandler,
  makeGetProjectsRouteHandler,
  makeGetProjectSettingsRouteHandler,
  makePostProjectSettingsRouteHandler
}

export function makeCreateProject (db) {
  return async function createProject (projectName, repositoryUrl) {
    let projects = db.collection('projects');

    return new Promise((resolve, reject) => {
      projects.insert({
        name: projectName,
        repositoryUrl: repositoryUrl,
        setttings: {
          languages: ['en']
        }
      }, (err, res) => {
        if (err)
          reject(err);

        let projectId = res.insertedIds[0];

        resolve(projectId);
      });
    });
  };
}

export function makeGetProject (db) {
  return async function getProject (projectId) {
    let projects = db.collection('projects');

    return new Promise((resolve, reject) => {
      projects.findOne({ _id: mongodb.ObjectId(projectId) }, (err, project) => {
        if (err)
          reject(err);

        resolve(project);
      });
    });
  };
}

export function makeGetProjects (db) {
  return async function getProjects () {
    let projects = db.collection('projects');

    return new Promise((resolve, reject) => {
      projects.find({}, (err, projects) => {
        if (err)
          reject(err);

        resolve(projects.toArray());
      });
    });
  };
}

export function makeGetProjectSettings (db) {
  return async function getProjectSettings (projectId) {
    let projects = db.collection('projects');

    return new Promise((resolve, reject) => {
      projects.findOne({ _id: mongodb.ObjectId(projectId) }, (err, project) => {
        if (err)
          reject(err);

        resolve(project.settings);
      });
    });
  };
}

export function makeUpdateProjectSettings (db) {
  return async function updateProjectSettings (projectId, projectSettings) {
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
