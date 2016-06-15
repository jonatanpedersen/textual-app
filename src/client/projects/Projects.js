import React from 'react';
import ReactDOM from 'react-dom';
import { Container } from '../components/Container';
import { DefaultLayout } from '../components/DefaultLayout';
import { Loading } from '../components/Loading';
import { ProjectsTable } from './ProjectsTable';
import { NewProjectButton } from './NewProjectButton';
import { get } from '../api';
import classnames from 'classnames';
import Shortcuts from 'react-shortcuts/component';
import { browserHistory } from 'react-router';

export class Projects extends React.Component {
	constructor(props) {
		super(props);
		this.state = { selectedProject: 0 };
		this.handleShortcuts = this.handleShortcuts.bind(this);
	}

	handleShortcuts (action, event) {
		event.preventDefault();
    switch (action) {
      case 'MOVE_UP': this.setState({selectedProject: Math.max(0, this.state.selectedProject - 1) }); break;
			case 'MOVE_DOWN': this.setState({selectedProject: Math.min(this.props.projects.length - 1, this.state.selectedProject + 1) }); break;
			case 'OPEN_PROJECT': browserHistory.push(`/projects/${this.props.projects[this.state.selectedProject].name}`); break;
      case 'NEW_PROJECT': browserHistory.push('/projects/new'); break;
		}
	}

	focusRef (component) {
		let domNode = ReactDOM.findDOMNode(component);
		if (domNode && domNode.focus) {
			domNode.focus();
		}
	}

	render () {
		let projects = this.props.projects;
		let selectedProject = this.state.selectedProject;

		if (projects) {
			return (
				<Shortcuts name="Projects" handler={this.handleShortcuts} ref={this.focusRef}>
					<DefaultLayout>
						<DefaultLayout.Header />
						<DefaultLayout.Body>
							<Container>
								<ProjectsTable selectedProject={selectedProject} projects={projects} />
								<NewProjectButton />
							</Container>
						</DefaultLayout.Body>
						<DefaultLayout.Footer />
					</DefaultLayout>
				</Shortcuts>
			);
		}

		return <Loading />
	}
}
