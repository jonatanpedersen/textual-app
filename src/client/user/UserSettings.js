import React from 'react';
import { get, put } from '../api';
import { UserSettingsForm } from './UserSettingsForm';

export function getUserSettings() {
	return get('/api/user/settings');
}

export function updateUserSettings(newUserSettings) {
	return put('/api/user/settings', newUserSettings);
}

export class UserSettings extends React.Component	{
	constructor(props) {
		super(props);
		this.state = {
			language: '',
			languages: ['da-DK', 'en-GB']
		};

		this.handleLanguageChange = this.handleLanguageChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)

		this.fetch();
	}

	fetch () {
		getUserSettings().then(userSettings => {
			this.setState(userSettings);
		});
	}

	handleLanguageChange (event) {
		this.setState({language: event.target.value});
	}

	handleSubmit (event) {
		event.preventDefault();
		let language = this.state.language;

		updateUserSettings({ language });
	}

	render() {
		return (
			<UserSettingsForm
				onLanguageChange={this.handleLanguageChange}
				onSubmit={this.handleSubmit}
				language={this.state.language}
				languages={this.state.languages}
			/>
		);
	}
}
