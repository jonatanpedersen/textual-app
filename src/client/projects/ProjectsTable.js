import React from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';
import Octicon from 'react-octicon';

export class ProjectsTable extends React.Component {
	render() {
		let projects = this.props.projects;

		let rows = projects && projects.map((project, idx) => (
			<ProjectsTableRow key={project._id} project={project} isSelected={this.props.selectedProject === idx} />
		));

		return (
			<table className="projects-table">
				<thead>
					<tr>
						<th className="project-name">Project Name</th>
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
		);
	}
}

class ProjectsTableRow extends React.Component {
	render() {
		let project = this.props.project;
		let trClassname = classnames('projects-table__row', { 'projects-table__row--selected': this.props.isSelected });

		return project && (
			<tr className={trClassname}>
				<td className="project-name">
					<Link to={`/projects/${project.name}`}>{project.name}</Link>
				</td>
			</tr>
		);
	}
}
