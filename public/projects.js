import React from 'react';
import { render } from 'react-dom';
import { Link, browserHistory } from 'react-router';
import { Button } from './components/Button';
import { ButtonGroup } from './components/ButtonGroup';
import { H1, H2 } from './components/Headers';
import { NavBar } from './components/NavBar';
import { Container } from './components/Container';
import { Layout } from './components/Layout';
import { Brand } from './components/Brand';
import { DefaultLayout } from './Layout';
import { DataBoundFlexTable, TableFlex } from './components/TableFlex';
import { del, get, patch, put, post } from './api';
import { getUserRepositories } from './user';
import AutosizeTextarea from 'react-autosize-textarea';
import Octicon from 'react-octicon';
import ProjectsStyles from './projects.scss';
import { Form } from './components/Forms';
import { Paragraph } from './components/Paragraph';
import { SideBar, SideBarLink } from './components/SideBar';
import { Text } from './components/Text';

export async function getProjects() {
	return get('/api/projects');
}

export async function getProject(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}`);
}

export async function createProject(newProject) {
	return post('/api/projects', newProject);
}

export async function getProjectMetrics(projectIdOrName) {
	let projectSettings = await getProjectSettings(projectIdOrName);
	let projectTexts = await getProjectTexts(projectIdOrName);
	let projectTextIds = Object.keys(projectTexts);
	let projectMetics = {
		languages: projectSettings.languages.map(language => {
			return {
				code: language,
				coverage: projectTextIds.map(textId => projectTexts[textId]).filter(text => text[language]).length / projectTextIds.length * 100
			}
		})
	}

	return projectMetics;
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

export async function getProjectTexts(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}/texts`);
}

export function updateProjectTexts(projectIdOrName, newProjectTexts) {
	return put(`/api/projects/${projectIdOrName}/texts`, newProjectTexts);
}

export function patchProjectTexts(projectIdOrName, projectTextsPatch) {
	return patch(`/api/projects/${projectIdOrName}/texts`, projectTextsPatch);
}

export function addProjectText(projectIdOrName, textId, text) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'add',
			 path: '/' + textId,
			 value: text
		 }
	 ]);
 }

 export function addProjectTextValue(projectIdOrName, textId, languageCode, value) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'add',
			 path: '/' + textId + '/' + languageCode,
			 value: value
		 }
	 ]);
 }

 export function replaceProjectTextValue(projectIdOrName, textId, languageCode, value) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'replace',
			 path: '/' + textId + '/' + languageCode,
			 value: value
		 }
	 ]);
 }

 export function removeProjectTextValue(projectIdOrName, textId, languageCode) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'remove',
			 path: '/' + textId + '/' + languageCode
		 }
	 ]);
 }

 export function removeProjectText(projectIdOrName, textId) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'remove',
			 path: '/' + textId
		 }
	 ]);
 }

 export function moveProjectText(projectIdOrName, fromTextId, toTextId) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'move',
			 from: '/' + fromTextId,
			 path: '/' + toTextId
		 }
	 ]);
 }

export class NewProject extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			projectName: '',
			repositoryUrl: '',
			selectedUserRepository: '',
			userRepositories: []
		};

		this.handleProjectNameChange = this.handleProjectNameChange.bind(this);
		this.handleRepositoryUrlChange = this.handleRepositoryUrlChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleUserRepositoryChange = this.handleUserRepositoryChange.bind(this);

		this.fetch();
	}

	fetch () {
		getUserRepositories().then(userRepositories => {
			this.setState({userRepositories});
		});
	}

	handleProjectNameChange (event) {
		event.preventDefault();

		this.setState({projectName: event.target.value});
	}

	handleRepositoryUrlChange (event) {
		event.preventDefault();

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

	handleUserRepositoryChange (event) {
		event.preventDefault();

		this.setState({
			selectedUserRepository: event.target.value,
			repositoryUrl: event.target.value
		});

		if (this.state.projectName === '') {
			let projectName = this.state.userRepositories.find(repo => repo.url === event.target.value).name;

			this.setState({ projectName });
		}
	}

	render () {
		let sortedUserRepositories = this.state.userRepositories.sort((a, b) => a.name.localeCompare(b.name));

		return (
			<DefaultLayout>
				<Container>
					<NewProjectForm
						onProjectNameChange={this.handleProjectNameChange}
						onRepositoryUrlChange={this.handleRepositoryUrlChange}
						onSubmit={this.handleSubmit}
						onUserRepositoryChange={this.handleUserRepositoryChange}
						projectName={this.state.projectName}
						repositoryUrl={this.state.repositoryUrl}
						userRepositories={sortedUserRepositories}
						selectedUserRepository={this.state.selectedUserRepository}
					/>
				</Container>
			</DefaultLayout>
		);
	}
}

