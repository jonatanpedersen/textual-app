import fs from 'fs';
import { Repository, Signature, Remote } from 'nodegit';

var path = require('path');

async function main () {
  try {
    var repoDir = './test/translator-app-texts';

    Repository.open(path.resolve(__dirname, repoDir))
      .then(repository => {
        let author = Signature.now('Jonatan Pedersen', 'jp@jonatanpedersen.com');
        let committer = author;
        let message = "Test";

        return repository.createCommitOnHead(['texts.json'], author, committer, message);
      })
      .done(() => {
        console.log("Done!");
      });

  } catch (ex) {
    console.error(ex, ex.stack);
  }
}

main();
