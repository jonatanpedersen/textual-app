import React from 'react';
import ReactDOM from 'react-dom';
import TableFlexStyles from './TableFlex.css';
import classnames from 'classnames';
import AutosizeTextarea from 'react-autosize-textarea';
import { Button } from './Button';
import Octicon from 'react-octicon';
import Shortcuts from 'react-shortcuts/component';

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
	constructor (props) {
		super(props);
		this.state = { rowIndex: 1, columnIndex: 1 };
		this.handleAddRowButtonClick = this.handleAddRowButtonClick.bind(this);
		this.handleCellClick = this.handleCellClick.bind(this);
		this.handleCellChange = this.handleCellChange.bind(this);
		this.handleRemoveRowButtonClick = this.handleRemoveRowButtonClick.bind(this);
		this.handleShortcuts = this.handleShortcuts.bind(this);
		this.blur = this.blur.bind(this);
		this.focus = this.focus.bind(this);
		this.move = this.move.bind(this);
		this.moveTo = this.moveTo.bind(this);
	}

	blur () {
		this.setState({focused: false});
	}

	focus () {
		this.setState({focused: true});
	}

	move (rowOffset, columnOffset) {
		this.moveTo(this.state.rowIndex + rowOffset, this.state.columnIndex + columnOffset);
	}

	moveTo (newRowIndex, newColumnIndex) {
		if ((newRowIndex !== this.state.rowIndex || newColumnIndex !== this.state.columnIndex) && ((newRowIndex === -1 || newRowIndex > 0) && newRowIndex < this.props.data.length) && (newColumnIndex > 0 && newColumnIndex < this.props.data[0].length)) {
			this.setState({ rowIndex: newRowIndex, columnIndex: newColumnIndex});
		}
	}

	handleShortcuts (action, event) {
		if (!this.state.focused) {
			switch (action) {
				case 'UP': this.move(-1, 0); event.preventDefault(); break;
				case 'RIGHT': this.move(0, 1); event.preventDefault(); break;
				case 'DOWN': this.move(1, 0); event.preventDefault(); break;
				case 'LEFT': this.move(0, -1); event.preventDefault(); break;
				case 'ENTER': this.focus(); event.preventDefault(); break;
				case 'ESCAPE': this.blur(); break;
			}
		}
	}

	focusRef (component) {
		let domNode = ReactDOM.findDOMNode(component);
		if (domNode && domNode.focus) {
			domNode.focus();
		}
	}

	handleCellChange (rowIndex, columnIndex, newValue) {
		this.blur();

		if (rowIndex === -1) {
			let newRow = this.state.newRow || [];
			newRow[columnIndex] = newValue;
			this.setState({newRow});

			return;
		} else {
			this.props.onCellChange && this.props.onCellChange(rowIndex, columnIndex, newValue);
		}
	}

	handleCellClick (rowIndex, columnIndex) {
		if (this.state.rowIndex === rowIndex && this.state.columnIndex === columnIndex) {
			this.focus();
		} else {
			this.moveTo(rowIndex, columnIndex);
		}
	}

	handleAddRowButtonClick () {
		this.props.onAddRow && this.props.onAddRow([...this.state.newRow]);
		this.setState({newRow: undefined});
	}

	handleRemoveRowButtonClick (rowIndex) {
		this.props.onRemoveRow && this.props.onRemoveRow(rowIndex);
	}

	render() {
		let headerRow = this.props.data[0];
		let newRow = this.state.newRow || [];
		newRow[0] = this.props.data.length;

		let rows = this.props.data && this.props.data.slice(1).map((row, rowIndex) => {
			rowIndex++;
			return (
				<TableFlex.Row key={rowIndex}>
					{row.map((column, columnIndex) => {
						return (
							<DataBoundFlexTableColumn
								key={columnIndex}
								onChange={this.handleCellChange.bind(this, rowIndex, columnIndex)}
								onClick={this.handleCellClick.bind(this, rowIndex, columnIndex)}
								focused={rowIndex === this.state.rowIndex && columnIndex === this.state.columnIndex && this.state.focused}
								selected={rowIndex === this.state.rowIndex && columnIndex === this.state.columnIndex}
								placeholder={row[columnIndex]}
								value={row[columnIndex]}
							/>
						);
					})}
					<TableFlex.Column>
						<Button color="primary" onClick={this.handleRemoveRowButtonClick && this.handleRemoveRowButtonClick.bind(this, rowIndex)}><Octicon name="trashcan" /></Button>
					</TableFlex.Column>
				</TableFlex.Row>
			);
		});

		return (
			<Shortcuts name="DataBoundFlexTable" handler={this.handleShortcuts} ref={this.focusRef}>
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
						<TableFlex.Row key={newRow[0]}>
							{this.props.data && this.props.data[0].map((column, columnIndex) => {
								return (
									<DataBoundFlexTableColumn
										key={columnIndex}
										onChange={this.handleCellChange.bind(this, -1, columnIndex)}
										onClick={this.handleCellClick.bind(this, -1, columnIndex)}
										selected={this.state.rowIndex === -1 && columnIndex === this.state.columnIndex}
										focused={this.state.rowIndex === -1 && columnIndex === this.state.columnIndex && this.state.focused}
										placeholder={headerRow[columnIndex]}
										value={newRow[columnIndex]}
									/>
								);
							})}
							<TableFlex.Column>
								<Button color="primary" onClick={this.handleAddRowButtonClick && this.handleAddRowButtonClick.bind(this, -1)}><Octicon name="plus" /></Button>
							</TableFlex.Column>
						</TableFlex.Row>
					</TableFlex.Footer>
				</TableFlex>
			</Shortcuts>
		);
	}
}

export class DataBoundFlexTableColumn extends React.Component	{
	constructor (props) {
		super (props);

		this.handleClick = this.handleClick.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);

		this.state = {};
	}

	handleBlur (event) {
		let oldValue = this.props.value;
		let newValue = this.state.value || this.props.value;

		this.props.onChange && this.props.onChange(newValue);
	}

	handleChange (event) {
		let value = event.target.value;
		this.setState({value});
	}

	handleClick (event) {
		this.props.onClick && this.props.onClick();
	}

	render() {
		let placeholder = this.props.placeholder;
		let selected = this.props.selected;
		let focused = this.props.focused;
		let value = focused ? this.state.value || this.props.value : this.props.value;

		let child;

		if (selected && focused) {
			child = <AutosizeTextarea
				autoFocus
				onChange={this.handleChange}
				onBlur={this.handleBlur}
				value={value}
				placeholder={placeholder}>
			</AutosizeTextarea>;
		} else {
			child = <span>{value || placeholder}</span>;
		}

		return (
			<TableFlex.Column
				onClick={this.handleClick}
				className={{selected}}>
				{child}
			</TableFlex.Column>
		);
	}

	shouldComponentUpdate (nextProps, nextState) {
		return this.props.placeholder !== nextProps.placeholder ||
			this.props.focused !== nextProps.focused ||
			this.props.selected !== nextProps.selected ||
			this.props.value !== nextProps.value ||
			this.state.value !== nextState.value;
	}
}
