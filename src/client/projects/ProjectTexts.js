import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import { DataBoundFlexTable, TableFlex } from '../components/TableFlex';
import { del, get, patch, put, post } from '../api';
import AutosizeTextarea from 'react-autosize-textarea';
import Octicon from 'react-octicon';
import ProjectsStyles from './projects.scss';
import { Loading } from '../components/Loading';
import classnames from 'classnames';
import Shortcuts from 'react-shortcuts/component';
import { ProjectLayout } from './ProjectLayout';

export async function getProject(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}`);
}

export async function createProject(newProject) {
	return post('/api/projects', newProject);
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

export async function getProjectSettings(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}/settings`);
}

export async function renameProject(projectIdOrName, newProjectName) {
	return post(`/api/projects/${projectIdOrName}/rename`, {newProjectName});
}

export async function deleteProject(projectIdOrName) {
	return del(`/api/projects/${projectIdOrName}`);
}

export async function updateProjectSettings(projectIdOrName, newProjectSettings) {
	return put(`/api/projects/${projectIdOrName}/settings`, newProjectSettings);
}

export async function getProjectTexts(projectIdOrName) {
	return get(`/api/projects/${projectIdOrName}/texts`);
}

export function updateProjectTexts(projectIdOrName, newProjectTexts) {
	return put(`/api/projects/${projectIdOrName}/texts`, newProjectTexts);
}

export function patchProjectTexts(projectIdOrName, projectTextsPatch) {
	return patch(`/api/projects/${projectIdOrName}/texts`, projectTextsPatch);
}

export function addProjectText(projectIdOrName, textId, text) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'add',
			 path: '/' + textId,
			 value: text
		 }
	 ]);
 }

 export function addProjectTextValue(projectIdOrName, textId, languageCode, value) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'add',
			 path: '/' + textId + '/' + languageCode,
			 value: value
		 }
	 ]);
 }

 export function replaceProjectTextValue(projectIdOrName, textId, languageCode, value) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'replace',
			 path: '/' + textId + '/' + languageCode,
			 value: value
		 }
	 ]);
 }

 export function removeProjectTextValue(projectIdOrName, textId, languageCode) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'remove',
			 path: '/' + textId + '/' + languageCode
		 }
	 ]);
 }

 export function removeProjectText(projectIdOrName, textId) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'remove',
			 path: '/' + textId
		 }
	 ]);
 }

 export function moveProjectText(projectIdOrName, fromTextId, toTextId) {
	 return patchProjectTexts(projectIdOrName, [
		 {
			 op: 'move',
			 from: '/' + fromTextId,
			 path: '/' + toTextId
		 }
	 ]);
 }

export class ProjectTexts extends React.Component	{
	constructor(props) {
		super(props);
		this.state = {
			offset: 0,
			length: 20,
			filter: null
		};
		this.handleCellChange = this.handleCellChange.bind(this);
		this.handleAddRow = this.handleAddRow.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.handlePaginationChange = this.handlePaginationChange.bind(this);
		this.handleRemoveRow = this.handleRemoveRow.bind(this);
		this.handleShortcuts = this.handleShortcuts.bind(this);
	}

	componentDidMount() {
		this.fetch(this.props.params.projectName);
	}

	componentWillReceiveProps (nextProps) {
		if (nextProps.params.projectName !== this.props.params.projectName) {
			this.setState({data: undefined});
			this.fetch(nextProps.params.projectName);
		}
	}

	fetch (projectName) {
		getProjectSettings(projectName).then(projectSettings => {
			getProjectTexts(projectName).then(projectTexts => {
				let textIds = Object.keys(projectTexts);

				let data = [['Text Id', ...projectSettings.languages], ...textIds.map((textId, idx) => {
					return [textId, ...projectSettings.languages.map(language => projectTexts[textId][language])];
				})];

				this.setState({data, rowIndex: -1, columnIndex: -1});
			});
		});
	}

	handleCellChange (rowIndex, columnIndex, newValue, event) {
		let oldValue = this.state.data[rowIndex][columnIndex];

		if (oldValue === newValue) {
			return;
		}

		if (columnIndex === 0) {
			moveProjectText(this.props.params.projectName, oldValue, newValue);
		} else {
			let textId = this.state.data[rowIndex][0];
			let language = this.state.data[0][columnIndex];

			if (oldValue === undefined) {
				addProjectTextValue(this.props.params.projectName, textId, language, newValue);
			} else {
				replaceProjectTextValue(this.props.params.projectName, textId, language, newValue);
			}
		}

		let data = this.state.data;
		data[rowIndex][columnIndex] = newValue;

		this.setState({ data });
	}

