import React, { Component } from 'react';

/**
 * A component to display fetched data. It displays loader during the call.
 * When data is fetched it shows Object name as a link pointing to its NASA's database entry.
 * Additionally it displays approach or diameter data based on user selected option.
 * In case of error or no data it doesn't show or say anything.
 **/
class Display extends Component {

  /**
   * Format number to keep only two last digits in fractional portion.
   * We use regex here and it is a terrible way to format numbers. Never do that!
   * Only reason we do it this way here is that it is simple. In theory this function
   * must be rewritten.
   **/
  formatNumber(number) {
    return String(number).replaceAll(/^(\d*\.\d{2}).*$/g, "$1");
  }

  render() {
    return (
      <div className="display">
        {this.props.loading &&
          /* Yes, we should have better loader here. Some other day. Maybe... */
          <span class="loader">Loading</span>
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
