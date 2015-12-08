import mongodb from 'mongodb';

export async function connectToMongoDB(connectionString) {
  return new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(connectionString, { server: { sslValidate: false } }, (err, db) => {
      if (err)
        reject(err);

      resolve(db);
    });
  });
}

export default { connectToMongoDB }
