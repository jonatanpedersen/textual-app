import React from 'react';

export class H1 extends React.Component {
  render() {
    return (
      <h1>
				{this.props.children}
			</h1>
    );
  }
}
