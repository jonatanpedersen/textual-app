export function makeGenerateToken (jsonwebtoken, secret) {
  return function generateToken(userId) {
    return jsonwebtoken.sign({userId}, secret);
  }
}

export function makeLoginRouteHandler (redirectUrl) {
  if (typeof redirectUrl !== 'string') {
    throw new TypeError('redirectUrl is not a string');
  }

  return function loginRouteHandler (req, res) {
    res.redirect(redirectUrl);
  }
}

export function makeLogoutRouteHandler (redirectUrl) {
  if (typeof redirectUrl !== 'string') {
    throw new TypeError('redirectUrl is not a string');
  }

  return function logoutRouteHandler (req, res) {
     req.logout();
     res.redirect(redirectUrl);
  }
}

export function makeAuthGithubRouteHandler (passport) {
  return passport.authenticate('github', { session: false, scope: 'repo' });
}

export function makeAuthGithubCallbackMiddleware (passport, failureRedirect) {
  return passport.authenticate('github', { session: false, failureRedirect: failureRedirect });
}

export function makeAuthGithubCallbackRouteHandler (generateToken, redirectUrl) {
  return function (req, res) {
    let token = generateToken(req.user._id);
    res.cookie('jwt', token, { maxAge: 1000 * 60 * 20 });
    res.redirect(redirectUrl);
  }
}

export function makeAuthJwtMiddleware (passport) {
  return passport.authenticate('jwt', { session: false });
}

export function makeIsAuthenticatedMiddleware () {
  return function isAuthenticatedMiddleware (req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).end();
    }

    next();
  }
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

export function makeJwtStrategyCallback (getUser) {
  return async function(token, callback) {
    try {
      let userId = token.userId;
      let user = await getUser(userId);

      return callback(null, user);
    } catch (err) {
      return callback(err);
    }
  };
}

export function fromCookie() {
  return function (req) {

    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies['jwt'];
    }

    return token;
  }
};
