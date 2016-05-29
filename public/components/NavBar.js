import React from 'react';
import NavBarCss from './NavBar.scss';

export class NavBar extends React.Component {
  render() {
    return (
      <ul className="navbar">
        {this.props.children}
      </ul>
    );
  }
}

export class NavBarBrand extends React.Component {
  render() {
    return (
      <div className="navbar-brand">
        {this.props.children}
      </div>
    );
  }
}


export class NavBarItem extends React.Component {
  render() {
    return (
      <div className="navbar-item">
        {this.props.children}
      </div>
    );
  }
}

NavBar.Brand = NavBarBrand;
NavBar.Item = NavBarItem;
