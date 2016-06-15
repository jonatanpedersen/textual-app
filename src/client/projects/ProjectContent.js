import React from 'react';

export class ProjectContent extends React.Component {
	render() {
		return (
			<div className="content">
				{this.props.children}
			</div>
		);
	}
}
