import React from 'react';
import { Layout } from './components/Layout';
import { Nav } from './components/Nav';
import { Text } from './components/Text';
import { Paragraph } from './components/Paragraph';
import { Brand } from './components/Brand';
import { Link } from 'react-router';
import classnames from 'classnames';

export class DefaultLayout extends React.Component {
	render() {
		let className = classnames('default-layout', this.props.className);

		return (
			<Layout className={className}>
				{this.props.children}
			</Layout>
		);
	}
}

export class DefaultLayoutHeader extends React.Component {
	render() {
		let className = classnames('default-layout__header', this.props.className);

		return (
			<Layout.Header className={className}>
				<Paragraph>
					<Link to="/">
						<Brand />
					</Link>
					{this.props.children}
				</Paragraph>
			</Layout.Header>
		);
	}
}

export class DefaultLayoutBody extends React.Component {
	render() {
    let className = classnames('default-layout__body', this.props.className);

		return (
			<Layout.Body className={className}>
				{this.props.children}
			</Layout.Body>
		);
	}
}

export class DefaultLayoutFooter extends React.Component {
	render() {
    let className = classnames('default-layout__footer', this.props.className);

		return (
			<Layout.Footer className={className}>
				<Text>&copy; 2015-2016&nbsp;&nbsp;-&nbsp;&nbsp;</Text>
				<a href="https://www.jonatanpedersen.com">
					<Text>Jonatan Pedersen</Text>
				</a>
				{this.props.children}
			</Layout.Footer>
		);
	}
}

DefaultLayout.Header = DefaultLayoutHeader;
DefaultLayout.Body = DefaultLayoutBody;
DefaultLayout.Footer = DefaultLayoutFooter;
