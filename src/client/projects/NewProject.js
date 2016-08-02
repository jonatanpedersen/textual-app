import React from 'react';
import { Container } from '../components/Container';
import { DefaultLayout } from '../components/DefaultLayout';
import { Loading } from '../components/Loading';
import classnames from 'classnames';
import { NewProjectForm } from './NewProjectForm';
import { get, post } from '../api';
import { browserHistory } from 'react-router';
import dashify from 'dashify';

export async function getUserRepositories() {
	return get('/api/user/repositories');
}

export async function createProject(newProject) {
	return post('/api/projects', newProject);
}

export class NewProject extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			projectName: '',
			projectNameChanged: false,
			repositoryUrl: '',
			selectedUserRepository: '',
			userRepositories: []
		};

		this.handleProjectNameChange = this.handleProjectNameChange.bind(this);
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

		this.setState({projectName: event.target.value, projectNameChanged: true});
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

		if (!this.state.projectNameChanged) {
			let repository = this.state.userRepositories.find(repo => repo.url === event.target.value)
			let projectName = dashify(repository.name);

			this.setState({projectName});
		}
	}

	render () {
		let sortedUserRepositories = this.state.userRepositories.sort((a, b) => a.name.localeCompare(b.name));

		return (
			<DefaultLayout>
				<DefaultLayout.Header />
				<DefaultLayout.Body>
					<Container>
						<NewProjectForm
							onProjectNameChange={this.handleProjectNameChange}
							onSubmit={this.handleSubmit}
							onUserRepositoryChange={this.handleUserRepositoryChange}
							projectName={this.state.projectName}
							repositoryUrl={this.state.repositoryUrl}
							userRepositories={sortedUserRepositories}
							selectedUserRepository={this.state.selectedUserRepository}
						/>
					</Container>
				</DefaultLayout.Body>
				<DefaultLayout.Footer />
			</DefaultLayout>
		);
	}
}
