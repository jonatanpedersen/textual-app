export async function connectToMongoDB(mongodb, connectionString) {
  return new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(connectionString, { server: { sslValidate: false } }, (err, db) => {
      if (err)
        reject(err);

      resolve(db);
    });
  });
}
