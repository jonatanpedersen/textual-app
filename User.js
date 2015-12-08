import mongodb from 'mongodb';

export async function getUser(db, userId) {
  let users = db.collection('users');

  return new Promise(function(resolve, reject) {
    users.findOne({ _id: mongodb.ObjectId(userId) }, (err, user) => {
      if (err)
        reject(err);

      resolve(user);
    });
  });
}

export async function updateUserGitHub(db, github) {
  let users = db.collection('users');

  return new Promise(function(resolve, reject) {
    users.findAndModify(
      { 'github.userId': github.userId },
      [],
      { $set: {
        github: github,
        'profile.displayName': github.profile.displayName,
        'profile.email': github.profile._json.email }
      },
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

export async function updateUserProfile(db, userId, userProfile) {
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

export async function updateUserSettings(db, userId, userSettings) {
  let users = db.collection('users');

  return new Promise(function(resolve, reject) {
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

export default { getUser,  updateUserGitHub, updateUserProfile, updateUserSettings }
