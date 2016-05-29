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
import { del, get, put, post } from './api';
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

export function removeProjectText(projectIdOrName, textId) {
	return Promise.resolve();
}

export function addProjectText(projectIdOrName, text) {
	return Promise.resolve();
}

export function updateProjectText(projectIdOrName, text) {
	return Promise.resolve();
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
	}

	render () {
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
						userRepositories={this.state.userRepositories}
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
		return (
			<DefaultLayout>
				<Container>
					<ProjectsTable projects={this.state.projects} />
					<NewProjectButton />
				</Container>
			</DefaultLayout>
		);
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
		this.state = {};
		this.handleChange = this.handleChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleClick = this.handleClick.bind(this);
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

				this.setState({data});
			});
		});
	}

	handleChange (event) {
		let value = event.target.value;

		this.setState({ value });
	}

	handleBlur (event) {
		let oldValue = this.state.data[this.state.rowIndex][this.state.columnIndex];
		let newValue = this.state.value;

		if (oldValue === newValue) {
			return;
		}

		if (this.state.columnIndex === 0) {
			console.log(`PUT texts/${oldValue}`, newValue);
		} else {
			let textId = this.state.data[this.state.rowIndex][0];
			let language = this.state.data[0][this.state.columnIndex];

			console.log(`PUT texts/${textId}/${language}`, oldValue, newValue);
		}

		let data = this.state.data;
		data[this.state.rowIndex][this.state.columnIndex] = newValue;
		this.setState({ data });
	}

	handleClick (rowIndex, columnIndex) {
		let value = this.state.data[rowIndex][columnIndex];

		this.setState({ rowIndex, columnIndex, value });
	}

	render() {
		return (
			<DataBoundFlexTable
				data={this.state.data}
				value={this.state.value}
				columnIndex={this.state.columnIndex}
				rowIndex={this.state.rowIndex}
				onBlur={this.handleBlur}
				onChange={this.handleChange}
				onClick={this.handleClick}
			/>
		);
	}
}
//
// export class ProjectTexts extends React.Component	{
// 	constructor(props) {
// 		super(props);
// 		this.state = {};
// 		this.handleRemoveTextButtonClick = this.handleRemoveTextButtonClick.bind(this);
// 		this.handleTextChange = this.handleTextChange.bind(this);
// 		this.handleTextKeyChange = this.handleTextKeyChange.bind(this);
// 		this.handleTextClick = this.handleTextClick.bind(this);
// 		this.fetch();
// 	}
//
// 	fetch () {
// 		getProjectSettings(this.props.params.projectName).then(projectSettings => {
// 			getProjectTexts(this.props.params.projectName).then(projectTexts => {
// 				this.setState({projectSettings, projectTexts});
// 			});
// 		});
// 	}
//
// 	handleRemoveTextButtonClick (textId) {
// 		removeProjectText(this.props.params.projectName, textId).then(() => {
// 			let projectTexts = this.state.projectTexts;
// 			delete projectTexts[textId];
// 			this.setState({projectTexts});
// 		});
// 	}
//
// 	handleTextChange (textId, language, event) {
// 		let projectTexts = this.state.projectTexts;
// 		projectTexts[textId][language] = event.target.value;
// 		this.setState({projectTexts});
// 	}
//
// 	handleTextKeyChange (textId, event) {
// 		let newTextId = event.target.value;
//
// 		console.log(textId, newTextId);
//
// 		//let projectTexts = this.state.projectTexts;
// 		//projectTexts[textId][language] = event.target.value;
// 		//this.setState({projectTexts});
// 	}
//
// 	handleTextClick (selectedTextId, selectedLanguage) {
// 		this.setState({selectedTextId, selectedLanguage});
// 	}
//
// 	render() {
// 		return (
// 			<TableFlex className="project-texts-table">
// 				<TableFlex.Header>
// 					<TableFlex.Row>
// 						<TableFlex.Column>Text Id</TableFlex.Column>
// 						{this.state.projectSettings && this.state.projectSettings.languages.map(language => {
// 							return (
// 								<TableFlex.Column key={language}>{language}</TableFlex.Column>
// 							);
// 						})}
// 						<TableFlex.Column></TableFlex.Column>
// 					</TableFlex.Row>
// 				</TableFlex.Header>
// 				<TableFlex.Body>
// 					{this.state.projectTexts && Object.keys(this.state.projectTexts).map(textId => {
// 						return (
// 							<TableFlex.Row key={textId}>
// 								<TableFlex.Column>
// 									<AutosizeTextarea onChange={this.handleTextKeyChange.bind(this, textId)} value={textId}></AutosizeTextarea>
// 								</TableFlex.Column>
// 								{this.state.projectSettings.languages.map(language => {
// 									if (textId === this.state.selectedTextId && language === this.state.selectedLanguage) {
// 										return (
// 											<TableFlex.Column key={language}>
// 												<AutosizeTextarea onChange={this.handleTextChange.bind(this, textId, language)} value={this.state.projectTexts[textId][language]}></AutosizeTextarea>
// 											</TableFlex.Column>
// 										);
// 									} else {
// 										return (
// 											<TableFlex.Column key={language} onClick={this.handleTextClick.bind(this, textId, language)}>
// 												{this.state.projectTexts[textId][language]}
// 											</TableFlex.Column>
// 										);
// 									}
// 								})}
// 								<TableFlex.Column>
// 									<RemoveProjectTextButton onClick={this.handleRemoveTextButtonClick.bind(this, textId)}/>
// 								</TableFlex.Column>
// 							</TableFlex.Row>
// 						);
// 					})}
// 				</TableFlex.Body>
// 				<TableFlex.Footer>
// 					<TableFlex.Row>
// 						<TableFlex.Column>
// 							<AutosizeTextarea placeholder="Text Id"></AutosizeTextarea>
// 						</TableFlex.Column>
// 						{this.state.projectSettings && this.state.projectSettings.languages.map(language => {
// 							return (
// 								<TableFlex.Column key={language}>
// 									<AutosizeTextarea placeholder={language}></AutosizeTextarea>
// 								</TableFlex.Column>
// 							);
// 						})}
// 						<TableFlex.Column>
// 							<AddProjectTextButton />
// 						</TableFlex.Column>
// 					</TableFlex.Row>
// 				</TableFlex.Footer>
// 			</TableFlex>
// 		);
// 	}
// }

