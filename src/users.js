import mongodb from 'mongodb';

export function makeGetUser(db) {
  return async function getUser(userId) {
    try {
      let users = db.collection('users');

      return new Promise(function(resolve, reject) {
        users.findOne({ _id: mongodb.ObjectId(userId) }, (err, user) => {
          if (err)
            reject(err);

          resolve(user);
        });
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetUserProfile(db) {
  return async function getUserProfile(userId) {
    try {    
      let users = db.collection('users');

      return new Promise(function(resolve, reject) {
        users.findOne({ _id: mongodb.ObjectId(userId) }, (err, user) => {
          if (err)
            reject(err);

          let userProfile = user.profile || {
            displayName: 'John Doe',
            email: 'john@doe'
          };

          resolve(userProfile);
        });
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeUpdateUserProfile(db) {
  return async function updateUserProfile(userId, userProfile) {
    try {
      let users = db.collection('users');

      return new Promise(function(resolve, reject) {
        users.findAndModify(
          { _id: mongodb.ObjectId(userId)},
          [],
          { $set: { profile: userProfile } },
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

export function makeGetUserRepositories(db) {
  return async function getUserProfile(userId) {
    try {
      let users = db.collection('users');

      return new Promise(function(resolve, reject) {
        users.findOne({ _id: mongodb.ObjectId(userId) }, (err, user) => {
          if (err)
            reject(err);

          let userRepositories = user.github.repositories || [];

          resolve(userRepositories);
        });
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetUserGitHubRepositories(github) {
  return async function getUserGitHubRepositories(githubAccessToken) {
    try {
      github.authenticate({
          type: 'oauth',
          token: githubAccessToken
      });

      return new Promise((resolve, reject) => {
        let repositories = [];

        getPage();

        function getPage(page = 1) {
          github.repos.getAll({per_page: 100, page: page}, (err, res) => {
            if (err)
              reject(err);

            repositories = repositories.concat(res
              .filter(r => {
                return r.permissions && r.permissions.pull && r.permissions.push;
              })
              .map(r => {
                return {
                  name: r.full_name,
                  url: r.clone_url
                }
              })
            );

            let regexp = /page=([0-9]*).*>; rel="next"/;
            let matches = res.meta.link.match(regexp);

            if (matches) {
              let page = parseInt(matches[1]);

              getPage(page);
            } else {
              resolve(repositories);
            }
          });
        }
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetUserSettings(db) {
  return async function getUserSettings(userId) {
    try {
      let users = db.collection('users');

      return new Promise((resolve, reject) => {
        users.findOne({ _id: mongodb.ObjectId(userId) }, (err, user) => {
          if (err)
            reject(err);

          let userSettings = user.settings || {
            columns: [
              'en'
            ]
          };

          resolve(userSettings);
        });
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeUpdateUserGitHub(db) {
  return async function updateUserGitHub(github) {
    try {
      let users = db.collection('users');

      return new Promise((resolve, reject) => {
        let $set = {
          github: github,
          'profile.displayName': github.profile.displayName,
        };

        if (github.profile._json.email) {
          $set['profile.email'] = github.profile._json.email;
        }

        users.findAndModify(
          { 'github.userId': github.userId },
          [],
          { $set: $set },
          { new: true, upsert: true },
          (err, updatedUsers) => {
            let updatedUser = updatedUsers.value;

            if (err)
              reject(err);

            resolve(updatedUser);
          }
        );
      });
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeUpdateUserSettings(db) {
  return async function updateUserSettings(userId, userSettings) {
    try {
      let users = db.collection('users');

      return new Promise((resolve, reject) => {
        users.findAndModify(
          { _id: mongodb.ObjectId(userId)},
          [],
          { $set: { settings: userSettings } },
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

export function makeGetUserProfileRouteHandler(getUserProfile) {
  return async (req, res, next) => {
    try {
      let userProfile = await getUserProfile(req.user.id);

      res.json(userProfile);
    } catch (ex) {
      next(ex);
    }
  };
}

export function makePostUserProfileRouteHandler(updateUserProfile) {
  return async (req, res, next) => {
    try {
      await updateUserProfile(req.user.id, req.body);
      res.end();
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetUserRepositoriesRouteHandler(getUserRepositories) {
  return async (req, res, next) => {
    try {
      let repositories = await getUserRepositories(req.user.id);

      res.json(repositories);
    } catch (ex) {
      next(ex);
    }
  };
}

export function makeGetUserSettingsRouteHandler(getUserSettings) {
  return async (req, res, next) => {
    try {
      let userSettings = await getUserSettings(req.user.id);

      res.json(userSettings);
    } catch (ex) {
      next(ex);
    }
  };
}

export function makePostUserSettingsRouteHandler(updateUserSettings) {
  return async (req, res, next) => {
    try {
      await updateUserSettings(req.user.id, req.body);

      res.end();
    } catch (ex) {
      next(ex);
    }
  };
}
