import http from 'http';
import https from 'https';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import fs from 'fs';
import path  from 'path';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github';
import cnf from 'cnf';
import url from 'url';
import mkdirp from 'mkdirp';
import jsonPatch from 'json-patch';
import * as auth from './auth';
import * as error from './error';
import * as projects from './projects';
import * as users from './users';
import GitHub from 'github-api';
import mongodb from 'mongodb';
import { connectToMongoDB } from './mongodb';
import { makeSerializeUser, makeDeserializeUser, makeGitHubStrategyCallback } from './passport';

export async function main () {
  try {
    let app = express();
    let db = await connectToMongoDB(mongodb, cnf.mongodb.connectionString);

    passport.serializeUser(makeSerializeUser());
    passport.deserializeUser(makeDeserializeUser(users.makeGetUser(db)));
    passport.use(new GitHubStrategy({
        clientID: cnf.github.client_id,
        clientSecret: cnf.github.client_secret,
        callbackURL: cnf.github.callback_url
      },
      makeGitHubStrategyCallback(users.makeGetUserGitHubRepositories(GitHub), users.makeUpdateUserGitHub(db), (user) => cnf.github.authorizedUsers.indexOf(user) > -1)
    ));

    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(session(cnf.session));
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/login', auth.makeLoginRouteHandler('/auth/github'));
    app.get('/logout', auth.makeLogoutRouteHandler('/'));
    app.get('/auth/github', auth.makeAuthGithubRouteHandler(passport));
    app.get('/auth/github/callback',
      auth.makeAuthGithubCallbackMiddleware(passport, '/'),
      auth.makeAuthGithubCallbackRouteHandler('/')
    );

    app.use('/api', auth.makeIsAuthenticatedMiddleware());
    app.get('/api/user/profile', users.makeGetUserProfileRouteHandler(users.makeGetUserProfile(db)));
    app.put('/api/user/profile', users.makePostUserProfileRouteHandler(users.makeUpdateUserProfile(db)));
    app.get('/api/user/repositories', users.makeGetUserRepositoriesRouteHandler(users.makeGetUserRepositories(db)));
    app.get('/api/user/settings', users.makeGetUserSettingsRouteHandler(users.makeGetUserSettings(db)));
    app.put('/api/user/settings', users.makePostUserSettingsRouteHandler(users.makeUpdateUserSettings(db)));
    app.get('/api/projects', projects.createGetProjectsRouteHandler(projects.createGetProjectsByRepositoryUrls(db), users.makeGetUserRepositories(db)));
    app.post('/api/projects', projects.createPostProjectsRouteHandler(projects.createCreateProject(db)));
    app.get('/api/projects/:projectIdOrName', projects.createGetProjectRouteHandler(projects.createGetProjectId(db), projects.createGetProject(db)));
    app.get('/api/projects/:projectIdOrName/settings', projects.createGetProjectSettingsRouteHandler(projects.createGetProjectId(db), projects.createGetProjectSettings(db)));
    app.post('/api/projects/:projectIdOrName/rename', projects.createPostProjectRenameRouteHandler(projects.createGetProjectId(db), projects.createRenameProject(db)));
    app.delete('/api/projects/:projectIdOrName', projects.createDeleteProjectRouteHandler(projects.createGetProjectId(db), projects.createDeleteProject(db)));
    app.put('/api/projects/:projectIdOrName/settings', projects.createPostProjectSettingsRouteHandler(projects.createGetProjectId(db), projects.createUpdateProjectSettings(db)));
    app.get('/api/projects/:projectIdOrName/texts', projects.createGetProjectTextsRouteHandler(projects.createGetProjectId(db), projects.createGetProject(db), GitHub));
    app.patch('/api/projects/:projectIdOrName/texts', projects.createPatchProjectTextsRouteHandler(projects.createGetProjectId(db), projects.createGetProject(db), jsonPatch, GitHub));

    app.use('/', express.static('./public'));
    app.use('/*', express.static('./public/index.html'));

    app.use(error.makeErrorMiddleware());

    app.listen(cnf.port, () => {
      console.log(`textual-app listening on port ${cnf.port}`);
    });
  } catch (ex) {
    console.log(ex, ex.stack);
  }
}
