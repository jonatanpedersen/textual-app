import React from 'react';
import SideBarStyles from './SideBar.scss';
import classnames from 'classnames';

export class SideBar extends React.Component {
  render() {
		let className = classnames('sidebar', { 'sidebar--closed': this.props.isClosed }, this.props.className);

    return (
			<div className={className}>
				{this.props.children}
			</div>
    );
  }
}

export class SideBarItem extends React.Component {
  render() {
		let className = classnames('sidebar__item', this.props.className);

    return (
			<div className={className} onClick={this.props.onClick}>
				{this.props.children}
			</div>
    );
  }
}

export class SideBarItemText extends React.Component {
  render() {
		let className = classnames('sidebar__item__text', this.props.className);

    return (
			<div className={className}>
				{this.props.children}
			</div>
    );
  }
}

export class SideBarItemIcon extends React.Component {
  render() {
		let className = classnames('sidebar__item__icon', this.props.className);

    return (
			<div className={className}>
				{this.props.children}
			</div>
    );
  }
}

SideBarItem.Icon = SideBarItemIcon;
SideBarItem.Text = SideBarItemText;

export class SideBarItemGroup extends React.Component {
  render() {
		let className = classnames('sidebar__item-group', this.props.className);

    return (
			<div className={className}>
				{this.props.children}
			</div>
    );
  }
}

SideBar.Item = SideBarItem;
SideBar.ItemGroup = SideBarItemGroup;
