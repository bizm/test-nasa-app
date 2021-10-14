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
  }

  handleModeChange = (data) => {
    if (this.timeoutIdApi) {
      this.timeoutIdApi = clearTimeout(this.timeoutIdApi);
    }
    this.timeoutIdApi = setTimeout(() => {
      this.callAPI(data);
    }, Constants.TIMEOUT_API_CALL);
  }

  callAPI = (data) => {
    this.setState({
      mode: data.mode,
      loading: true,
      data: null
    });
    API.fetch(data.mode, data.year)
      .then(response => {
        const displayData = {
          name: response.name,
          url: response.nasa_jpl_url
        };
        if (data.mode === Constants.MODE_DECEMBER_2015) {
          displayData.approachDistance = response.close_approach_data[0].miss_distance.kilometers;
          displayData.approachDate = response.close_approach_data[0].close_approach_date;
        }
        if (data.mode === Constants.MODE_SELECTED_YEAR) {
          displayData.diameterMin = response.estimated_diameter.meters.estimated_diameter_min;
          displayData.diameterMax = response.estimated_diameter.meters.estimated_diameter_max;
        }
        this.setState({
          loading: false,
          data: displayData
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
          data: null,
          mode: null
        });
        console.error(err);
      });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Test assignment for New Things Co | Valentyn Derkach</h1>
        </header>
        <ModeSelector parentCallback={this.handleModeChange} />
        <Display loading={this.state.loading} data={this.state.data} />
      </div>
    );
  }
}

export default App;
