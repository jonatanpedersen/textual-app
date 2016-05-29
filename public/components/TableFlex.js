import React from 'react';
import TableFlexStyles from './TableFlex.css';
import classnames from 'classnames';
import AutosizeTextarea from 'react-autosize-textarea';
import { Button } from './Button';
import Octicon from 'react-octicon';

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
							<TableFlex.Column key={columnIndex} onClick={this.props.onCellClick && this.props.onCellClick.bind(this, rowIndex, columnIndex)}>
								{ this.props.rowIndex === rowIndex && this.props.columnIndex === columnIndex && <AutosizeTextarea autoFocus onChange={this.props.onCellChange} onBlur={this.props.onCellBlur} value={this.props.value}></AutosizeTextarea> }
								{ (this.props.rowIndex !== rowIndex || this.props.columnIndex !== columnIndex) && <span>{row[columnIndex]}</span> }
							</TableFlex.Column>
						);
					})}
					<TableFlex.Column>
						<Button color="primary" onClick={this.props.onRemoveRowButtonClick && this.props.onRemoveRowButtonClick.bind(this, rowIndex)}><Octicon name="trashcan" /></Button>
					</TableFlex.Column>
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
						<TableFlex.Column>
						</TableFlex.Column>
					</TableFlex.Row>
				</TableFlex.Header>
				<TableFlex.Body>
					{rows}
				</TableFlex.Body>
				<TableFlex.Footer>
					<TableFlex.Row>
						{this.props.data && this.props.data[0].map((column, columnIndex) => {
							return (
								<TableFlex.Column key={columnIndex} onClick={this.props.onCellClick && this.props.onCellClick.bind(this, -1, columnIndex)}>
									{ this.props.rowIndex === -1 && this.props.columnIndex === columnIndex && <AutosizeTextarea autoFocus onChange={this.props.onCellChange} onBlur={this.props.onCellBlur} value={this.props.value}></AutosizeTextarea> }
									{ (this.props.rowIndex !== -1 || this.props.columnIndex !== columnIndex) && <span>{this.props.newRow && this.props.newRow[columnIndex]}</span> }
								</TableFlex.Column>
							);
						})}
						<TableFlex.Column>
							<Button color="primary" onClick={this.props.onAddRowButtonClick && this.props.onAddRowButtonClick.bind(this, -1)}><Octicon name="plus" /></Button>
						</TableFlex.Column>
					</TableFlex.Row>
				</TableFlex.Footer>
			</TableFlex>
		);
	}
}
