import React, { Component } from 'react';

class Display extends Component {

  formatNumber(number) {
    return String(number).replaceAll(/^(\d*\.\d{2}).*$/g, "$1");
  }

  render() {
    return (
      <div className="display">
        {this.props.loading &&
          /* Yes, we should have better loader here. Some other day. */
          <span>Loading...</span>
        }
        {this.props.data && !this.props.loading &&
          <a href={this.props.data.url}>{this.props.data.name}</a>
        }
        {this.props.data && this.props.data.approachDistance &&
          <span>Closest approach {this.formatNumber(this.props.data.approachDistance)}km on {this.props.data.approachDate}</span>
        }
        {this.props.data && this.props.data.diameterMin &&
          <span>Estimated diameter {this.formatNumber(this.props.data.diameterMin)}m &mdash; {this.formatNumber(this.props.data.diameterMax)}m</span>
        }
      </div>
    )
  }
}

export default Display;
