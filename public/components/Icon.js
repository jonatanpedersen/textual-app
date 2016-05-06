import React from 'react';
import icons from '../icons.css';

export class Icon extends React.Component {
  render() {
    return (
      <i className={`icon-${this.props.name}`}></i>
    );
  }
}