// export class ProjectTextsTable extends React.Component	{
// 	render() {
// 		let texts = {this.props.projectTexts && Object.keys(this.props.projectTexts).map(textId => {
//
// 		return (
// 			<TableFlex className="project-texts-table">
// 				<TableFlex.Header>
// 					<TableFlex.Row>
// 						<TableFlex.Column>Text Id</TableFlex.Column>
// 						{this.props.languages(language => {
// 							return (
// 								<TableFlex.Column key={language}>{language}</TableFlex.Column>
// 							);
// 						})}
// 						<TableFlex.Column></TableFlex.Column>
// 					</TableFlex.Row>
// 				</TableFlex.Header>
// 				<TableFlex.Body>
// 					{this.props.projectTexts && Object.keys(this.props.projectTexts).map(textId => {
// 						return (
// 							<TableFlex.Row key={textId}>
// 								<TableFlex.Column>
// 									<AutosizeTextarea onChange={this.handleTextKeyChange.bind(this, textId)} value={textId}></AutosizeTextarea>
// 								</TableFlex.Column>
// 								{this.state.props.languages.map(language => {
// 									if (textId === this.state.selectedTextId && language === this.state.selectedLanguage) {
// 										return (
// 											<TableFlex.Column key={language}>
// 												<AutosizeTextarea onChange={this.handleTextChange.bind(this, textId, language)} value={this.state.projectTexts[textId][language]}></AutosizeTextarea>
// 											</TableFlex.Column>
// 										);
// 									} else {
// 										return (
// 											<TableFlex.Column key={language} onClick={this.handleTextClick.bind(this, textId, language)}>
// 												{this.state.projectTexts[textId][language]}
// 											</TableFlex.Column>
// 										);
// 									}
// 								})}
// 								<TableFlex.Column>
// 									<RemoveProjectTextButton onClick={this.handleRemoveTextButtonClick.bind(this, textId)}/>
// 								</TableFlex.Column>
// 							</TableFlex.Row>
// 						);
// 					})}
// 				</TableFlex.Body>
// 				<TableFlex.Footer>
// 					<TableFlex.Row>
// 						<TableFlex.Column>
// 							<AutosizeTextarea placeholder="Text Id"></AutosizeTextarea>
// 						</TableFlex.Column>
// 						{this.state.projectSettings && this.state.projectSettings.languages.map(language => {
// 							return (
// 								<TableFlex.Column key={language}>
// 									<AutosizeTextarea placeholder={language}></AutosizeTextarea>
// 								</TableFlex.Column>
// 							);
// 						})}
// 						<TableFlex.Column>
// 							<AddProjectTextButton />
// 						</TableFlex.Column>
// 					</TableFlex.Row>
// 				</TableFlex.Footer>
// 			</TableFlex>
// 		);
// 	}
// }

export class RemoveProjectTextButton extends React.Component	{
	render() {
		return (
			<Button onClick={this.props.onClick} size="small"><Octicon name="trashcan" /></Button>
		);
	}
}

export class AddProjectTextButton extends React.Component	{
	render() {
		return (
			<Button onClick={this.props.onClick}><Octicon name="plus" /></Button>
		);
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

	handleDeleteProjectFormSubmit (event) {
		event.preventDefault();

		deleteProject(this.props.params.projectName).then(() => {
			browserHistory.push(`/projects`);
		});
	}

	render() {
		return (
			<Container>
				<RenameProjectForm project={this.state.project} onSubmit={this.handleRenameProjectFormSubmit} />
				<DeleteProjectForm project={this.state.project} onSubmit={this.handleDeleteProjectFormSubmit} />
			</Container>
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
