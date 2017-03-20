import React, { Component } from 'react';

import { FileChooser, LoadingIndicator } from '../components';
import { getFileHashes } from '../utils/file';
import './File-hash-check.css';

export default class FileHashCheck extends Component {
  constructor() {
    super();

    this.state = {
      error: '',
      file: undefined,
      fileHash: {},
      userHashes: '',
      loading: false
    };

    this.isValidWithUserHash = this.isValidWithUserHash.bind(this);
    this.loadFile = this.loadFile.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // File changed
    if (this.state.file && this.state.file !== prevState.file) {
      this.loadFile();
    }
  }

  render() {
    if (this.state.loading) {
      return <LoadingIndicator />;
    }

    return (
      <div>
        {(() => {
          if (!this.state.file) {
            return (
               <FileChooser
                onChangeFile={file => this.setState(() => ({ file }))}
              />
            );
          }
        })()}
        {this.state.error && (<p>Error: {this.state.error}</p>)}
        {this.state.file && (<h1>File: {this.state.file.name}</h1>)}
        {(() => {
          if (this.state.file) {
            return (
              <button
                className="button"
                onClick={() => this.setState(() => ({ error: '', file: undefined, userHashes: '', fileHash: {} }))}
              >
                Unload file
              </button>
            );
          }
        })()}
        <ul>
          {Object.keys(this.state.fileHash).map(key => (
            <li key={key}>
              <span className={this.isValidWithUserHash(this.state.fileHash[key]) ? 'match' : 'no-match'}>
                {key}: {this.state.fileHash[key]}
              </span>
            </li>
          ))}
        </ul>
        {(() => {
          if (this.state.file) {
            return (
              <div>
                <p>Please input your hashes in order to see matches.</p>
                <p>You can input multiple hashes on new lines.</p>
                <textarea
                  style={{ width: '80%' }}
                  rows="20"
                  onChange={(event) => {
                    const target = event.target;
                    this.setState((event) => ({ userHashes: target.value }));
                  }}
                />
              </div>
            );
          }
        })()}
      </div>
    );
  }

  loadFile() {
    this.setState(() => ({
      loading: true
    }));

    const handleComplete = (fileHash) => {
      this.setState(() => ({
        fileHash,
        loading: false
      }));
    };

    const handleError = (error) => {
      this.setState(() => ({
        error,
        loading: false
      }));
    };

    getFileHashes(this.state.file, handleComplete, handleError);
  }

  isValidWithUserHash(fileHash) {
    const pattern = new RegExp('^\\s*' + fileHash + '\\s*$', 'm');

    if (this.state.userHashes.search(pattern) !== -1) {
      return true;
    }

    return false;
  }
}
