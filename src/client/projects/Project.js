import React from 'react';
import { get } from '../api';
import { browserHistory } from 'react-router';

export async function getProject(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}`);
}

export class Project extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.handleProjectDropdownChange = this.handleProjectDropdownChange.bind(this);
		this.fetch(props.params.projectName);
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.params.projectName !== this.props.params.projectName) {
			this.fetch(nextProps.params.projectName);
		}
	}

	fetch(projectName) {
		getProject(projectName).then(project => {
			this.setState({project});
		});
	}

	handleProjectDropdownChange (event) {
		let projectName = event.target.value;

		browserHistory.push(`/projects/${projectName}`);
	}

	render() {
		let children = this.props.children;
		let project = this.state.project;
		let projects = this.props.projects;
		let handleProjectDropdownChange = this.handleProjectDropdownChange;

		return (
			<div className="project">
				{children && React.cloneElement(children, { projects, project, handleProjectDropdownChange })}
			</div>
		);
	}
}
