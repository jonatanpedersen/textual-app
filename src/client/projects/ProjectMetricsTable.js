import React from 'react';

export class ProjectMetricsTable extends React.Component	{
	render() {
		return (
			<table className="project-metrics-table">
				<thead>
					<tr className="project-metrics-table__row">
						<th className="language-code">Language Code</th>
						<th className="coverage">Coverage</th>
					</tr>
				</thead>
				<tbody>
					{this.props.projectMetrics && this.props.projectMetrics.languages && this.props.projectMetrics.languages.map(language => {
						return (
							<tr className="project-metrics-table__row" key={language.code}>
								<td className="language-code">{language.code}</td>
								<td className="coverage">{language.coverage}%</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		);
	}
}
