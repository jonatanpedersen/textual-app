import { Text } from './Text';
import React from 'react';
import CopyrightStyles from './Copyright.scss';
import classnames from 'classnames';

export class Copyright extends React.Component {
	render() {
    let className = classnames('copyright', this.props.className);

		return (
			<div className={className}>
				<Text>&copy; 2015-2016&nbsp;&nbsp;-&nbsp;&nbsp;</Text>
				<a href="https://www.jonatanpedersen.com">
					<Text>Jonatan Pedersen</Text>
				</a>
			</div>
		);
	}
}
