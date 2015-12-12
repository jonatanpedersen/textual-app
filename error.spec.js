import assert from 'assert';
import * as auth from './error';

describe('error.js', () => {
  describe('makeErrorMiddleware', () => {
    it ('returns a function named errorMiddleware', () => {
      let expected = 'errorMiddleware';
      let actual = auth.makeErrorMiddleware('/').name;

      assert.equal(expected, actual);
    });

    describe('errorMiddleware', () => {
      it ('calls res.status(500)', () => {
        let errorMiddleware = auth.makeErrorMiddleware('/');

        let expected = 500;
        let actual;

        let err = undefined;
        let req = {};
        let res = {
          status: (code) => {
            actual = code;

            return this;
          },
          send: (err) => {
            return this;
          }
        }
        let next = undefined;

        errorMiddleware(err, req, res, next);

        assert.equal(expected, actual);
      });

      it ('calls res.status(?).send(err)', () => {
        let errorMiddleware = auth.makeErrorMiddleware('/');

        let expected = '01f87de7be0f492aaeb42aff2c33f2d7';
        let actual;

        let err = expected;
        let req = {};
        let res = {
          status: (code) => {
            return {
              send: (err) => {
                actual = err;
              }
            };
          }
        }
        let next = undefined;

        errorMiddleware(err, req, res, next);

        assert.equal(expected, actual);
      });
    });
  });
});
