import React from 'react';
import { Form } from '../components/Forms';
import { Paragraph } from '../components/Paragraph';
import { UpdateUserProfileButton } from './UpdateUserProfileButton';

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
