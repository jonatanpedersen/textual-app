import React from 'react';
import HeadersStyles from './Headers.scss';
import classnames from 'classnames';

export class H1 extends React.Component {
  render() {
    return (
      <h1>
				{this.props.children}
			</h1>
    );
  }
}

export class H2 extends React.Component {
  render() {
    return (
      <h2>
				{this.props.children}
			</h2>
    );
  }
}

export class H3 extends React.Component {
  render() {
    return (
      <h3 className="header header-3">
				{this.props.children}
			</h3>
    );
  }
}
