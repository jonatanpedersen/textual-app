import React from 'react';
import NavCss from './Nav.scss';

export class Nav extends React.Component {
  render() {
    return (
      <nav className="nav">
        {this.props.children}
      </nav>
    );
  }
}

export class NavItem extends React.Component {
  render() {
    return (
      <div className="nav-item">
        {this.props.children}
      </div>
    );
  }
}

Nav.Item = NavItem;
