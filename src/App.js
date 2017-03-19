import React, { Component } from 'react';
import './App.css';

import CsvBrowser from './CsvBrowser';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>CSV Browser</h2>
        </div>
        <CsvBrowser />
      </div>
    );
  }
}

export default App;
