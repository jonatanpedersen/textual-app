import React from 'react';
import { get } from '../api';

export async function getProjects() {
	return get('/api/projects');
}

export class ProjectsLayout extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.fetch();
	}

	fetch() {
		getProjects().then(projects => {
			this.setState({projects});
		});
	}

	render() {
		let children = this.props.children;
		let projects = this.state.projects;

		return (
			<div className="projects-layout">
        {children && React.cloneElement(children, { projects })}
			</div>
		);
	}
}
