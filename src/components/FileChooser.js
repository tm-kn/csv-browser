import React, { Component, PropTypes } from 'react';

export default class FileChooser extends Component {
  static propTypes = {
    accept: PropTypes.string,
    onChangeFile: PropTypes.func.isRequired
  };

  constructor() {
    super();

    this.state = {
      changingFile: undefined
    };

    this.handleChangeFile = this.handleChangeFile.bind(this);
    this.handleSubmitFile = this.handleSubmitFile.bind(this);
  }

  render() {
    return (
      <div>
        <h1>Select file</h1>
        <p>Select the file you want to open.</p>
        <form onSubmit={this.handleSubmitFile}>
          <input
            accept={this.props.accept}
            name="csvFile"
            onChange={this.handleChangeFile}
            type="file"
          />
          <input
            className="button"
            disabled={!this.state.changingFile}
            type="submit"
            value="Load to the browser"
          />
        </form>
      </div>
    );
  }

  handleChangeFile(event) {
    const target = event.target;

    this.setState(() => ({
      changingFile: target.files[0]
    }));
  }

  handleSubmitFile(event) {
    event.preventDefault();

    if (!this.state.changingFile) {
      alert('Please choose a file first');
      return;
    }

    this.props.onChangeFile(this.state.changingFile);

    this.setState(state => ({
      changingFile: undefined
    }));
  }
}
