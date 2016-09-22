import React from 'react';
import ButtonStyles from './Button.scss';
import classnames from 'classnames';

export class Button extends React.Component {
	render() {
		let className = classnames('button', this.props.className, {
			'button--small': this.props.size === 'small',
			'button--large': this.props.size === 'large',
			'button--primary': this.props.color === 'primary',
			'button--secondary': this.props.color === 'secondary'
		});

		return (
			<button className={className} {...this.props}>
				{this.props.children}
			</button>
		);
	}
}
