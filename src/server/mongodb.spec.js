import assert from 'assert';
import { connectToMongoDB } from './mongodb';

describe('mongodb.js', () => {
  describe('connectToMongoDB', () => {
    it ('should return resolved Promise when connection succeed', async () => {
      let mongodb = {
        MongoClient: {
          connect: (connectionString, options, callback) => {
            callback(null, {});
          }
        }
      }

      let connectionString = 'mongodb://localhost:27017/test';

      let expected = true;
      let actual;

      await connectToMongoDB(mongodb, connectionString)
        .then(() => {
          actual = true;
        }, () => {
          actual = false;
        });

      assert.equal(expected, actual);
    });

    it ('should return rejected Promise when connection fail', async () => {
      let mongodb = {
        MongoClient: {
          connect: (connectionString, options, callback) => {
            callback(new Error());
          }
        }
      }

      let connectionString = 'mongodb://localhost:27017/test';

      let expected = false;
      let actual;

      await connectToMongoDB(mongodb, connectionString)
        .then(() => {
          actual = true;
        }, () => {
          actual = false;
        });

      assert.equal(expected, actual);
    });

    it ('should use sslValidate = false as option', async () => {
      let expected = false;
      let actual;

      let mongodb = {
        MongoClient: {
          connect: (connectionString, options, callback) => {
            actual = options.server.sslValidate;

            callback(null, {});
          }
        }
      }

      let connectionString = 'mongodb://localhost:27017/test';

      await connectToMongoDB(mongodb, connectionString);

      assert.equal(expected, actual);
    });
  });
});
