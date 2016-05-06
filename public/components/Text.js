import React from 'react';

export class Text extends React.Component {
  render() {
    return (
      <span>
				{this.props.children}
			</span>
    );
  }
}
