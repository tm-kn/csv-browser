import React from 'react';

import { FileChooser, LoadingIndicator } from 'components';

export default function render() {
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
              {`${key}: ${this.state.fileHash[key]} `}
              <a
                href={'data:text/plain;charset=utf-8,' + encodeURIComponent(this.state.fileHash[key])}
                download={this.state.file.name + '.' + key}
              >
                [Dowload]
              </a>
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
