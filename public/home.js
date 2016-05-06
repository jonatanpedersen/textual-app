import React from 'react';

export class Home extends React.Component {
  render() {
    return (
      <div>
        <a href="/projects">Projects</a>
        {this.props.children}
      </div>
    );
  }
}
