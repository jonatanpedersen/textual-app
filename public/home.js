import React from 'react';
import { Link } from 'react-router';
import { DefaultLayout } from './layout';

export class Home extends React.Component {
  render() {
    return (
      <DefaultLayout>
        <Link to="/projects">Projects</Link>
      </DefaultLayout>
    );
  }
}
