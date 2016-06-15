import React from 'react';
import ReactDOM from 'react-dom';
import { Link, browserHistory } from 'react-router';
import { Button } from '../components/Button';
import { NavBar } from '../components/NavBar';
import { Container } from '../components/Container';
import { ProjectLayout } from './ProjectLayout';
import { del, get, put, post } from '../api';
import Octicon from 'react-octicon';
import { Form } from '../components/Forms';
import { Paragraph } from '../components/Paragraph';
import { Loading } from '../components/Loading';
import { Text } from '../components/Text';
import classnames from 'classnames';
import Shortcuts from 'react-shortcuts/component';
import AutosizeTextarea from 'react-autosize-textarea';

export async function getProject(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}`);
}

export async function getProjectSettings(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}/settings`);
}

export async function renameProject(projectIdOrName, newProjectName) {
	return post(`/api/projects/${projectIdOrName}/rename`, {newProjectName});
}

export async function deleteProject(projectIdOrName) {
	return del(`/api/projects/${projectIdOrName}`);
}

export async function updateProjectSettings(projectIdOrName, newProjectSettings) {
	return put(`/api/projects/${projectIdOrName}/settings`, newProjectSettings);
}

export class ProjectSettings extends React.Component	{
	constructor(props) {
		super(props);
		this.state = {};
		this.handleUpdateProjectSettingsFormSubmit = this.handleUpdateProjectSettingsFormSubmit.bind(this);
		this.handleDeleteProjectFormSubmit = this.handleDeleteProjectFormSubmit.bind(this);
		this.handleRenameProjectFormSubmit = this.handleRenameProjectFormSubmit.bind(this);
		this.handleProjectSettingsFormBlur = this.handleProjectSettingsFormBlur.bind(this);
		this.handleProjectSettingsFormChange = this.handleProjectSettingsFormChange.bind(this);
		this.fetch();
	}

	fetch () {
		getProject(this.props.params.projectName).then(project => {
			this.setState({project});
		});
	}

	handleDeleteProjectFormSubmit (event) {
		event.preventDefault();

		deleteProject(this.props.params.projectName).then(() => {
			browserHistory.push(`/projects`);
		});
	}

	handleRenameProjectFormSubmit (newProjectName, event) {
		event.preventDefault();

		renameProject(this.props.params.projectName, newProjectName).then(() => {
			browserHistory.push(`/projects/${newProjectName}/settings`);
		});
	}

	handleProjectSettingsFormBlur (event) {
		event.preventDefault();
		let project = this.state.project;

		if (typeof project.settings.languages === 'string') {
			project.settings.languages = project.settings.languages.split(/[\s\n,;]+/).filter(function(value) {
				return value !== null && value !== undefined && value !== '';
			});

			this.setState({project});
		}
	}

	handleProjectSettingsFormChange (event) {
		event.preventDefault();

		let project = this.state.project;
		project.settings.languages = event.target.value;

		this.setState({project});
	}

	handleUpdateProjectSettingsFormSubmit (event) {
		event.preventDefault();
		updateProjectSettings(this.props.params.projectName, this.state.project.settings);
	}

	render() {
		return (
			<ProjectLayout>
				<ProjectLayout.Header onProjectDropdownChange={this.props.handleProjectDropdownChange} selectedProject={this.props.project} projects={this.props.projects} />
				<ProjectLayout.Body project={this.props.project}>
					<Container>
						{ this.state.project ? <ProjectSettingsForm project={this.state.project} onBlur={this.handleProjectSettingsFormBlur} onChange={this.handleProjectSettingsFormChange} onSubmit={this.handleUpdateProjectSettingsFormSubmit} /> : <Loading /> }
						{ this.state.project ? <RenameProjectForm project={this.state.project} onSubmit={this.handleRenameProjectFormSubmit} /> : <Loading /> }
						{ this.state.project ? <DeleteProjectForm project={this.state.project} onSubmit={this.handleDeleteProjectFormSubmit} /> : <Loading /> }
					</Container>
				</ProjectLayout.Body>
				<ProjectLayout.Footer />
			</ProjectLayout>
		);

		return <Loading />
	}
}

export class RenameProjectForm extends React.Component	{
	constructor (props) {
		super(props);
		this.state = {
			newProjectName: props.project.name
		};

		this.handleNewProjectNameChange = this.handleNewProjectNameChange.bind(this);
	}

	componentWillUpdate (nextProps, nextState) {
		if (nextProps.project) {
			if (this.props.project !== nextProps.project) {
				let newProjectName = nextProps.project.name;
				this.setState({newProjectName});
			}
		}
	}

	handleNewProjectNameChange (event) {
		let newProjectName = event.target.value;
		this.setState({newProjectName});
	}

	render() {
		return (
			<Form onSubmit={this.props.onSubmit.bind(this, this.state.newProjectName)}>
				<Form.Header>Rename project</Form.Header>
				<Form.Body>
					<Paragraph>
						<label htmlFor="newProjectName">New project name</label>
						<input id="newProjectName" type="text" onChange={this.handleNewProjectNameChange} value={this.state.newProjectName} />
					</Paragraph>
					<RenameProjectButton />
				</Form.Body>
			</Form>
		);
	}
}

export class RenameProjectButton extends React.Component	{
	render() {
		return (
			<Button type="submit" color="primary" className="rename-project-button">Rename project</Button>
		);
	}
}

export class ProjectSettingsForm extends React.Component	{
	render () {
		return (
			<Form onSubmit={this.props.onSubmit.bind(this)}>
				<Form.Header>Project Settings</Form.Header>
				<Form.Body>
					<Paragraph>
						<label htmlFor="languages">Languages</label>
						<AutosizeTextarea id="languages" type="text" onChange={this.props.onChange} onBlur={this.props.onBlur} value={this.props.project.settings.languages} />
					</Paragraph>
					<UpdateProjectSettingsButton />
				</Form.Body>
			</Form>
		);
	}
}

export class UpdateProjectSettingsButton extends React.Component	{
	render() {
		return (
			<Button type="submit" color="primary" className="update-project-settings-button">Update Project Settings</Button>
		);
	}
}

export class DeleteProjectForm extends React.Component	{
	render() {
		return (
			<Form	className="danger" onSubmit={this.props.onSubmit.bind(this)}>
				<Form.Header>Delete project</Form.Header>
				<Form.Body>
					<Paragraph>Deleting the project will not delete the GitHub repository, but will only delete the project settings.</Paragraph>
					<DeleteProjectButton />
				</Form.Body>
			</Form>
		);
	}
}

export class DeleteProjectButton extends React.Component	{
	render() {
		return (
			<Button type="submit" color="primary" className="delete-project-button">Delete project</Button>
		);
	}
}
