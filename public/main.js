import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, IndexRedirect, Link, browserHistory } from 'react-router';
import * as api from './api';
import { NewProject, Projects, Project, ProjectsLayout, ProjectTexts, ProjectMetrics, ProjectSettings } from './projects';
import { User, UserProfile, UserSettings } from './user';
import { Home } from './home';
import { Layout } from './layout';
import { Edit } from './edit';

export function main () {
  let mainElement = document.getElementById('main');

  render((
    <Router history={browserHistory}>
      <Route path="/" component={Layout}>
        <IndexRedirect to="/projects" />
        <Route path="/projects/new" component={NewProject} />
        <Route path="/projects" component={ProjectsLayout}>
          <IndexRoute component={Projects}/>
          <Route path="/projects/:projectName" component={Project}>
            <IndexRoute component={ProjectTexts}/>
            <Route path="/projects/:projectName/metrics" component={ProjectMetrics} />
            <Route path="/projects/:projectName/settings" component={ProjectSettings} />
          </Route>
        </Route>
        <Route path="/user" component={User} />
				<Route path="/edit" component={Edit} />
      </Route>
    </Router>
  ), mainElement);
}
