import assert from 'assert';
import * as auth from './auth';

describe('auth.js', () => {
  describe('makeLoginRouteHandler', () => {
    it ('throws error when no redirectUrl argument is provided', () => {
      assert.throws(() => {
          auth.makeLoginRouteHandler();
        },
        Error
      );
    });

    it ('returns a function named loginRouteHandler', () => {
      let expected = 'loginRouteHandler';
      let actual = auth.makeLoginRouteHandler('/').name;

      assert.equal(expected, actual);
    });

    describe('loginRouteHandler', () => {
      it ('redirects to provided redirectUrl', () => {
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
});
