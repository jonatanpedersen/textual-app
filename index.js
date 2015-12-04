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
import mongodb from 'mongodb';

async function connectToMongoDB(connectionString) {
  return new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(connectionString, (err, db) => {
      if (err)
        reject(err);

      resolve(db);
    });
  });
}

async function getUser(db, userId) {
  let users = db.collection('users');

  return new Promise(function(resolve, reject) {
    users.findOne({ _id: mongodb.ObjectId(userId) }, (err, user) => {
      if (err)
        reject(err);

      resolve(user);
    });
  });
}

async function updateUserGitHub(db, github) {
  let users = db.collection('users');

  return new Promise(function(resolve, reject) {
    users.findAndModify(
      { 'github.userId': github.userId },
      [],
      { $set: {
        github: github,
        'profile.displayName': github.profile.displayName }
      },
      { new: true, upsert: true },
      (err, updatedUsers) => {
        let updatedUser = updatedUsers.value;

        if (err)
          reject(err);

        resolve(updatedUser);
      }
    );
  });
}

async function updateUserProfile(db, userId, userProfile) {
  let users = db.collection('users');

  return new Promise(function(resolve, reject) {
    users.findAndModify(
      { _id: mongodb.ObjectId(userId)},
      [],
      { $set: { profile: userProfile } },
      {},
      (err) => {
        if (err)
          reject(err);

        resolve();
      }
    );
  });
}

async function updateUserSettings(db, userId, userSettings) {
  let users = db.collection('users');

  return new Promise(function(resolve, reject) {
    users.findAndModify(
      { _id: mongodb.ObjectId(userId)},
      [],
      { $set: { settings: userSettings } },
      {},
      (err) => {
        if (err)
          reject(err);

        resolve();
      }
    );
  });
}


async function main() {
  let db = await connectToMongoDB(config.mongodb.connectionString);
  let app = express();

  passport.serializeUser((user, callback) => {
    let userId = user._id;
    callback(null, userId);
  });

  passport.deserializeUser(async (userId, callback) => {
    try {
      let user = await getUser(db, userId);
      user.id = user._id.toString();

      callback(null, user);
    } catch (ex) {
      callback(ex);
    }
  });

  passport.use(new GitHubStrategy({
      clientID: config.github.client_id,
      clientSecret: config.github.client_secret,
      callbackURL: config.github.callback_url
    },
    async function(accessToken, refreshToken, profile, done) {
      try {
        let user = await updateUserGitHub(db, {
          userId: profile.id,
          profile: profile,
          accessToken: accessToken,
          refreshToken: refreshToken
        });

        return done(null, user);
      } catch (ex) {
        return done(ex);
      }
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

  app.get('/api/user/profile', (req, res) => {
    let user = req.user;

    res.json(user.profile);
  });

  app.post('/api/user/profile', async (req, res, next) => {
    try {
      await updateUserProfile(db, req.user.id, req.body);
      res.end();
    } catch (ex) {
      next(ex);
    }
  });

  app.get('/api/user/settings', (req, res) => {
    let user = req.user;

    res.json(user.settings);
  });

  app.post('/api/user/settings', async (req, res, next) => {
    try {
      await updateUserSettings(db, req.user.id, req.body);
      res.end();
    } catch (ex) {
      next(ex);
    }
  });

  app.get('/api/repository', (req, res, next) => {
    let userPath = path.join(config.data, req.user.id);

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
    let repositoryTextsPath = path.join(config.data, req.user.id, repositoryName, 'texts.json');

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
    let repositoryTextsPath = path.join(config.data, req.user.id, repositoryName, 'texts.json');
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
    let repositoryPath = path.join(config.data, req.user.id, repositoryName);

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

  app.post('/api/repository/:repositoryName/sync', (req, res, next) => {
    let repositoryName = req.params.repositoryName;
    let repositoryPath = path.join(config.data, req.user.id, repositoryName);

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

  app.get('/api/repository/:repositoryName/status', (req, res, next) => {
    let repositoryName = req.params.repositoryName;
    let repositoryPath = path.join(config.data, req.user.id, repositoryName);

    simpleGit(repositoryPath)
      .status((err, status) => {
        if (err)
          return next(err);

        res.json(status);
      });
  });

  app.use(async (err, req, res, next) => {
    console.error(err, err.stack);
    res.status(500).send(err);
  });

  let httpServer = http.createServer(app);

  httpServer.listen(config.port, () => { console.log(`Listening on port ${config.port}`); });

}

main();
