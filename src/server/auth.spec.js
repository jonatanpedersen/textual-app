import assert from 'assert';
import * as auth from './auth';

describe('auth.js', () => {
  describe('makeLoginRouteHandler', () => {
    it ('should throw an error when no redirectUrl argument is provided', () => {
      assert.throws(() => {
          auth.makeLoginRouteHandler();
        },
        Error
      );
    });

    it ('should return a function named loginRouteHandler', () => {
      let expected = 'loginRouteHandler';
      let actual = auth.makeLoginRouteHandler('/').name;

      assert.equal(expected, actual);
    });

    describe('loginRouteHandler', () => {
      it ('should redirect to provided redirectUrl', () => {
        let redirectUrl = '/';
        let loginRouteHandler = auth.makeLoginRouteHandler(redirectUrl);

        let expected = redirectUrl;
        let actual;

        let req = {};
        let res = {
          redirect: (redirectUrl) => {
            actual = redirectUrl;
          }
        }

        loginRouteHandler(req, res);

        assert.equal(expected, actual);
      });
    });
  });

  describe('makeLogoutRouteHandler', () => {
    it ('should throw an error when no redirectUrl argument is provided', () => {
      assert.throws(() => {
          auth.makeLogoutRouteHandler();
        },
        Error
      );
    });

    it ('should return a function named logoutRouteHandler', () => {
      let expected = 'logoutRouteHandler';
      let actual = auth.makeLogoutRouteHandler('/').name;

      assert.equal(expected, actual);
    });

    describe('logoutRouteHandler', () => {
      it ('should logout', () => {
        let redirectUrl = '/';
        let logoutRouteHandler = auth.makeLogoutRouteHandler(redirectUrl);

        let expected = true;
        let actual;

        let req = {
          logout: () => {
            actual = true;
          }
        };
        let res = {
          redirect: (redirectUrl) => { }
        }

        logoutRouteHandler(req, res);

        assert.equal(expected, actual);
      });

      it ('should redirect to provided redirectUrl', () => {
        let redirectUrl = '/';
        let logoutRouteHandler = auth.makeLogoutRouteHandler(redirectUrl);

        let expected = redirectUrl;
        let actual;

        let req = {
          logout: () => {}
        };

        let res = {
          redirect: (redirectUrl) => {
            actual = redirectUrl;
          }
        }

        logoutRouteHandler(req, res);

        assert.equal(expected, actual);
      });
    });
  });
});