export class NewProjectForm extends React.Component {
	render() {
		return (
			<Form className="create-project-form" onSubmit={this.props.onSubmit}>
				<Form.Header>
					New Project
				</Form.Header>
				<Form.Body>
					<Paragraph>
						<label htmlFor="project-name" className="project-name">Project name</label>
						<input id="project-name" className="project-name" type="text" value={this.props.projectName} onChange={this.props.onProjectNameChange} />
						<tooltip>e.g. <span>textual-app</span></tooltip>
					</Paragraph>
					<Paragraph>
						<label htmlFor="userRepository">Pick a repository from the list, or write the url below</label>
						<select className="user-repository" value={this.props.selectedUserRepository} onChange={this.props.onUserRepositoryChange}>
						{
							this.props.userRepositories.map(userRepository => {
								return <option key={userRepository.url} value={userRepository.url}>{userRepository.name}</option>;
							})
						}
						</select>
					</Paragraph>
					<Paragraph>
						<label htmlFor="repositoryUrl">Repository url</label>
						<input id="repositoryUrl" className="repository-url" type="uri" value={this.props.repositoryUrl} onChange={this.props.onRepositoryUrlChange} required />
						<tooltip>e.g. <span>https://github.com/jonatanpedersen/textual-app-texts.git</span></tooltip>
					</Paragraph>
				</Form.Body>
				<Form.Footer>
					<CreateProjectButton />
				</Form.Footer>
			</Form>
		);
	}
}

export class CreateProjectButton extends React.Component {
	render () {
		return <Button color="primary" onClick={() => browserHistory.push('/projects/new')} type="submit" className="create-project-button"><Octicon name="plus" /> Create Project</Button>
	}
}

export class NewProjectButton extends React.Component {
	render () {
		return <Button color="primary" onClick={() => browserHistory.push('/projects/new')} className="new-project-button"><Octicon name="plus" /> New Project</Button>
	}
}

export class Projects extends React.Component {
	constructor (props) {
		super(props);
		this.state = {};
		this.fetch();
	}

	fetch () {
		getProjects().then(projects => {
			this.setState({projects});
		});
	}

	render () {
		if (this.state.projects) {
			return (
				<DefaultLayout>
					<Container>
						<ProjectsTable projects={this.state.projects} />
						<NewProjectButton />
					</Container>
				</DefaultLayout>
			);
		}

		return <Loading />
	}
}

