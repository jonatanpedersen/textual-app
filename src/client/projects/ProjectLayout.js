import React from 'react';
import { DefaultLayout } from '../components/DefaultLayout';
import { ProjectContent } from './ProjectContent';
import { ProjectSideBar } from './ProjectSideBar';
import { ProjectDropdown } from './ProjectDropdown';
import classnames from 'classnames';

export class ProjectLayout extends React.Component {
	render() {
		let className = classnames('project-layout', this.props.className);

		return (
			<DefaultLayout className={className}>
				{this.props.children}
			</DefaultLayout>
		);
	}
}

export class ProjectLayoutHeader extends React.Component {
	render() {
		let className = classnames('project-layout__header', this.props.className);

		return (
			<DefaultLayout.Header className={className}>
				{this.props.projects && this.props.selectedProject && <ProjectDropdown projects={this.props.projects} selectedProject={this.props.selectedProject} onChange={this.props.onProjectDropdownChange} />}
				{this.props.children}
			</DefaultLayout.Header>
		);
	}
}

export class ProjectLayoutBody extends React.Component {
	render() {
		let className = classnames('project-layout__body', this.props.className);

		return (
			<DefaultLayout.Body className={className}>
				{this.props.project && <ProjectSideBar project={this.props.project} isClosed={true} /> }
				<ProjectContent>
					{this.props.children}
				</ProjectContent>
			</DefaultLayout.Body>
		);
	}
}

export class ProjectLayoutFooter extends React.Component {
	render() {
		let className = classnames('project-layout__footer', this.props.className);

		return (
			<DefaultLayout.Footer className={className}>
				{this.props.children}
			</DefaultLayout.Footer>
		);
	}
}

ProjectLayout.Header = ProjectLayoutHeader;
ProjectLayout.Body = ProjectLayoutBody;
ProjectLayout.Footer = ProjectLayoutFooter;
