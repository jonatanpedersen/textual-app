import React from 'react';
import { render } from 'react-dom';
import { Link, browserHistory } from 'react-router';
import { Icon } from './components/Icon';
import { get, put, post } from './api';
import { getUserRepositories } from './user';

export function getProjects() {
	return get('/api/projects');
}

export function getProject(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}`);
}

export function createProject(newProject) {
	return post('/api/projects', newProject);
}

export function getProjectSettings(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}/settings`);
}

export function renameProject(projectIdOrName, newProjectName) {
	return post(`/api/projects/${projectIdOrName}/rename`, {newProjectName});
}

export function updateProjectSettings(projectIdOrName, newProjectSettings) {
	return put(`/api/projects/${projectIdOrName}/settings`, newProjectSettings);
}

export function getProjectTexts(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}/texts`);
}

export function updateProjectTexts(projectIdOrName, newProjectTexts) {
	return put(`/api/projects/${projectIdOrName}/texts`, newProjectTexts);
}

export class NewProject extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			projectName: '',
			repositoryUrl: '',
			userRepositories: [],
			selectedUserRepository: ''
		};

		this.handleProjectNameChange = this.handleProjectNameChange.bind(this);
		this.handleRepositoryUrlChange = this.handleRepositoryUrlChange.bind(this);
		this.handleUserRepositoryChange = this.handleUserRepositoryChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		this.fetch();
	}

	fetch () {
		getUserRepositories().then(userRepositories => {
			this.setState({userRepositories});
		});
	}

	handleProjectNameChange (event) {
		this.setState({projectName: event.target.value});
	}

	handleRepositoryUrlChange (event) {
		this.setState({repositoryUrl: event.target.value});
	}

	handleUserRepositoryChange (event) {
		this.setState({repositoryUrl: event.target.value});
	}

	handleSubmit (event) {
			event.preventDefault();

			let projectName = this.state.projectName;
			let repositoryUrl = this.state.repositoryUrl;

			createProject({projectName, repositoryUrl}).then(() => {
				browserHistory.push(`/projects/${projectName}`);
			})
	}

	render() {
		return (
			<div className="container">
				<h2>New project</h2>
				<form className="createProjectForm" onSubmit={this.handleSubmit}>
					<p className="form-group">
						<label htmlFor="projectName">Project name</label>
						<input id="projectName" type="text" value={this.state.projectName} onChange={this.handleProjectNameChange} className="form-control" />
						<tooltip>e.g. <span>textual-app</span></tooltip>
					</p>
					<p className="form-group">
						<label htmlFor="userRepository">Pick a repository from the list, or write the url below</label>
						<select className="form-control" value={this.state.selectedUserRepository} onChange={this.handleUserRepositoryChange}>
						{
							this.state.userRepositories.map(userRepository => {
								return <option key={userRepository.url} value={userRepository.url}>{userRepository.url}</option>;
							})
						}
						</select>
					</p>
					<p className="form-group">
						<label htmlFor="repositoryUrl">Repository url</label>
						<input id="repositoryUrl" type="uri" value={this.state.repositoryUrl} onChange={this.handleRepositoryUrlChange} className="form-control" required />
						<tooltip>e.g. <span>https://github.com/jonatanpedersen/textual-app-texts.git</span></tooltip>
					</p>
					<p className="form-group">
						<button type="submit" className="btn btn-primary">Create project</button>
					</p>
				</form>
			</div>
		);
	}
}

export class NewProjectButton extends React.Component {
	render () {
		return <Link to='/projects/new'><Icon name="plus" /> New Project</Link>
	}
}

export class Projects extends React.Component {
	constructor(props) {
		super(props);

		this.state = {projects: []};

		getProjects().then(projects => {
			this.setState({projects});
		});
	}
	render() {
		return (
			<div className="container">
				<h1>Projects</h1>
				<ul>
					{this.state.projects.map(project => (
						<li key={project._id}><Link to={`/projects/${project.name}`}>{project.name}</Link></li>
					))}
				</ul>
				<p>
					<NewProjectButton />
				</p>
			</div>
		);
	}
}

export class ProjectLayout extends React.Component {
	constructor(props) {
		super(props);

		this.state = {project: {}};

		getProject(this.props.params.projectName).then(project => {
			this.setState({project});
		});
	}

	render() {
		return (
			<div className="layout-body">
				<nav className="sidebar">
					<ul className="sidebar-top button-group">
						<li className="button-group-item">
							<Link to={`/projects/${this.state.project.name}`}><Icon name="font" /></Link>
						</li>
						<li className="button-group-item">
							<Link to={`/projects/${this.state.project.name}/metrics`}><Icon name="graph-bar" /></Link>
						</li>
						<li className="button-group-item">
							<Link to={`/projects/${this.state.project.name}/settings`}><Icon name="cog" /></Link>
						</li>
					</ul>
					<ul className="sidebar-bottom button-group">
						<li className="button-group-item">
							<Link to='/user/profile'><Icon name="user" /></Link>
						</li>
						<li className="button-group-item">
							<Link to='/user/logout'><Icon name="lock" /></Link>
						</li>
					</ul>
				</nav>
				<div className="content">
					{this.props.children}
				</div>
			</div>
		);
	}
}

export class ProjectTexts extends React.Component	{
	constructor(props) {
		super(props);

		this.state = {projectTexts: {}};

		getProjectTexts(this.props.params.projectName).then(projectTexts => {
			this.setState({projectTexts});
		});
	}

	render() {
		return (
			<div>
				<h1>Texts</h1>
				{this.props.children}
			</div>
		);
	}
}

export class ProjectMetrics extends React.Component	{
	render() {
		return (
			<div>
				<h1>Metrics</h1>
				{this.props.children}
			</div>
		);
	}
}

export class ProjectSettings extends React.Component	{
	constructor(props) {
		super(props);
		this.state = {};
		this.handleRenameProjectFormSubmit = this.handleRenameProjectFormSubmit.bind(this);
		this.handleDeleteProjectFormSubmit = this.handleDeleteProjectFormSubmit.bind(this);
		this.fetch();
	}

	fetch () {
		getProject(this.props.params.projectName).then(project => {
			this.setState({project});
		});
	}

	handleRenameProjectFormSubmit (newProjectName, event) {
		event.preventDefault();

		renameProject(this.props.params.projectName, newProjectName).then(() => {
			browserHistory.push(`/projects/${newProjectName}/settings`);
		});
	}

	handleDeleteProjectFormSubmit () {
	}

	render() {
		return (
			<div className="container">
				<h1>Project settings</h1>
				<RenameProjectForm project={this.state.project} onSubmit={this.handleRenameProjectFormSubmit} />
				<DeleteProjectForm project={this.state.project} onSubmit={this.handleDeleteProjectFormSubmit} />
			</div>
		);
	}
}

export class RenameProjectForm extends React.Component	{
	constructor (props) {
		super(props);
		this.state = {
			newProjectName: ''
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
			<form onSubmit={this.props.onSubmit.bind(this, this.state.newProjectName)}>
				<fieldset>
					<legend>Rename Project</legend>
					<p className="form-group">
						<label htmlFor="newProjectName">New project name</label>
						<input id="newProjectName" type="text" onChange={this.handleNewProjectNameChange} value={this.state.newProjectName} />
					</p>
					<p className="form-group">
						<button type="submit" className="btn btn-primary">Rename project</button>
					</p>
				</fieldset>
			</form>
		);
	}
}

export class DeleteProjectForm extends React.Component	{
	render() {
		return (
			<form	className="danger">
				<fieldset>
					<legend>Delete Project</legend>
					<p className="form-group">
						<button type="submit" className="btn btn-primary">Delete project</button>
					</p>
				</fieldset>
			</form>
		);
	}
}
