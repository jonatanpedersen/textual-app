import http from 'http';
import https from 'https';
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
import assert from 'assert';
import jsonPatch from 'json-patch';
import projects from './projects';
import users from './users';
import MongoDB from './MongoDB';
import { Repository, Signature } from 'nodegit';
import GitHubApi from 'github';

async function main() {
  try {
    let app = express();
    let db = await MongoDB.connectToMongoDB(config.mongodb.connectionString);
    let github = new GitHubApi({version: '3.0.0'});

    passport.serializeUser((user, callback) => {
      let userId = user._id;
      callback(null, userId);
    });

    passport.deserializeUser(async (userId, callback) => {
      try {
        let getUser = users.makeGetUser(db);
        let user = await getUser(userId);
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
          let updateUserGitHub = users.makeUpdateUserGitHub(db);
          let user = await updateUserGitHub({
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

    app.use('/', express.static('./public'));

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

    app.get('/api/user/profile', users.makeGetUserProfileRouteHandler(users.makeGetUserProfile(db)));
    app.post('/api/user/profile', users.makePostUserProfileRouteHandler(users.makeUpdateUserProfile(db)));
    app.get('/api/user/repositories', users.makeGetUserRepositoriesRouteHandler(users.makeGetUserRepositories(github)));
    app.get('/api/user/settings', users.makeGetUserSettingsRouteHandler(users.makeGetUserSettings(db)));
    app.post('/api/user/settings', users.makePostUserSettingsRouteHandler(users.makeUpdateUserSettings(db)));
    app.get('/api/projects', projects.makeGetProjectsRouteHandler(projects.makeGetProjects(db)));
    app.post('/api/projects', projects.makePostProjectsRouteHandler(projects.makeCreateProject(db)));
    app.get('/api/projects/:projectId/settings', projects.makeGetProjectSettingsRouteHandler(projects.makeGetProjectSettings(db)));
    app.post('/api/projects/:projectId/settings', projects.makePostProjectSettingsRouteHandler(projects.makeUpdateProjectSettings(db)));

    app.get('/api/projects/:projectId/repository/texts', async (req, res, next) => {
      try {
        let getProject = projects.makeGetProject(db);
        let projectId = req.params.projectId;
        let project = await getProject(projectId);

        let repositoryName = projectId;
        let repositoryPath = path.join(config.data, req.user.id, repositoryName);

        try {
          let stats = fs.lstatSync(repositoryPath);
        } catch (e) {
          async function init () {
            return new Promise((resolve, reject) => {
              let parsedRepositoryUrl = url.parse(project.repositoryUrl);
              parsedRepositoryUrl.auth = req.user.github.accessToken;
              let signedRepositoryUrl = url.format(parsedRepositoryUrl);

              mkdirp(repositoryPath, (err) => {
                if (err)
                  throw err;

                simpleGit(repositoryPath)
                  .init(false, (err) => {
                    if (err)
                      throw err;
                  })
                  .addRemote('origin', project.repositoryUrl)
                  .pull(signedRepositoryUrl, 'master', (err) => {
                    if (err)
                      throw err;

                    return resolve();
                  });
              });
            });
          }

          await init();
        }

        let repositoryTextsPath = path.join(repositoryPath, 'texts.json');

        fs.readFile(repositoryTextsPath, 'utf8', function (err, data) {
          if (err) {
            return next(err);
          }

          try {
            let texts = JSON.parse(data);

            res.json(texts);
          }
          catch (ex) {
            return next(ex);
          }
        });
      } catch (ex) {
        return next(ex);
      }
    });

    app.patch('/api/projects/:projectId/repository/texts', (req, res, next) => {
      let repositoryName = req.params.projectId;
      let repositoryPath = path.join(config.data, req.user.id, repositoryName);
      let repositoryTextsPath = path.join(repositoryPath, 'texts.json');
      let patch = req.body;

      fs.readFile(repositoryTextsPath, 'utf8', function (err, data) {
        if (err) {
          return next(err);
        }

        try {
          let texts = JSON.parse(data);
          jsonPatch.apply(texts, patch);
          let newData = JSON.stringify(texts, null, 4);

          fs.writeFile(repositoryTextsPath, newData, 'utf8', function (err) {
            if (err) {
              return next(err);
            }

            Repository.open(repositoryPath)
              .then(repository => {
                let author = Signature.now(req.user.profile.displayName, req.user.profile.email);
                let committer = author;
                let message = patch.reduce((messages, patchEntry) => {
                  if (patchEntry.op === 'add') messages.push(`add ${patchEntry.path}`);
                  if (patchEntry.op === 'replace') messages.push(`update ${patchEntry.path}`);
                  if (patchEntry.op === 'remove') messages.push(`remove ${patchEntry.path}`);
                  if (patchEntry.op === 'move') messages.push(`move ${patchEntry.from} to $(patchEntry.path}`);

                  return messages;
                }, []).join('\n');

                return repository.createCommitOnHead(['texts.json'], author, committer, message);
              })
              .done(oid => {
                res.json(oid);
              });
          });
        }
        catch(ex) {
          next(ex);
        }
      });
    });

    app.post('/api/projects/:projectId/repository/sync', async (req, res, next) => {
      let getProject = projects.makeGetProject(db);
      let projectId = req.params.projectId;
      let project = await getProject(projectId);

      let repositoryName = req.params.projectId;
      let repositoryPath = path.join(config.data, req.user.id, repositoryName);

      let parsedRepositoryUrl = url.parse(project.repositoryUrl);
      parsedRepositoryUrl.auth = req.user.github.accessToken;
      let signedRepositoryUrl = url.format(parsedRepositoryUrl);

      simpleGit(repositoryPath)
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

    app.use(async (err, req, res, next) => {
      console.error(err, err.stack);
      res.status(500).send(err);
    });

    let httpServer = http.createServer(app);
    let httpsServer = https.createServer({
      ca: config.ssl.ca.map(path => fs.readFileSync(path, 'utf8')),
      key: fs.readFileSync(config.ssl.key, 'utf8'),
      cert: fs.readFileSync(config.ssl.cert, 'utf8'),
      passphrase: config.ssl.passphrase
    }, app);

    httpServer.listen(80, () => { console.log('Listening on port 80'); });
    httpsServer.listen(443, () => { console.log('Listening on port 443'); });
  } catch (ex) {
    console.log(ex, ex.stack);
  }
}

main();
