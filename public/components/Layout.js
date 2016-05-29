import React from 'react';
import LayoutStyles from './Layout.scss';
import classnames from 'classnames';

export class Layout extends React.Component {
  render() {
    let className = classnames('layout', this.props.className);

    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
}

export class LayoutHeader extends React.Component {
  render() {
    let className = classnames('layout__header', this.props.className);

    return (
      <header className={className}>
        {this.props.children}
      </header>
    );
  }
}

export class LayoutBody extends React.Component {
  render() {
    let className = classnames('layout__body', this.props.className);

    return (
      <main className={className}>
        {this.props.children}
      </main>
    );
  }
}


export class LayoutFooter extends React.Component {
  render() {
    let className = classnames('layout__footer', this.props.className);

    return (
      <footer className={className}>
        {this.props.children}
      </footer>
    );
  }
}

Layout.Header = LayoutHeader;
Layout.Body = LayoutBody;
Layout.Footer = LayoutFooter;
