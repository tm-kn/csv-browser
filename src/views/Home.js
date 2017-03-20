import React, { Component, PropTypes } from 'react';

const CSV_BROWSER = 'CSV_BROWSER';
const FILE_HASH_CHECK = 'FILE_HASH_CHECK';

export default class Home extends Component {
  static propTypes = {
    onChangeRoute: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        <h1>Choose an option</h1>
        <ul>
          <li>
            <button
              className="button"
              onClick={() => this.props.onChangeRoute(CSV_BROWSER)}
            >
              CSV Browser
            </button>
          </li>
          <li>
            <button
              className="button"
              onClick={() => this.props.onChangeRoute(FILE_HASH_CHECK )}
            >
              File Hashsum Check
            </button>
          </li>
        </ul>
      </div>
    );
  }
}
