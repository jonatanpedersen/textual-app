import mongodb from 'mongodb';

export function makeGetUser(db) {
  return async function getUser(userId) {
    let users = db.collection('users');

    return new Promise(function(resolve, reject) {
      users.findOne({ _id: mongodb.ObjectId(userId) }, (err, user) => {
        if (err)
          reject(err);

        resolve(user);
      });
    });
  }
}

export function makeGetUserProfile(db) {
  return async function getUserProfile(userId) {
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
  }
}

export function makeUpdateUserProfile(db) {
  return async function updateUserProfile(userId, userProfile) {
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
  }
}

export function makeGetUserRepositories(db) {
  return async function getUserProfile(userId) {
    let users = db.collection('users');

    return new Promise(function(resolve, reject) {
      users.findOne({ _id: mongodb.ObjectId(userId) }, (err, user) => {
        if (err)
          reject(err);

        let userRepositories = user.github.repositories || [];

        resolve(userRepositories);
      });
    });
  }
}

export function makeGetUserGitHubRepositories(github) {
  return async function getUserGitHubRepositories(githubAccessToken) {
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
  };
}

export function makeGetUserSettings(db) {
  return async function getUserSettings(userId) {
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
  }
}

export function makeUpdateUserGitHub(db) {
  return async function updateUserGitHub(github) {
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
  }
}

export function makeUpdateUserSettings(db) {
  return async function updateUserSettings(userId, userSettings) {
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
  }
}

export function makeGetUserProfileRouteHandler(getUserProfile) {
  return async (req, res, next) => {
    let userProfile = await getUserProfile(req.user.id);

    res.json(userProfile);
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
    let userSettings = await getUserSettings(req.user.id);

    res.json(userSettings);
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
