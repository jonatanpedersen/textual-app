import React from 'react';
import { Button } from '../components/Button';
import { browserHistory } from 'react-router';
import Octicon from 'react-octicon';

export class NewProjectButton extends React.Component {
	render () {
		return <Button color="primary" onClick={() => browserHistory.push('/projects/new')} className="new-project-button"><Octicon name="plus" /> New Project</Button>
	}
}
