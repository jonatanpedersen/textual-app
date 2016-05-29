import React from 'react';
import classnames from 'classnames';

export class Text extends React.Component {
  render() {
		let className = classnames('text', this.props.className);

    return (
      <span className={className}>
				{this.props.children}
			</span>
    );
  }
}
