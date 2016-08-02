import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, IndexRedirect, Link, browserHistory } from 'react-router';
import * as api from './api';
import { ProjectTexts } from './projects/ProjectTexts';
import { NewProject } from './projects/NewProject';
import { ProjectMetrics } from './projects/ProjectMetrics';
import { ProjectSettings } from './projects/ProjectSettings';
import { ProjectsLayout } from './projects/ProjectsLayout';
import { Projects } from './projects/Projects';
import { Project } from './projects/Project';
import { User } from './user/User';
import { Edit } from './edit';
import keymap from './keymap.json';
import ShortcutsManager from 'react-shortcuts';
import { Unauthorized } from './Unauthorized'

export function main () {
  let shortcutsManager = new ShortcutsManager(keymap);
  let mainElement = document.getElementById('main');

  render((
    <Main shortcutsManager={shortcutsManager}>
      <Router history={browserHistory}>
        <Route path="/">
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
  				<Route path="/unauthorized" component={Unauthorized} />
        </Route>
      </Router>
    </Main>
  ), mainElement);
}

class Main extends React.Component {
  getChildContext () {
    return {
      shortcuts: this.props.shortcutsManager
    };
  }

  render () {
    return (<main>
      {this.props.children}
    </main>);
  }
}

Main.childContextTypes = {
  shortcuts: React.PropTypes.object.isRequired
};
