import React from 'react';
import FormsStyles from './Forms.scss';
import classnames from 'classnames';

export class Form extends React.Component {
	render() {
		let className = classnames('form', this.props.className);

		return (
			<form className={className} onSubmit={this.props.onSubmit}>
				{this.props.children}
			</form>
		);
	}
}

class FormBody extends React.Component {
	render() {
		let className = classnames('form__body', this.props.className);

		return (
			<main className={className}>
				{this.props.children}
			</main>
		);
	}
}

class FormParagraph extends React.Component {
	render() {
		let className = classnames('form-paragraph', this.props.className);

		return (
			<p className={className}>
				<label></label>
				{this.props.children}
			</p>
		);
	}
}

class FormFooter extends React.Component {
	render() {
		let className = classnames('form__footer', this.props.className);

		return (
			<footer className={className}>
				{this.props.children}
			</footer>
		);
	}
}

class FormHeader extends React.Component {
	render() {
		let className = classnames('form__header', this.props.className);

		return (
			<header className={className}>
				{this.props.children}
			</header>
		);
	}
}


Form.Body = FormBody;
Form.Paragraph = FormParagraph;
Form.Footer = FormFooter;
Form.Header = FormHeader;
