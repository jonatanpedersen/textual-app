import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import logger from 'express-logger';
import fs from 'fs';
import path  from 'path';
import simpleGit from 'simple-git';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github';
import config from 'cnf';
import connectEnsureLogin from 'connect-ensure-login';
import ejsLocals  from 'ejs-locals';
import url from 'url';
import mkdirp from 'mkdirp';

let users = {};
let projects = {};

let app = express();

passport.serializeUser(function(user, callback) {
  let userId = user.profile.id;

  callback(null, userId);
});

passport.deserializeUser(function(userId, callback) {
  let user = users[userId];

  callback(null, user);
});

passport.use(new GitHubStrategy({
    clientID: config.github.client_id,
    clientSecret: config.github.client_secret,
    callbackURL: config.github.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    users[profile.id] = users[profile.id] || {
      id: profile.id,
      github: {
        accessToken: accessToken,
        refreshToken: refreshToken
      },
      profile: profile
    };

    return done(null, users[profile.id]);
  }
));

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(logger(config.logger));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session(config.session));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.engine('ejs', ejsLocals);
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/about', function(req, res) {
    res.render('about');
});

app.get('/features', function(req, res) {
    res.render('features');
});

app.get('/help', function(req, res) {
    res.render('help');
});

app.get('/license', function(req, res) {
    res.render('license');
});

app.get('/pricing', function(req, res) {
    res.render('pricing');
});

app.use('/app', express.static('./public'));
app.use('/static', express.static('./static'));

app.get('/auth/github',
  passport.authenticate('github', { scope: 'repo' })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/app');
  }
);

app.get('/login', (req, res) => {
  res.redirect('/auth/github');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.use('/api', (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).end();
  }

  next();
});

app.get('/api/user', (req, res) => {
  let user = req.user;

  res.json(user.profile);
});

app.get('/api/repository', (req, res, next) => {
  let userPath = path.join('data', req.user.id);

  mkdirp(userPath, (err) => {
    if (err)
      return next(err);

      let repositoryNames = fs.readdirSync(userPath)
        .filter(file => fs.statSync(path.join(userPath, file)).isDirectory());

      res.json(repositoryNames);
  });
});

app.get('/api/repository/:repositoryName', (req, res, next) => {
  let repositoryName = req.params.repositoryName;
  let repositoryTextsPath = path.join('data', req.user.id, repositoryName, 'texts.json');

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
  let repositoryTextsPath = path.join('data', req.user.id, repositoryName, 'texts.json');
  let data = JSON.stringify(req.body.texts, null, 4);

  fs.writeFile(repositoryTextsPath, data, 'utf8', function (err) {
    if (err)
      return next(err);

      res.end();
  });
});

app.post('/api/clone-repository', (req, res, next) => {
  let repositoryUrl = req.body.repositoryUrl;
  let repositoryName = req.body.repositoryName;
  let repositoryPath = path.join('data', req.user.id, repositoryName);

  let parsedRepositoryUrl = url.parse(repositoryUrl);
  parsedRepositoryUrl.auth = req.user.github.accessToken;
  let signedRepositoryUrl = url.format(parsedRepositoryUrl);

  mkdirp(repositoryPath, (err) => {
    if (err)
      return next(err);

    simpleGit(repositoryPath)
      .init(false, (err) => {
        if (err)
          return next(err);
      })
      .addRemote('origin', repositoryUrl)
      .pull(signedRepositoryUrl, 'master', (err) => {
        if (err)
          return next(err);

        res.end();
      });
  });
});

// app.post('/api/repository/:repositoryName/pull', (req, res, next) => {
//   let repositoryName = req.params.repositoryName;
//   let repositoryPath = path.join('data', req.user.id, repositoryName);
//
//   let signedRepositoryUrl = '';
//
//   simpleGit(repositoryPath)
//     .getRemotes(true, function(err, remotes) {
//       let originRemote = remotes.filter((remote) => remote.name === 'origin')[0];
//       let parsedRepositoryUrl = url.parse(originRemote.refs.push);
//       parsedRepositoryUrl.auth = req.user.github.accessToken;
//       signedRepositoryUrl = url.format(parsedRepositoryUrl);
//
//       simpleGit(repositoryPath)
//         .pull(signedRepositoryUrl, 'master', (err) => {
//           if (err)
//             return next(err);
//
//           res.end();
//         });
//     });
// });

app.post('/api/repository/:repositoryName/sync', (req, res, next) => {
  let repositoryName = req.params.repositoryName;
  let repositoryPath = path.join('data', req.user.id, repositoryName);

  let signedRepositoryUrl = '';

  simpleGit(repositoryPath)
    .getRemotes(true, function(err, remotes) {
      let originRemote = remotes.filter((remote) => remote.name === 'origin')[0];
      let parsedRepositoryUrl = url.parse(originRemote.refs.push);
      parsedRepositoryUrl.auth = req.user.github.accessToken;
      signedRepositoryUrl = url.format(parsedRepositoryUrl);

      simpleGit(repositoryPath)
        .add('./*')
        .commit('updated texts', (err) => {
          if (err)
            return next(err);
        })
        .pull(signedRepositoryUrl, 'master', (err, other) => {
          if (err)
            return next(err);
        })
        .push(signedRepositoryUrl, 'master', (err, other) => {
          if (err)
            return next(err);

          res.end();
        });
    });
});

// app.post('/api/repository/:repositoryName/checkout', (req, res, next) => {
//   let repositoryName = req.params.repositoryName;
//   let repositoryPath = path.join('data', req.user.id, repositoryName);
//
//   simpleGit(repositoryPath)
//     .checkout('./*', (err) => {
//       if (err)
//         return next(err);
//
//       res.end();
//     });
// });

app.get('/api/repository/:repositoryName/status', (req, res, next) => {
  let repositoryName = req.params.repositoryName;
  let repositoryPath = path.join('data', req.user.id, repositoryName);

  simpleGit(repositoryPath)
    .status((err, status) => {
      if (err)
        return next(err);

      res.json(status);
    });
});

// app.post('/api/repository/:repositoryName/commit', (req, res, next) => {
//   let repositoryName = req.params.repositoryName;
//   let repositoryPath = path.join('data', req.user.id, repositoryName);
//
//   simpleGit(repositoryPath)
//     .add('./*')
//     .commit(req.body.message, (err) => {
//       if (err)
//         res.json(err);
//
//       res.end();
//     });
// });
//
// app.post('/api/repository/:repositoryName/push', async (req, res, next) => {
//   let repositoryName = req.params.repositoryName;
//   let repositoryPath = path.join('data', req.user.id, repositoryName);
//
//   let signedRepositoryUrl = '';
//
//   simpleGit(repositoryPath)
//     .getRemotes(true, function(err, remotes) {
//       let originRemote = remotes.filter((remote) => remote.name === 'origin')[0];
//       let parsedRepositoryUrl = url.parse(originRemote.refs.push);
//       parsedRepositoryUrl.auth = req.user.github.accessToken;
//       signedRepositoryUrl = url.format(parsedRepositoryUrl);
//
//       simpleGit(repositoryPath)
//         .push(signedRepositoryUrl, 'master', (err, other) => {
//           if (err)
//             return next(err);
//
//           res.end();
//         });
//     });
// });

app.use(async (err, req, res, next) => {
  console.error(err);
  res.status(500).send(err);
});

let httpServer = http.createServer(app);

httpServer.listen(config.port, () => { console.log(`Listening on port ${config.port}`); });