	handleAddRow (newRow) {
		let data = this.state.data;

		let textId = newRow[0];
		let newText = data[0].slice(1).reduce((newText, language, index) => {
			newText[language] = newRow[index + 1];

			return newText;
		}, {});

		addProjectText(this.props.params.projectName, textId, newText).then(() => {
			data.push(newRow);
			let rowIndex = null;
			let columnIndex = null;

			this.setState({ data, rowIndex, columnIndex });
		});
	}

	handleFilterChange (event) {
		let filter = event.target.value;
		let offset = 0;
		let length = 10;

		this.setState({filter, offset, length});
	}

	handlePaginationChange (offset, length) {
		this.setState({offset, length});
	}

	handleRemoveRow (rowIndex) {
		let data = this.state.data;
		let textId = data[rowIndex][0];

		removeProjectText(this.props.params.projectName, textId).then(() => {
			data.splice(rowIndex, 1);
			this.setState({ data });
		});
	}

	handleShortcuts (action, event) {
		switch (action) {
			case 'SEARCH': break;
		}
	}

	focusRef (component) {
		let domNode = ReactDOM.findDOMNode(component);
		if (domNode && domNode.focus) {
			domNode.focus();
		}
	}

	render() {
		let { data, filter, offset, length } = this.state;

		if (data) {
			let filteredData = filterData(data, filter);
			let paginatedData = paginateData(filteredData, offset, length);
			let count = filteredData.filter(row => row !== undefined).length;

			let content = <DataBoundFlexTable
				data={paginatedData}
				highlight={filter}
				onCellChange={this.handleCellChange}
				onRemoveRow={this.handleRemoveRow}
				onAddRow={this.handleAddRow}
			/>;

			return (
				<Shortcuts name="ProjectTexts" handler={this.handleShortcuts} ref={this.focusRef}>
					<ProjectLayout className="project-texts-layout">
						<ProjectLayout.Header onProjectDropdownChange={this.props.handleProjectDropdownChange} selectedProject={this.props.project} projects={this.props.projects}>
							<ProjectTextsFilter value={filter} ref="filter" onChange={this.handleFilterChange} />
						</ProjectLayout.Header>
						<ProjectLayout.Body project={this.props.project}>
							{content}
						</ProjectLayout.Body>
						<ProjectLayout.Footer>
							<ProjectTextsPagination offset={offset} length={length} count={count} onChange={this.handlePaginationChange} />
						</ProjectLayout.Footer>
					</ProjectLayout>
				</Shortcuts>
			);
		} else {
			return <Loading />;
		}
	}
}

function paginateData (data, offset, length) {
	let visibleIdx = 0;

	return data.map((row, idx) => {
		if (idx === 0) {
			return row;
		}

		if (row !== undefined) {
			visibleIdx++;
		}

		return (visibleIdx > offset && visibleIdx <= offset + length) ? row : undefined;
	});
}

function filterData (data, filter) {
	if (data && filter) {
		let pattern;
		try {
			pattern = new RegExp(filter, 'im');
		} catch (err) {
			return data;
		}

		return data.map((row, idx) => {
			if (idx === 0) {
				return row;
			}

			return row.some(cell => pattern.test(cell)) ? row : undefined;
		}) || [];
	}

	return data;
}

export class ProjectTextsPagination extends React.Component {
	render() {
		let { offset, length, count } = this.props;

		return (
			<span className="pagination">
				<span className="pagination__text">Showing <strong>{offset + 1}</strong> to <strong>{offset + length < count ? offset + length : count}</strong> of <strong>{count}</strong></span>
				<button className="pagination__button button" disabled={offset === 0} onClick={() => this.props.onChange && this.props.onChange(offset - length, length)}>Previous</button>
				<button className="pagination__button button" disabled={offset + length > count} onClick={() => this.props.onChange && this.props.onChange(offset + length, length)}>Next</button>
			</span>
		);
	}
}

export class ProjectTextsFilter extends React.Component {
	render() {
		let value = this.props.value || '';
		return <input className="filter" type="text" value={value} onChange={this.props.onChange} placeholder="filter" />
	}
}
