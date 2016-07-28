import React from 'react';
import { Form } from '../components/Forms';
import { Paragraph } from '../components/Paragraph';
import classnames from 'classnames';
import Shortcuts from 'react-shortcuts/component';
import { CreateProjectButton } from './CreateProjectButton'

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
						<input id="project-name" className="project-name" type="text" value={this.props.projectName} onChange={this.props.onProjectNameChange} autoFocus={true} />
						<tooltip>e.g. <span>textual-app</span></tooltip>
					</Paragraph>
					<Paragraph>
						<label htmlFor="userRepository">Pick a repository from the list, or write the url below</label>
						<select className="c-select user-repository" value={this.props.selectedUserRepository} onChange={this.props.onUserRepositoryChange}>
						{
							this.props.userRepositories.map(userRepository => {
								return <option key={userRepository.url} value={userRepository.url}>{userRepository.name}</option>;
							})
						}
						</select>
					</Paragraph>
				</Form.Body>
				<Form.Footer>
					<CreateProjectButton />
				</Form.Footer>
			</Form>
		);
	}
}
