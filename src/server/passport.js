export function makeSerializeUser () {
  return async function serializeUser (user, callback) {
    try {
      let userId = user._id;
      callback(null, userId);
    } catch (err) {
      callback(err);
    }
  };
}

export function makeDeserializeUser (getUser) {
  return async function deserializeUser (userId, callback) {
    try {
      let user = await getUser(userId);
      user.id = user._id.toString();

      callback(null, user);
    } catch (err) {
      callback(err);
    }
  };
}

export function makeGitHubStrategyCallback (getUserGitHubRepositories, updateUserGitHub, isUserAuthorized) {
  return async function(accessToken, refreshToken, profile, callback) {
    try {
      let userGitHubRepositories = await getUserGitHubRepositories(accessToken);

			if (!isUserAuthorized(profile.username)) {
				throw new Error(`GitHub User '${profile.username}' Not Authorized`);
			}

      let user = await updateUserGitHub({
        userId: profile.id,
        profile: profile,
        accessToken: accessToken,
        refreshToken: refreshToken,
        repositories: userGitHubRepositories
      });

      return callback(null, user);
    } catch (err) {
      return callback();
    }
  };
}
