import React from 'react';
import { Form } from '../components/Forms';
import { Paragraph } from '../components/Paragraph';
import { UpdateUserSettingsButton } from './UpdateUserSettingsButton';

export class UserSettingsForm extends React.Component	{
	render () {
		return (
			<Form onSubmit={this.props.onSubmit}>
				<Form.Header>User Settings</Form.Header>
				<Form.Body>
					<Paragraph>
						<label htmlFor="language">Language</label>
						<select className="langauge" value={this.props.language} onChange={this.props.onLanguageChange}>
						{
							this.props.languages.map(language => {
								return <option key={language} value={language}>{language}</option>;
							})
						}
						</select>
					</Paragraph>
				</Form.Body>
				<Form.Footer>
					<UpdateUserSettingsButton />
				</Form.Footer>
			</Form>
		);
	}
}
