import React from 'react';
import ContainerStyles from './Container.scss';
import classnames from 'classnames';

export class Container extends React.Component {
	render() {
		let className = classnames('container', this.props.className);

		return (
			<div className={className}>
				{this.props.children}
			</div>
		);
	}
}
