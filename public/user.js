import React from 'react';
import { render } from 'react-dom';
import { Link, browserHistory } from 'react-router';
import { Button } from './components/Button';
import { Container } from './components/Container';
import { DefaultLayout } from './layout';
import { Form } from './components/Forms';
import { get, put } from './api';
import { Paragraph } from './components/Paragraph';

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
		this.state = {
			displayName: '',
			email: ''
		};
		this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this)
		this.handleEmailChange = this.handleEmailChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.fetch();
	}

	fetch () {
		getUserProfile().then(userProfile => {
			this.setState(userProfile);
		});
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

		updateUserProfile({ displayName, email });
	}

	render () {
		return (
			<UserProfileForm
				displayName={this.state.displayName}
				email={this.state.email}
				onDisplayNameChange={this.handleDisplayNameChange}
				onEmailChange={this.handleEmailChange}
				onSubmit={this.handleSubmit}
			/>
		);
	}
}

export class UserProfileForm extends React.Component	{
	render () {
		return (
			<Form onSubmit={this.props.onSubmit}>
				<Form.Header>User Profile</Form.Header>
				<Form.Body>
					<Paragraph>
						<label htmlFor="displayName">Display name</label>
						<input id="displayName" type="text" className="display-name" onChange={this.props.onDisplayNameChange} value={this.props.displayName} requried />
					</Paragraph>
					<Paragraph>
						<label htmlFor="emailAddress">Email address</label>
						<input id="emailAddress" type="email" className="email" onChange={this.props.onEmailChange} value={this.props.email} requried />
					</Paragraph>
				</Form.Body>
				<Form.Footer>
					<UpdateUserProfileButton />
				</Form.Footer>
			</Form>
		);
	}
}

export class UpdateUserProfileButton extends React.Component	{
	render() {
		return (
			<Button type="submit" color="primary" className="update-user-profile-button">Update User Profile</Button>
		);
	}
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

export class UpdateUserSettingsButton extends React.Component	{
	render() {
		return (
			<Button type="submit" color="primary" className="update-user-settings-button">Update User Settings</Button>
		);
	}
}

export class User extends React.Component	{
	render() {
		return (
			<DefaultLayout>
				<Container>
					<UserProfile />
					<UserSettings />
				</Container>
			</DefaultLayout>
		);
	}
}
