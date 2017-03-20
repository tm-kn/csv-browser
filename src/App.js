import React, { Component } from 'react';

import { CsvBrowser, FileHashCheck, Home } from 'views';
import './App.css';

const CSV_BROWSER = 'CSV_BROWSER';
const FILE_HASH_CHECK = 'FILE_HASH_CHECK';

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      route: undefined
    };

    this.renderCurrentRoute = this.renderCurrentRoute.bind(this);
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>
            <a onClick={() => this.setState(() => ({ route: undefined }))}>
              CSV Browser
            </a>
          </h2>
        </div>
        {this.renderCurrentRoute()}
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

  /**
   * Dummy function that outputs view based on "route" in the state.
   */
  renderCurrentRoute() {
    if (!this.state.route) {
      return (
        <Home
          onChangeRoute={(route) => this.setState(() => ({ route }))}
        />
      );
    } else if (this.state.route === CSV_BROWSER) {
      return (
        <CsvBrowser />
      );
    } else if (this.state.route === FILE_HASH_CHECK) {
      return (
        <FileHashCheck />
      );
    } else {
      return (
        <div>
          <h1>Page not found</h1>
        </div>
      )
    }
  }
}
