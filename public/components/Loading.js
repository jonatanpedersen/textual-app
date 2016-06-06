import React from 'react';
import Octicon from 'react-octicon';

export class Loading extends React.Component	{
	render() {
		return (
			<div className="loading">
				<Octicon name="clock" spin={true} />
			</div>
		);
	}
}
