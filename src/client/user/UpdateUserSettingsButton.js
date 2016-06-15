import React from 'react';
import { Button } from '../components/Button';

export class UpdateUserSettingsButton extends React.Component	{
	render() {
		return (
			<Button type="submit" color="primary" className="update-user-settings-button">Update User Settings</Button>
		);
	}
}
