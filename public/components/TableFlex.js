import React from 'react';
import TableFlexStyles from './TableFlex.css';
import classnames from 'classnames';
import AutosizeTextarea from 'react-autosize-textarea';
import { Button } from './Button';

export class TableFlexHeader extends React.Component {
  render() {
		let className = classnames('table-header', this.props.className);

    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
}

export class TableFlexBody extends React.Component {
  render() {
		let className = classnames('table-body', this.props.className);

    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
}

export class TableFlexFooter extends React.Component {
  render() {
		let className = classnames('table-footer', this.props.className);

    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
}

export class TableFlexRow extends React.Component {
  render() {
		let className = classnames('table-row', this.props.className);

    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
}

export class TableFlexColumn extends React.Component {
  render() {
		let className = classnames('table-column', this.props.className);

    return (
      <div className={className} onClick={this.props.onClick}>
        {this.props.children}
      </div>
    );
  }
}

export class TableFlex extends React.Component {
  render() {
		let className = classnames('table-flex', this.props.className);

    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }
}

TableFlex.Header = TableFlexHeader;
TableFlex.Body = TableFlexBody;
TableFlex.Footer = TableFlexFooter;
TableFlex.Row = TableFlexRow;
TableFlex.Column = TableFlexColumn;

export class DataBoundFlexTable extends React.Component	{
	render() {
		let rows = this.props.data && this.props.data.slice(1).map((row, rowIndex) => {
			rowIndex++;
			return (
				<TableFlex.Row key={rowIndex}>
					{row.map((column, columnIndex) => {
						return (
							<TableFlex.Column key={columnIndex} onClick={this.props.onClick && this.props.onClick.bind(this, rowIndex, columnIndex)}>
								{ this.props.rowIndex === rowIndex && this.props.columnIndex === columnIndex && <AutosizeTextarea autoFocus onChange={this.props.onChange} onBlur={this.props.onBlur} value={this.props.value}></AutosizeTextarea> }
								{ (this.props.rowIndex !== rowIndex || this.props.columnIndex !== columnIndex) && <span>{row[columnIndex]}</span> }
							</TableFlex.Column>
						);
					})}
				</TableFlex.Row>
			);
		});

		return (
			<TableFlex>
				<TableFlex.Header>
					<TableFlex.Row>
						{this.props.data && this.props.data[0].map(column => {
							return (
								<TableFlex.Column key={column}><span>{column}</span></TableFlex.Column>
							);
						})}
					</TableFlex.Row>
				</TableFlex.Header>
				<TableFlex.Body>
					{rows}
				</TableFlex.Body>
			</TableFlex>
		);
	}
}
