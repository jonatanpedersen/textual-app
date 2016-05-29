import React from 'react';
import ParagraphStyles from './Paragraph.scss';
import classnames from 'classnames';

export class Paragraph extends React.Component {
	render() {
		let className = classnames('paragraph', this.props.className);

		return (
			<p className={className}>
				{this.props.children}
			</p>
		);
	}
}
