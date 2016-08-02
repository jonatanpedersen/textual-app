import React from 'react';
import { Link } from 'react-router';
import { Container } from './components/Container';
import { H1 } from './components/Headers';
import { Paragraph } from './components/Paragraph';
import { DefaultLayout } from './components/DefaultLayout';
import UnauthorizedStyles from './Unauthorized.scss';

export class Unauthorized extends React.Component {
	render() {
		return (
			<DefaultLayout className="unauthorized">
				<DefaultLayout.Header />
				<DefaultLayout.Body>
					<Container>
						<H1>Unauthorized</H1>
						<Paragraph>textual.io is currently in private beta, and you have not been granted access.</Paragraph>
					</Container>
				</DefaultLayout.Body>
				<DefaultLayout.Footer />
			</DefaultLayout>
		);
	}
}
