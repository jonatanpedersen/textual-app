import React from 'react';

export class ProjectDropdown extends React.Component {
	render() {
		let projects = this.props.projects || [];
		let selectedProject = this.props.selectedProject || {};
		let onChange = this.props.onChange;
		return (
			<select className="project-dropdown" value={selectedProject.name} onChange={onChange}>
			{
				projects.map(project => {
					return <option key={project.name} value={project.name}>{project.name}</option>;
				})
			}
			</select>
		);
	}
}
