import React from 'react';
import { Container } from '../components/Container';
import { ProjectLayout } from './ProjectLayout';
import { ProjectMetricsTable } from './ProjectMetricsTable';
import { get } from '../api';
import classnames from 'classnames';
import Shortcuts from 'react-shortcuts/component';
import { Loading } from '../components/Loading';

export async function getProjectSettings(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}/settings`);
}

export async function getProjectTexts(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}/texts`);
}

export async function getProjectMetrics(projectIdOrName) {
	let projectSettings = await getProjectSettings(projectIdOrName);
	let projectTexts = await getProjectTexts(projectIdOrName);
	let projectTextIds = Object.keys(projectTexts);
	let projectMetics = {
		languages: projectSettings.languages.map(language => {
			return {
				code: language,
				coverage: Math.round(projectTextIds.map(textId => projectTexts[textId]).filter(text => text[language]).length / projectTextIds.length * 10000) / 100
			}
		})
	}

	return projectMetics;
}

export class ProjectMetrics extends React.Component	{
	constructor(props) {
		super(props);
		this.state = {};
		this.fetch();
	}

	fetch () {
		getProjectMetrics(this.props.params.projectName).then(projectMetrics => {
			this.setState({projectMetrics});
		});
	}

	render() {
		return (
			<ProjectLayout>
				<ProjectLayout.Header onProjectDropdownChange={this.props.handleProjectDropdownChange} selectedProject={this.props.project} projects={this.props.projects} />
				<ProjectLayout.Body project={this.props.project}>
					<Container>
						{ this.state.projectMetrics ? <ProjectMetricsTable projectMetrics={this.state.projectMetrics} /> : <Loading /> }
					</Container>
				</ProjectLayout.Body>
				<ProjectLayout.Footer />
			</ProjectLayout>
		);

		return <Loading />;
	}
}
