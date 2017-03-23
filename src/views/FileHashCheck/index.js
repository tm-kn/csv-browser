import { Component } from 'react';

import './FileHashCheck.css';
import template from './FileHashCheck.jsx';

const FileHashesWorker = require('workers/getFileHashes');

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
    return template.call(this);
  }

  /**
   * The file loading operation
   */
  loadFile() {
    this.setState(() => ({
      loading: true
    }));

    const worker = new FileHashesWorker();
    
    worker.onmessage = event => {
      const eventData = event.data;
      const status = eventData[0];
      const data = eventData[1];

      if (status === 'ok') {
        this.setState(() => ({
          fileHash: data,
          loading: false
        }));
      } else {
        this.setState(() => ({
          error: data,
          loading: false
        }));
      }
    };

    worker.postMessage(this.state.file);
  }

  /**
   * Compares the supplied hash with the user's multiline input of hashes (one hash per line).
   * @param {string} fileHash 
   * @returns {boolean}
   */
  isValidWithUserHash(fileHash) {
    const pattern = new RegExp('^\\s*' + fileHash + '\\s*$', 'mi');

    if (this.state.userHashes.search(pattern) !== -1) {
      return true;
    }

    return false;
  }
}
