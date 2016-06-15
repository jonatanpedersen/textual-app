import React from 'react';
import { UserProfileForm } from './UserProfileForm';
import { get } from '../api';

export function getUserProfile() {
	return get('/api/user/profile');
}

export function updateUserProfile(newUserProfile) {
	return put('/api/user/profile', newUserProfile);
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
