import React from 'react';
import { SideBar, SideBarLink } from '../components/SideBar';
import { Text } from '../components/Text';
import classnames from 'classnames';
import Octicon from 'react-octicon';
import { browserHistory } from 'react-router';

export class ProjectSideBar extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let project = this.props.project || {};

		return (
			<SideBar isClosed={this.props.isClosed}>
				<SideBar.ItemGroup>
					<SideBar.Item onClick={() => browserHistory.push(`/projects/${project.name}`)}>
						<SideBar.Item.Icon>
							<Octicon name="pencil" />
						</SideBar.Item.Icon>
						<SideBar.Item.Text>
							<Text>Texts</Text>
						</SideBar.Item.Text>
					</SideBar.Item>
					<SideBar.Item onClick={() => browserHistory.push(`/projects/${project.name}/metrics`)}>
						<SideBar.Item.Icon>
							<Octicon name="graph" />
						</SideBar.Item.Icon>
						<SideBar.Item.Text>
							<Text>Metrics</Text>
						</SideBar.Item.Text>
					</SideBar.Item>
					<SideBar.Item onClick={() => browserHistory.push(`/projects/${project.name}/settings`)}>
						<SideBar.Item.Icon>
							<Octicon name="gear" />
						</SideBar.Item.Icon>
						<SideBar.Item.Text>
							<Text>Settings</Text>
						</SideBar.Item.Text>
					</SideBar.Item>
				</SideBar.ItemGroup>
				<SideBar.ItemGroup>
					<SideBar.Item onClick={() => browserHistory.push(`/user`)}>
						<SideBar.Item.Icon>
							<Octicon name="person" />
						</SideBar.Item.Icon>
						<SideBar.Item.Text>
							<Text>User Profile</Text>
						</SideBar.Item.Text>
					</SideBar.Item>
					<SideBar.Item onClick={() => browserHistory.push(`/logout`)}>
						<SideBar.Item.Icon>
							<Octicon name="sign-out" />
						</SideBar.Item.Icon>
						<SideBar.Item.Text>
							<Text>Log out</Text>
						</SideBar.Item.Text>
					</SideBar.Item>
				</SideBar.ItemGroup>
			</SideBar>
		);
	}
}
