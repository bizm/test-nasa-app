import React, { Component } from 'react';
import './App.css';
import ModeSelector from  './ModeSelector';
import Display from './Display';
import * as Constants from './constants';
import { API } from './api';

class App extends Component {

  timeoutIdApi = null;

  constructor(props) {
    super(props);
    this.state = {};
    this.modeSelector = React.createRef();
  }

  handleModeChange = (data) => {
    this.scheduleAPICall(data, Constants.TIMEOUT_UI_RESPONSE_DELAY);
  }

  scheduleAPICall = (data, timeout) => {
    if (this.timeoutIdApi) {
      this.timeoutIdApi = clearTimeout(this.timeoutIdApi);
    }
    this.timeoutIdApi = setTimeout(() => {
      this.callAPI(data);
    }, timeout);
  }

  callAPI = (data) => {
    this.setState({
      mode: data.mode,
      loading: true,
      data: null
    });
    API.fetch(data.mode, data.year)
      .then(response => {
        // not a nice way to handle it, but for now we treat null as a 202 response from API
        if (response === null) {
          return this.scheduleAPICall(data, Constants.TIMEOUT_RETRY);
        }

        this.setState({
          loading: false,
          data: this.makeDisplayData(data.mode, response)
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
          data: null,
          mode: null
        });
        this.modeSelector.current.clear();
        console.error(err);
      });
  }

  makeDisplayData(mode, response) {
    const displayData = {
      name: response.name,
      url: response.nasa_jpl_url
    };
    if (mode === Constants.MODE_DECEMBER_2015) {
      displayData.approachDistance = response.close_approach_data[0].miss_distance.kilometers;
      displayData.approachDate = response.close_approach_data[0].close_approach_date;
    }
    if (mode === Constants.MODE_SELECTED_YEAR) {
      displayData.diameterMin = response.estimated_diameter.meters.estimated_diameter_min;
      displayData.diameterMax = response.estimated_diameter.meters.estimated_diameter_max;
    }
    return displayData;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Test assignment for New Things Co | Valentyn Derkach</h1>
        </header>
        <ModeSelector parentCallback={this.handleModeChange} ref={this.modeSelector} />
        <Display loading={this.state.loading} data={this.state.data} />
      </div>
    );
  }
}

export default App;
