import React from 'react';

export class Layout extends React.Component {
  render() {
    return (
      <div className="layout">
        <header className="layout-header">
          <nav className="navbar navbar-default">
          	<div className="container-fluid">
          		<a href="/" className="navbar-link">textual.io</a>
          	</div>
          </nav>
        </header>
        {this.props.children}
        <footer className="layout-footer">
          <nav className="navbar navbar-default">
            <div className="container-fluid">
              <p className="navbar-text"><span text>Copyright &copy; 2015-2016</span> <a href="https://www.jonatanpedersen.com" target="_blank">Jonatan Pedersen</a></p>
            </div>
          </nav>
        </footer>
      </div>
    );
  }
}
