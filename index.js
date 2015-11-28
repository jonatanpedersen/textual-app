import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import repositories from './data/repositories';
import Git from 'nodegit';
import path  from 'path';

function getRepositoryPath(repositoryName) {
  return path.join('./data/', repositoryName);
}

function getRepositoryTextsPath(repositoryName) {
  let repositoryPath = getRepositoryPath(repositoryName);

  return path.join(repositoryPath, 'texts.json');
}

let app = express();
app.use(bodyParser.json());

app.use('/', express.static('./public'));

app.get('/api/repository', (req, res) => {
  let repositoryNames = fs.readdirSync('./data/').filter(file => fs.statSync(path.join('./data/', file)).isDirectory());

  res.json(repositoryNames);
});

app.get('/api/repository/:repositoryName', (req, res, next) => {
  let repositoryName = req.params.repositoryName;
  let repositoryTextsPath = getRepositoryTextsPath(repositoryName);

  fs.readFile(repositoryTextsPath, 'utf8', function (err, data) {
    if (err)
      data = '{}';

    let texts = JSON.parse(data);

    res.json({
      repositoryName: repositoryName,
      texts: texts
    });
  });
});

app.post('/api/repository/:repositoryName', (req, res, next) => {
  let repositoryName = req.params.repositoryName;
  let repositoryTextsPath = getRepositoryTextsPath(repositoryName);
  let data = JSON.stringify(req.body.texts);

  fs.writeFile(repositoryTextsPath, data, 'utf8', function (err) {
    if (err)
      return next(err);

      res.end();
  });
});

app.post('/api/clone-repository', (req, res) => {
  let repositoryUrl = req.body.repositoryUrl;
  let repositoryName = req.body.repositoryName;
  let repositoryPath = getRepositoryPath(repositoryName);

  Git.Clone(repositoryUrl, repositoryPath).then((repository) => {
    res.end();
  })
});

app.post('/api/repository/:repositoryName/pull', (req, res) => {
  res.end();
});

app.post('/api/repository/:repositoryName/checkout', (req, res) => {
  res.end();
});

app.post('/api/repository/:repositoryName/commit', (req, res, next) => {
  let repositoryName = req.params.repositoryName;
  let repositoryPath = getRepositoryPath(repositoryName);

  Git.Repository.open(repositoryPath).then(repository => {
    let filesToAdd = ['texts.json'];
    let author = Git.Signature.now('Jonatan Pedersen', 'jp@jonatanpedersen.com');
    let committer = author;
    let message = req.body.message;

    repository.createCommitOnHead(filesToAdd, author, committer, message).catch(err => { console.log(err); return next(err); }).then(function(oid) {
      res.json(oid);
    });
  });
});

app.post('/api/repository/:repositoryName/push', async (req, res) => {
  try {
    let repositoryName = req.params.repositoryName;
    let repositoryPath = getRepositoryPath(repositoryName);

    let repository = await Git.Repository.open(repositoryPath);
    console.log(repository);

    let remotes = await Git.Remote.list(repository);
    let remote = await repository.getRemote('origin');
    console.log('remotes', remotes);


    remote.initCallbacks({
        credentials: function(url, userName) {
            return Git.Cred.sshKeyFromAgent(userName);
        }
    });

    await remote.connect(Git.Enums.DIRECTION.PUSH);

    console.log('remote Connected?', remote.connected());

    await remote.push(
      ["refs/heads/master:refs/heads/master"],
      null,
      repo.defaultSignature(),
      "Push to master"
    );

    console.log('remote Pushed!')
  }
  catch (ex) {
    console.log(ex);

    return next(ex);
  }
});

let httpServer = http.createServer(app);

httpServer.listen(8080, () => { console.log('Listening on port 8080'); });
