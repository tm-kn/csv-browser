import React, { Component } from 'react';
import './App.css';

import { CsvBrowser } from './views';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>CSV Browser</h2>
        </div>
        <CsvBrowser />
        <footer>
          <ul>
            <li>
              Tomasz Knapik
            </li>
            <li>
              <a href="mailto:u1562595@unimail.hud.ac.uk">
                u1562595@unimail.hud.ac.uk
              </a>
            </li>
            <li>
              <a href="https://github.com/tm-kn/csv-browser">
                GitHub
              </a>
            </li>
          </ul>
        </footer>
      </div>
    );
  }
}
