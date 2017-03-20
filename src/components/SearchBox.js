import React, { Component, PropTypes } from 'react';

export default class SearchBox extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired
  };

  constructor() {
    super();

    this.state = {
      changingSearch: ''
    };

    this.handleSubmitSearch = this.handleSubmitSearch.bind(this);
  }

  render() {
    if (this.props.value) {
      return (
        <p>Searching by: {this.props.value}</p>
      );
    }

    return (
      <form onSubmit={this.handleSubmitSearch}>
        <input
          type="text"
          name="search"
          placeholder="Search..."
          onChange={(event) => {
            const target = event.target;

            this.setState(() => ({
              changingSearch: target.value
            }));
          }}
          value={this.state.changingSearch}
        />
        <input
          type="submit"
          className="button"
          name="submitSearch"
          value="Search"
        />
      </form>
    );
  }

  handleSubmitSearch(event) {
    event.preventDefault();

    if (!this.state.changingSearch) {
      alert('Search string cannot be empty');
      return;
    }

    this.props.onChange(this.state.changingSearch);

    this.setState(state => ({
      changingSearch: ''
    }));

  }
}
