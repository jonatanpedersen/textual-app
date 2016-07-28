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
  return passport.authenticate('github', { scope: 'repo' });
}

export function makeAuthGithubCallbackMiddleware (passport, failureRedirect) {
  return passport.authenticate('github', { failureRedirect: failureRedirect });
}

export function makeAuthGithubCallbackRouteHandler (redirectUrl) {
  return function (req, res) {
    res.redirect(redirectUrl);
  }
}

export function makeIsAuthenticatedMiddleware () {
  return function isAuthenticatedMiddleware (req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).end();
    }

    next();
  }
}
