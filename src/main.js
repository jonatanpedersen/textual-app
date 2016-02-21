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
import config from 'cnf';
import url from 'url';
import mkdirp from 'mkdirp';
import jsonPatch from 'json-patch';
import * as auth from './auth';
import * as error from './error';
import * as projects from './projects';
import * as users from './users';
import GitHubApi from 'github';
import Github from 'github-api';
import mongodb from 'mongodb';
import { connectToMongoDB } from './mongodb';
import { makeSerializeUser, makeDeserializeUser, makeGitHubStrategyCallback } from './passport';

export async function main () {
  try {
    let app = express();
    let db = await connectToMongoDB(mongodb, config.mongodb.connectionString);

    passport.serializeUser(makeSerializeUser());
    passport.deserializeUser(makeDeserializeUser(users.makeGetUser(db)));
    passport.use(new GitHubStrategy({
        clientID: config.github.client_id,
        clientSecret: config.github.client_secret,
        callbackURL: config.github.callback_url
      },
      makeGitHubStrategyCallback(users.makeGetUserGitHubRepositories(new GitHubApi({version: '3.0.0'})), users.makeUpdateUserGitHub(db))
    ));

    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(session(config.session));
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
    app.post('/api/user/profile', users.makePostUserProfileRouteHandler(users.makeUpdateUserProfile(db)));
    app.get('/api/user/repositories', users.makeGetUserRepositoriesRouteHandler(users.makeGetUserRepositories(db)));
    app.get('/api/user/settings', users.makeGetUserSettingsRouteHandler(users.makeGetUserSettings(db)));
    app.post('/api/user/settings', users.makePostUserSettingsRouteHandler(users.makeUpdateUserSettings(db)));
    app.get('/api/projects', projects.makeGetProjectsRouteHandler(projects.makeGetProjects(db)));
    app.post('/api/projects', projects.makePostProjectsRouteHandler(projects.makeCreateProject(db)));
    app.get('/api/projects/:projectId/settings', projects.makeGetProjectSettingsRouteHandler(projects.makeGetProjectSettings(db)));
    app.post('/api/projects/:projectId/settings', projects.makePostProjectSettingsRouteHandler(projects.makeUpdateProjectSettings(db)));
    app.get('/api/projects/:projectId/repository/texts', projects.makeGetProjectRepositoryTextsRouteHandler(projects.makeGetProject(db), Github));
    app.patch('/api/projects/:projectId/repository/texts', projects.makePatchProjectRepositoryTextsRouteHandler(projects.makeGetProject(db), jsonPatch, Github));

    app.use('/', express.static('./public'));
    app.use('/*', express.static('./public/index.html'));

    app.use(error.makeErrorMiddleware());

    app.listen(config.port, () => {
      console.log(`textual-app listening on port ${config.port}`);
    });
  } catch (ex) {
    console.log(ex, ex.stack);
  }
}
