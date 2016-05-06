import React from 'react';
import { render } from 'react-dom';
import { Link, browserHistory } from 'react-router';
import { Container } from './components/Container';
import { Icon } from './components/Icon';
import { H1 } from './components/Headers';
import { get, put } from './api';

export function getUserProfile() {
	return get('/api/user/profile');
}

export function updateUserProfile(newUserProfile) {
	return put('/api/user/profile', newUserProfile);
}

export function getUserSettings() {
	return get('/api/user/settings');
}

export function updateUserSettings(newUserSettings) {
	return put('/api/user/settings', newUserSettings);
}

export function getUserRepositories() {
	return get('/api/user/repositories');
}

export class UserProfile extends React.Component	{
	constructor (props) {
		super(props);
		this.state = {};
		this.handleSubmit = this.handleSubmit.bind(this)
		this.fetch();
	}

	fetch () {
		getUserProfile().then(userProfile => {
			this.setState({userProfile});
		});
	}

	handleSubmit (userProfile) {
		updateUserProfile(userProfile);
	}

	render () {
		return (
			<Container>
				<H1>User profile</H1>
				<UserProfileForm onSubmit={this.handleSubmit} userProfile={this.state.userProfile} />
			</Container>
		);
	}
}

export class UserProfileForm extends React.Component	{
	constructor (props) {
		super(props);
		this.state = {
			displayName: '',
			email: ''
		};

		this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this)
		this.handleEmailChange = this.handleEmailChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	componentWillReceiveProps (nextProps) {
		this.setState(nextProps.userProfile);
	}

	handleDisplayNameChange (event) {
		this.setState({displayName: event.target.value});
	}

	handleEmailChange (event) {
		this.setState({email: event.target.value});
	}

	handleSubmit (event) {
		event.preventDefault();
		var displayName = this.state.displayName.trim();
		var email = this.state.email.trim();

		this.props.onSubmit({ displayName, email });
	}

	render () {
		return (
			<form onSubmit={this.handleSubmit}>
				<p className="form-group">
					<label htmlFor="displayName">Display name</label>
					<input id="displayName" type="text" className="form-control" onChange={this.handleDisplayNameChange} value={this.state.displayName} />
				</p>
				<p className="form-group">
					<label htmlFor="emailAddress">Email address</label>
					<input id="emailAddress" type="text" className="form-control" hgbonChange={this.handleEmailChange} value={this.state.email} />
				</p>
				<p className="form-group">
					<button type="submit" className="btn btn-primary">Update user profile</button>
				</p>
			</form>
		);
	}
}

export class UserSettings extends React.Component	{
	constructor(props) {
		super(props);
		this.state = {};
		this.fetch();
	}

	fetch () {
		getUserSettings().then(userSettings => {
			this.setState({userSettings});
		});
	}

	handleSubmit (userSettings) {
		updateUserSettings(userSettings);
	}

	render() {
		return (
			<Container>
				<H1>User settings</H1>
				<UserSettingsForm userSettings={this.state.userSettings} onSubmit={this.handleSubmit} />
			</Container>
		);
	}
}

export class UserSettingsForm extends React.Component	{
	constructor (props) {
		super(props);
		this.state = {
			language: '',
			languages: ['da-DK', 'en-GB']
		};

		this.handleLanguageChange = this.handleLanguageChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	componentWillReceiveProps (nextProps) {
		this.setState(nextProps.userSettings);
	}

	handleLanguageChange (event) {
		this.setState({language: event.target.value});
	}

	handleSubmit (event) {
		event.preventDefault();
		let language = this.state.language;

		this.props.onSubmit({ language });
	}

	render () {
		return (
			<form onSubmit={this.handleSubmit}>
				<p className="form-group">
					<label htmlFor="language">Language</label>
					<select className="form-control" value={this.state.language} onChange={this.handleLanguageChange}>
					{
						this.state.languages.map(language => {
							return <option key={language} value={language}>{language}</option>;
						})
					}
					</select>
				</p>
				<p className="form-group">
					<button type="submit" className="btn btn-primary">Update user settings</button>
				</p>
			</form>
		);
	}
}

export class UserLogout extends React.Component	{
	render() {
		return (
			<div>
			</div>
		);
	}
}
