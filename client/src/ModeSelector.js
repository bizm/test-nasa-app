import React, { Component } from 'react';
import * as Constants from './constants';

class ModeSelector extends Component {
  constructor() {
    super();
    this.state = {
      mode: null,
      year: new Date().getFullYear()
    };
  }

  handleModeChange = e => {
    this.setState({
      mode: e.currentTarget.value
    }, this.doParentCallback);
  }

  handleYearChange = e => {
    const value = (e.target.value === "") ? null : Number(e.target.value);
    this.setState({
      year: value
    }, this.doParentCallback);
  }

  doParentCallback = () => {
    let data = {
      mode: this.state.mode,
      year: this.state.year
    };
    if (!data.mode) {
      return;
    }
    if (data.mode === Constants.MODE_DECEMBER_2015) {
      delete data.year;
    } else if (!this.state.year) {
      return;
    }
    this.props.parentCallback(data);
  }

  clear() {
    console.log("clearing it");
    this.setState({ mode: undefined });
  }

  render() {
    return (
      <div className="mode-selector">Choose an option below to show
        <label><input type="radio" value={Constants.MODE_DECEMBER_2015} name="mode"
          checked={this.state.mode === Constants.MODE_DECEMBER_2015}
          onChange={this.handleModeChange} />
          the asteroid that passed the closest to Earth between December 19 and December 26 year 2015</label>
        <label><input type="radio" value={Constants.MODE_SELECTED_YEAR} name="mode"
          checked={this.state.mode === Constants.MODE_SELECTED_YEAR}
          onChange={this.handleModeChange} />the largest asteroid for year
          {/* will work in HTML5 only, normally we should use some proper component in here */}
          <input type="number" value={this.state.year} onChange={this.handleYearChange}
            disabled={this.state.mode !== Constants.MODE_SELECTED_YEAR } />
        </label>
      </div>
    );
  }
}

export default ModeSelector;
