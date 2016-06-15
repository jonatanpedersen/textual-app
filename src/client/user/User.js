import React from 'react';
import { Container } from '../components/Container';
import { DefaultLayout } from '../components/DefaultLayout';
import { UserProfile } from './UserProfile';
import { UserSettings } from './UserSettings';

export class User extends React.Component	{
	render() {
		return (
			<DefaultLayout>
				<DefaultLayout.Header />
				<DefaultLayout.Body>
					<Container>
						<UserProfile />
						<UserSettings />
					</Container>
				</DefaultLayout.Body>
				<DefaultLayout.Footer />
			</DefaultLayout>
		);
	}
}
