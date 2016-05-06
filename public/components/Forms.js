import React from 'react';

export class Form extends React.Component {
  render() {
    return (
      <form>
				{this.props.children}
			</form>
    );
  }
}
