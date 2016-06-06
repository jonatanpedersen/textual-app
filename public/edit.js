import React from 'react';
import { Link } from 'react-router';
import { Loading } from './components/Loading';

async function getSchema () {
	return Promise.resolve({
		"description": "Schema",
		"type": "object",
		"properties": {
			"name": {
				"description": "Name",
				"type": "string"
			},
			"contacts": {
				"description": "Contacts",
				"type": "array",
				"items": {
					"description": "Contact",
					"type": "object",
					"properties": {
						"firstName": {
							"description": "First name",
							"type": "string"
						},
						"lastName": {
							"description": "Last name",
							"type": "string"
						},
						"age": {
							"description": "Age in years",
							"type": "integer",
							"minimum": 0
						},
						"awesome": {
							"description": "Awesome?",
							"type": "boolean"
						}
					}
				}
			}
		}
	});
}

async function getData () {
	return Promise.resolve({
		name: 'my contacts',
		contacts: [
			{
				firstName: 'Jonatan',
				lastName: 'Pedersen',
				age: 34,
				awesome: true
			},
			{
				firstName: 'John',
				lastName: 'Doe',
				age: 31
			}
		]
	});
}

function getValue(object, path) {
	return path.reduce((value, key) => {
		return value[key];
	}, object);
}

export class Edit extends React.Component {
	constructor() {
		super();
		this.handleChange = this.handleChange.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.state = {};
		this.fetch();
	}

	fetch () {
		getSchema().then(schema => {
			getData().then(data => {
					this.setState({schema, data});
			});
		});
	}

	handleChange(path, event) {
		let data = this.state.data;
		let prop = path.pop();
		let value = getValue(data, path);
		value[prop] = event.target.value;

		this.setState({data});
	}

	handleClick(path, action, event) {
		let data = this.state.data;

		if (action === 'add') {
			let value = getValue(data, path);
			value.push({});
		} else if (action === 'remove') {
			let idx = path.pop();
			let array = getValue(data, path);
			array.splice(idx, 1);
		}

		this.setState({data});
	}

	handleSubmit(event) {
		event.preventDefault();
		let json = JSON.stringify(this.state.data, null, 4);

		console.log(json);
	}

	render() {
		let schema = this.state.schema;
		let data = this.state.data;

		if (schema && data) {
			return (
				<form onSubmit={this.handleSubmit}>
					<Editor schema={schema} data={data} onChange={this.handleChange} onClick={this.handleClick} />
					<button>Submit</button>
				</form>
			);
		}

		return <Loading />;
	}
}

export class Editor extends React.Component {
	render() {
		return (
			<div>
				<ObjectComponent schema={this.props.schema} data={this.props.data} onChange={this.props.onChange} onClick={this.props.onClick} path={[]} />
			</div>
		);
	}
}

function getComponent(type) {
	let types = {
		'array': ArrayComponent,
		'boolean': BooleanComponent,
		'integer': IntegerComponent,
		'object': ObjectComponent,
		'string': StringComponent
	};

	return types[type];
}

export class Header extends React.Component {
	render () {
		let path = this.props.path || [];
		let size = Math.min(path.length, 6);

		return [
			<h1>{this.props.children}</h1>,
			<h2>{this.props.children}</h2>,
			<h3>{this.props.children}</h3>,
			<h4>{this.props.children}</h4>,
			<h5>{this.props.children}</h5>,
			<h6>{this.props.children}</h6>,
		][size];
	}
}

export class ArrayComponent extends React.Component {
	render() {
		let data = this.props.data || [];
		let path = this.props.path || [];
		let schema = this.props.schema;

		let items = data.map((item, idx) => {
			let itemSchema = schema.items;
			let itemData = item;
			let itemComponentType = getComponent(itemSchema.type);
			let path = [...this.props.path, idx];
			let key = path.join('.');

			let itemComponent = React.createElement(itemComponentType, { path, schema: itemSchema, data: itemData, onClick: this.props.onClick, onChange: this.props.onChange });

			return (<div className="item" key={key}>
				{itemComponent}
				<button type="button" onClick={this.props.onClick.bind(null, path, 'remove')}>Remove</button>
			</div>);
		});

		return (
			<div className="array-component component">
				<Header path={path}>{schema.description}</Header>
				{items}
				<button type="button" onClick={this.props.onClick.bind(null, [...this.props.path], 'add')}>Add</button>
			</div>
		);
	}
}

export class ObjectComponent extends React.Component {
	render() {
		let data = this.props.data || {};
		let path = this.props.path || [];
		let schema = this.props.schema;

		let propertyNames = Object.keys(schema.properties);
		let properties = propertyNames.map(propertyName => {
			let propertySchema = schema.properties[propertyName];
			let propertyData = data[propertyName];
			let propertyComponentType = getComponent(propertySchema.type);
			let path = [...this.props.path, propertyName];
			let key = path.join('.');

			return (
				<div className="property" key={key}>
					{ React.createElement(propertyComponentType, { path, schema: propertySchema, data: propertyData, onClick: this.props.onClick, onChange: this.props.onChange}) }
				</div>
			);
		});

		return (
			<div className="object-component component">
				<Header path={path}>{schema.description}</Header>
				{properties}
			</div>
		);
	}
}

export class StringComponent extends React.Component {
	render() {
		let schema = this.props.schema || 0;
		let data = this.props.data || '';
		let path = this.props.path || [];
		let id = path.join('.');

		return (
			<div className="string-component component">
				<label htmlFor={id}>{schema.description}</label>
				<input type="text" id={id} value={data} onChange={this.props.onChange.bind(null, path)} />
			</div>
		);
	}
}

export class IntegerComponent extends React.Component {
	render() {
		let schema = this.props.schema || 0;
		let data = this.props.data || 0;
		let path = this.props.path || [];
		let id = path.join('.');

		return (
			<div className="number-component component">
				<label htmlFor={id}>{schema.description}</label>
				<input type="number" id={id} value={data} onChange={this.props.onChange.bind(null, path)} />
			</div>
		);
	}
}

export class BooleanComponent extends React.Component {
	constructor(props) {
    super(props);
    this.state = { isChecked: props.data };
    this.onChange = this.onChange.bind(this);
  }

	onChange(event) {
		let isChecked = !this.state.isChecked;
    this.setState({isChecked});
		event.target.value = isChecked;
		this.props.onChange(this.props.path, event);
  }

	render() {
		let schema = this.props.schema || 0;
		let data = this.props.data || 0;
		let path = this.props.path || [];
		let id = path.join('.');

		return (
			<div className="number-component component">
				<label htmlFor={id}>
					<input type="checkbox" id={id} value={true} checked={this.state.isChecked} onChange={this.onChange} />
					{schema.description}
				</label>
			</div>
		);
	}
}