export class ProjectsTable extends React.Component {
	render() {
		let projects = this.props.projects;

		let rows = projects && projects.map(project => (
			<ProjectsTableRow key={project._id} project={project} />
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

export class ProjectsTableRow extends React.Component {
	render() {
		let project = this.props.project;

		return project && (
			<tr className="projects-table__row">
				<td className="project-name">
					<Link to={`/projects/${project.name}`}>{project.name}</Link>
				</td>
			</tr>
		);
	}
}

export class ProjectDropdown extends React.Component {
	render() {
		return (
			<select className="project-dropdown" value={this.props.selectedProject} onChange={this.props.onChange}>
			{
				this.props.projects.map(project => {
					return <option key={project.name} value={project.name}>{project.name}</option>;
				})
			}
			</select>
		);
	}
}

export class ProjectLayout extends React.Component {
	constructor(props) {
		super(props);
		this.state = { project: {}, projects: [] };
		this.handleProjectDropdownChange = this.handleProjectDropdownChange.bind(this);
		this.fetch();
	}

	fetch() {
		getProject(this.props.params.projectName).then(project => {
			this.setState({project});
		});

		getProjects().then(projects => {
			this.setState({projects});
		});
	}

	handleProjectDropdownChange (event) {
		let projectName = event.target.value;

		browserHistory.push(`/projects/${projectName}`);
	}

	render() {
		return (
			<Layout className="project-layout">
				<Layout.Header>
					<Link to="/"><Brand /></Link>
					<ProjectDropdown selectedProject={this.props.params.projectName} projects={this.state.projects} onChange={this.handleProjectDropdownChange} />
				</Layout.Header>
				<Layout.Body>
					<SideBar isClosed={true}>
						<SideBar.ItemGroup>
							<SideBar.Item onClick={() => browserHistory.push(`/projects/${this.props.params.projectName}`)}>
								<SideBar.Item.Icon>
									<Octicon name="pencil" />
								</SideBar.Item.Icon>
								<SideBar.Item.Text>
									<Text>Texts</Text>
								</SideBar.Item.Text>
							</SideBar.Item>
							<SideBar.Item onClick={() => browserHistory.push(`/projects/${this.props.params.projectName}/metrics`)}>
								<SideBar.Item.Icon>
									<Octicon name="graph" />
								</SideBar.Item.Icon>
								<SideBar.Item.Text>
									<Text>Metrics</Text>
								</SideBar.Item.Text>
							</SideBar.Item>
							<SideBar.Item onClick={() => browserHistory.push(`/projects/${this.props.params.projectName}/settings`)}>
								<SideBar.Item.Icon>
									<Octicon name="gear" />
								</SideBar.Item.Icon>
								<SideBar.Item.Text>
									<Text>Settings</Text>
								</SideBar.Item.Text>
							</SideBar.Item>
						</SideBar.ItemGroup>
						<SideBar.ItemGroup>
							<SideBar.Item onClick={() => browserHistory.push(`/user`)}>
								<SideBar.Item.Icon>
									<Octicon name="person" />
								</SideBar.Item.Icon>
								<SideBar.Item.Text>
									<Text>User Profile</Text>
								</SideBar.Item.Text>
							</SideBar.Item>
							<SideBar.Item onClick={() => browserHistory.push(`/logout`)}>
								<SideBar.Item.Icon>
									<Octicon name="sign-out" />
								</SideBar.Item.Icon>
								<SideBar.Item.Text>
									<Text>Log out</Text>
								</SideBar.Item.Text>
							</SideBar.Item>
						</SideBar.ItemGroup>
					</SideBar>
					<div className="content">
						{this.props.children}
					</div>
				</Layout.Body>
				<Layout.Footer>
					<p>Copyright &copy; 2015-2016 <a href="https://www.jonatanpedersen.com" target="_blank">Jonatan Pedersen</a></p>
				</Layout.Footer>
			</Layout>
		);
	}
}

export class ProjectTexts extends React.Component	{
	constructor(props) {
		super(props);
		this.state = { };
		this.handleCellChange = this.handleCellChange.bind(this);
		this.handleCellBlur = this.handleCellBlur.bind(this);
		this.handleCellClick = this.handleCellClick.bind(this);
		this.handleAddRowButtonClick = this.handleAddRowButtonClick.bind(this);
		this.handleRemoveRowButtonClick = this.handleRemoveRowButtonClick.bind(this);
		this.fetch(props.params.projectName);
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.params.projectName !== this.props.params.projectName) {
			this.fetch(nextProps.params.projectName);
		}
	}

	fetch (projectName) {
		getProjectSettings(projectName).then(projectSettings => {
			getProjectTexts(projectName).then(projectTexts => {
				let data = [['Text Id', ...projectSettings.languages], ...Object.keys(projectTexts).map(textId => {
					return [textId, ...projectSettings.languages.map(language => projectTexts[textId][language])];
				})];

				let newRow = ['Text Id', ...projectSettings.languages];

				this.setState({data, newRow, rowIndex: -1, columnIndex: -1});
			});
		});
	}

	handleCellChange (event) {
		let value = event.target.value;

		this.setState({ value });
	}

	handleCellBlur (event) {
		let newValue = this.state.value;

		if (this.state.rowIndex === -1) {
			let newRow = this.state.newRow;
			newRow[this.state.columnIndex] = newValue;
			this.setState({newRow});
			return;
		}

		let oldValue = this.state.data[this.state.rowIndex][this.state.columnIndex];

		if (oldValue === newValue) {
			return;
		}

		if (this.state.columnIndex === 0) {
			moveProjectText(this.props.params.projectName, oldValue, newValue);
		} else {
			let textId = this.state.data[this.state.rowIndex][0];
			let language = this.state.data[0][this.state.columnIndex];

			if (oldValue === undefined) {
				addProjectTextValue(this.props.params.projectName, textId, language, newValue);
			} else {
				replaceProjectTextValue(this.props.params.projectName, textId, language, newValue);
			}
		}

		let data = this.state.data;
		data[this.state.rowIndex][this.state.columnIndex] = newValue;
		this.setState({ data });
	}

	handleCellClick (rowIndex, columnIndex) {
		let row = rowIndex === -1 ? this.state.newRow : this.state.data[rowIndex];
		let value = row[columnIndex];

		this.setState({ rowIndex, columnIndex, value });
	}

	handleAddRowButtonClick (rowIndex) {
		let data = this.state.data;
		let newRow = this.state.newRow;

		let textId = newRow[0];
		let newText = data[0].slice(1).reduce((newText, language, index) => {
			newText[language] = newRow[index];

			return newText;
		}, {});

		addProjectText(this.props.params.projectName, textId, newText).then(() => {
			data.push(newRow);
			let rowIndex = null;
			let columnIndex = null;
			newRow = [...data[0]];

			this.setState({ data, rowIndex, columnIndex, newRow });
		});
	}

	handleRemoveRowButtonClick (rowIndex) {
		let data = this.state.data;
		let textId = data[rowIndex][0];

		removeProjectText(this.props.params.projectName, textId).then(() => {
			data.splice(rowIndex, 1);
			this.setState({ data });
		});
	}

	render() {
		if (this.state.data) {
			return (
				<DataBoundFlexTable
					data={this.state.data}
					value={this.state.value}
					columnIndex={this.state.columnIndex}
					rowIndex={this.state.rowIndex}
					newRow={this.state.newRow}
					onCellBlur={this.handleCellBlur}
					onCellChange={this.handleCellChange}
					onCellClick={this.handleCellClick}
					onRemoveRowButtonClick={this.handleRemoveRowButtonClick}
					onAddRowButtonClick={this.handleAddRowButtonClick}
				/>
			);
		}

		return <Loading />
	}
}

export class ProjectMetrics extends React.Component	{
	constructor(props) {
		super(props);
		this.state = {};
		this.fetch();
	}

	fetch () {
		getProjectMetrics(this.props.params.projectName).then(projectMetrics => {
			this.setState({projectMetrics});
		});
	}

	render() {
		return (
			<Container className="project-metrics">
				<ProjectMetricsTable projectMetrics={this.state.projectMetrics} />
			</Container>
		);
	}
}

export class ProjectMetricsTable extends React.Component	{
	render() {
		return (
			<table className="project-metrics-table">
				<thead>
					<tr className="project-metrics-table__row">
						<th className="language-code">Language Code</th>
						<th className="coverage">Coverage</th>
					</tr>
				</thead>
				<tbody>
					{this.props.projectMetrics && this.props.projectMetrics.languages && this.props.projectMetrics.languages.map(language => {
						return (
							<tr className="project-metrics-table__row" key={language.code}>
								<td className="language-code">{language.code}</td>
								<td className="coverage">{language.coverage}%</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		);
	}
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
		if (this.state.project) {
			return (
				<Container>
					<ProjectSettingsForm project={this.state.project} onBlur={this.handleProjectSettingsFormBlur} onChange={this.handleProjectSettingsFormChange} onSubmit={this.handleUpdateProjectSettingsFormSubmit} />
					<RenameProjectForm project={this.state.project} onSubmit={this.handleRenameProjectFormSubmit} />
					<DeleteProjectForm project={this.state.project} onSubmit={this.handleDeleteProjectFormSubmit} />
				</Container>
			);
		}

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

export class Loading extends React.Component	{
	render() {
		return (
			<div className="loading">
				<Octicon name="clock" spin={true} />
			</div>
		);
	}
}
