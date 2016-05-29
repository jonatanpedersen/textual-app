import React from 'react';
import ButtonStyles from './ButtonGroup.scss';
import classnames from 'classnames';

export class ButtonGroup extends React.Component {
	render() {
		let className = classnames('button-group', this.props.className);

		return (
			<div className={className}>
				{this.props.children}
			</div>
		);
	}
}
