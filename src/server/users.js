import mongodb from 'mongodb';
const COLLECTION = 'users';

export function makeGetUser(db) {
	return async function getUser(userId) {
		return db.collection(COLLECTION).findOne({_id: mongodb.ObjectId(userId)});
	};
}

export function makeGetUserProfile(db) {
	return async function getUserProfile(userId) {
		return db.collection(COLLECTION).findOne({ _id: mongodb.ObjectId(userId) })
			.then(user => user.profile);
	};
}

export function makeUpdateUserProfile(db) {
	return async function updateUserProfile(userId, userProfile) {
		return db.collection(COLLECTION)
			.findAndModify(
				{ _id: mongodb.ObjectId(userId)},
				[],
				{ $set: { profile: userProfile } },
				{}
			)
			.then(result => result.value);
	};
}

export function makeGetUserRepositories(db) {
	return async function getUserProfile(userId) {
		return db.collection(COLLECTION).findOne({ _id: mongodb.ObjectId(userId) })
			.then(user => user.github.repositories || []);
	};
}

export function makeGetUserGitHubRepositories(GitHub) {
	return async function getUserGitHubRepositories(githubAccessToken) {
		try {
			let github = new GitHub({
				token: githubAccessToken,
				auth: 'oauth'
			});

			let user = github.getUser();
			let repos = await user.listRepos();

			return repos.data.map(repo => {
				 return {
					 name: repo.full_name,
					 url: repo.clone_url
				 }
			});
		} catch (err) {
			throw err;
		}
	};
}

export function makeGetUserSettings(db) {
	return async function getUserSettings(userId) {
		return db.collection(COLLECTION).findOne({ _id: mongodb.ObjectId(userId) })
			.then(user => user.settings || {
				columns: ['en']
			});
	};
}

export function makeUpdateUserGitHub(db) {
	return async function updateUserGitHub(github) {
		let $set = {
			github: github,
			'profile.displayName': github.profile.displayName,
		};

		if (github.profile._json.email) {
			$set['profile.email'] = github.profile._json.email;
		}

		return db.collection(COLLECTION)
			.findAndModify(
				{ 'github.userId': github.userId },
				[],
				{ $set: $set },
				{ new: true, upsert: true }
			)
			.then(result => result.value);
	};
}

export function makeUpdateUserSettings(db) {
	return async function updateUserSettings(userId, userSettings) {
		return db.collection(COLLECTION)
			.findAndModify(
				{ _id: mongodb.ObjectId(userId)},
				[],
				{ $set: { settings: userSettings } },
				{}
			)
			.then(result => result.value);
	};
}

export function makeGetUserProfileRouteHandler(getUserProfile) {
	return async (req, res, next) => {
		try {
			let userProfile = await getUserProfile(req.user._id);

			res.json(userProfile);
		} catch (err) {
			next(err);
		}
	};
}

export function makePostUserProfileRouteHandler(updateUserProfile) {
	return async (req, res, next) => {
		try {
			await updateUserProfile(req.user._id, req.body);
			res.end();
		} catch (err) {
			next(err);
		}
	};
}

export function makeGetUserRepositoriesRouteHandler(getUserRepositories) {
	return async (req, res, next) => {
		try {
			let repositories = await getUserRepositories(req.user._id);

			res.json(repositories);
		} catch (err) {
			next(err);
		}
	};
}

export function makeGetUserSettingsRouteHandler(getUserSettings) {
	return async (req, res, next) => {
		try {
			let userSettings = await getUserSettings(req.user._id);

			res.json(userSettings);
		} catch (err) {
			next(err);
		}
	};
}

export function makePostUserSettingsRouteHandler(updateUserSettings) {
	return async (req, res, next) => {
		try {
			await updateUserSettings(req.user._id, req.body);

			res.end();
		} catch (err) {
			next(err);
		}
	};
}
