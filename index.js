import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import Git from 'nodegit';
import path  from 'path';
import simpleGit from 'simple-git';

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

  simpleGit().clone(repositoryUrl, repositoryPath, () => {
    res.end();
  });
});

app.post('/api/repository/:repositoryName/pull', (req, res, next) => {
  let repositoryName = req.params.repositoryName;
  let repositoryPath = getRepositoryPath(repositoryName);

  simpleGit(repositoryPath).pull((err) => {
    if (err)
      return next(err);

    res.end();
  });
});

app.post('/api/repository/:repositoryName/sync', (req, res, next) => {
  let repositoryName = req.params.repositoryName;
  let repositoryPath = getRepositoryPath(repositoryName);

  simpleGit(repositoryPath)
    .pull()
    .push('origin', 'master', (err) => {
      if (err)
        return next(err);

      res.end();
    });
});

app.post('/api/repository/:repositoryName/checkout', (req, res, next) => {
  let repositoryName = req.params.repositoryName;
  let repositoryPath = getRepositoryPath(repositoryName);

  simpleGit(repositoryPath)
    .checkout('./*', (err) => {
      if (err)
        return next(err);

      res.end();
    });
});

app.get('/api/repository/:repositoryName/status', (req, res, next) => {
  let repositoryName = req.params.repositoryName;
  let repositoryPath = getRepositoryPath(repositoryName);

  simpleGit(repositoryPath)
    .status((err, status) => {
      if (err)
        return next(err);

      res.json(status);
    });
});

app.post('/api/repository/:repositoryName/commit', (req, res, next) => {
  let repositoryName = req.params.repositoryName;
  let repositoryPath = getRepositoryPath(repositoryName);

  simpleGit(repositoryPath)
    .add('./*')
    .commit(req.body.message, (err) => {
      if (err)
        res.json(err);

      res.end();
    });
});

app.post('/api/repository/:repositoryName/push', async (req, res) => {
  let repositoryName = req.params.repositoryName;
  let repositoryPath = getRepositoryPath(repositoryName);

  simpleGit(repositoryPath)
    .push('origin', 'master', (err) => {
      if (err)
        res.json(err);

      res.end();
    });
});

let httpServer = http.createServer(app);

httpServer.listen(8080, () => { console.log('Listening on port 8080'); });
