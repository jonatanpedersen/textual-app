import assert from 'assert';
import * as error from './error';

describe('error.js', () => {
  describe('makeErrorMiddleware', () => {
    it ('should return a function named errorMiddleware', () => {
      let expected = 'errorMiddleware';
      let actual = error.makeErrorMiddleware('/').name;

      assert.equal(expected, actual);
    });

    describe('errorMiddleware', () => {
      it ('should set response code 500', () => {
        let errorMiddleware = error.makeErrorMiddleware('/');

        let expected = 500;
        let actual;

        let err = undefined;
        let req = {};
        let res = {
          status: (code) => {
            actual = code;
          },
          send: (err) => {
          }
        }
        let next = undefined;

        errorMiddleware(err, req, res, next);

        assert.equal(expected, actual);
      });

      it ('should send err in response', () => {
        let errorMiddleware = error.makeErrorMiddleware('/');

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
