import React from 'react';
import { Button } from '../components/Button';

export class UpdateUserProfileButton extends React.Component	{
	render() {
		return (
			<Button type="submit" color="primary" className="update-user-profile-button">Update User Profile</Button>
		);
	}
}
