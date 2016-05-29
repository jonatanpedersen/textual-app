import React from 'react';
import { Layout } from './components/Layout';
import { Nav } from './components/Nav';
import { Text } from './components/Text';
import { Paragraph } from './components/Paragraph';
import { Brand } from './components/Brand';
import { Link } from 'react-router';

export class DefaultLayout extends React.Component {
	render() {
		return (
			<Layout>
				<Layout.Header>
					<Paragraph>
						<Link to="/">
							<Brand />
						</Link>
					</Paragraph>
				</Layout.Header>
				<Layout.Body>
					{this.props.children}
				</Layout.Body>
				<Layout.Footer>
					<Paragraph>
						<Text>&copy; 2015-2016&nbsp;&nbsp;-&nbsp;&nbsp;</Text>
						<a href="https://www.jonatanpedersen.com">
							<Text>Jonatan Pedersen</Text>
						</a>
					</Paragraph>
				</Layout.Footer>
			</Layout>
		);
	}
}
