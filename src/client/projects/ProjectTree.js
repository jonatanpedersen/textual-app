import React from 'react';
import { Container } from '../components/Container';
import { ProjectLayout } from './ProjectLayout';
import { get } from '../api';
import classnames from 'classnames';
import Shortcuts from 'react-shortcuts/component';
import { Loading } from '../components/Loading';

export async function getProjectTree(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}/tree`);
}

export class ProjectTree extends React.Component	{
	constructor(props) {
		super(props);
		this.state = {};
		this.fetch();
	}

	fetch () {
		getProjectTree(this.props.params.projectName).then(projectTree => {
			this.setState({projectTree});
		});
	}

	render() {
		return (
			<ProjectLayout>
				<ProjectLayout.Header onProjectDropdownChange={this.props.handleProjectDropdownChange} selectedProject={this.props.project} projects={this.props.projects} />
				<ProjectLayout.Body project={this.props.project}>
					<Container>
						<pre>{JSON.stringify(this.state.projectTree, null, 4)}</pre>
					</Container>
				</ProjectLayout.Body>
				<ProjectLayout.Footer />
			</ProjectLayout>
		);

		return <Loading />;
	}
}
