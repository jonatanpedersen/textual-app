import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router';
import { Icon } from './components/Icon';
import * as api from './api';
import { NewProject, Projects, ProjectLayout, ProjectTexts, ProjectMetrics, ProjectSettings } from './projects';
import { UserProfile, UserSettings, UserLogout } from './user';
import { Home } from './home';
import { Layout } from './layout';

export function main () {
  let mainElement = document.getElementById('main');

  render((
    <Router history={browserHistory}>
      <Route path="/" component={Layout}>
        <IndexRoute component={Home}/>
        <Route path="/projects/new" component={NewProject} />
        <Route path="/projects">
          <IndexRoute component={Projects}/>
          <Route path="/projects/:projectName" component={ProjectLayout}>
            <IndexRoute component={ProjectTexts}/>
            <Route path="/projects/:projectName/metrics" component={ProjectMetrics} />
            <Route path="/projects/:projectName/settings" component={ProjectSettings} />
          </Route>
        </Route>
        <Route path="/user">
          <Route path="/user/profile" component={UserProfile} />
          <Route path="/user/settings" component={UserSettings} />
          <Route path="/user/logout" component={UserLogout} />
        </Route>
      </Route>
    </Router>
  ), mainElement);
}
