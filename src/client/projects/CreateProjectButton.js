import React from 'react';
import { Button } from '../components/Button';
import Octicon from 'react-octicon';

export class CreateProjectButton extends React.Component {
	render () {
		return <Button color="primary" onClick={() => browserHistory.push('/projects/new')} type="submit" className="create-project-button"><Octicon name="plus" /> Create Project</Button>
	}
}
