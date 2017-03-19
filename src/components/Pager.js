import React, { Component, PropTypes } from 'react';

export default class Pager extends Component {
  static defaultProps = {
    offsetValues: [15, 30, 60, 90]
  };

  static propTypes = {
    numberOfRecords: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    offsetValues: PropTypes.arrayOf(PropTypes.number),
    onChangePage: PropTypes.func.isRequired,
    onChangeOffset: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired
  };

  get numberOfPages() {
    const numberOfPages = Math.ceil(this.props.numberOfRecords / this.props.offset);

    return numberOfPages || 1;
  }

  constructor() {
    super();

    this.state = {
      changingPageNumber: ''
    };

    this.handleGoToPage = this.handleGoToPage.bind(this);
    this.handleNextPage = this.handleNextPage.bind(this);
    this.handleChangeOffset = this.handleChangeOffset.bind(this);
    this.handlePreviousPage = this.handlePreviousPage.bind(this);
    this.handleSubmitPageNumber = this.handleSubmitPageNumber.bind(this);
    this.previousPageExists = this.previousPageExists.bind(this);
    this.nextPageExists = this.nextPageExists.bind(this);
  }

  render() {
    return (
      <div>
        <button
          className="button"
          disabled={this.props.page === 1}
          onClick={() => this.handleGoToPage(1)}
        >
          First page
        </button>
        <button
          className="button"
          disabled={!this.previousPageExists()}
          onClick={this.handlePreviousPage}
        >
          Previous page
        </button>
        <span>
          {this.props.page} / {this.numberOfPages}
        </span>
        <button
          className="button"
          disabled={!this.nextPageExists()}
          onClick={this.handleNextPage}
        >
          Next page
        </button>
        <button
          className="button"
          disabled={this.state.page === this.numberOfPages}
          onClick={() => this.handleGoToPage(this.numberOfPages)}
        >
          Last page
        </button>
        <form onSubmit={this.handleSubmitPageNumber}>
          <input
            type="number"
            name="page"
            placeholder="Page number..."
            onChange={(event) =>  {
              const target = event.target;
              this.setState(() => ({
                changingPageNumber: target.value
              }));
            }}
            value={this.state.changingPageNumber}
          />
          <input
            className="button"
            type="submit"
            name="submitPageNumber"
            value="Go"
          />
        </form>
        <div>
          <p>Records found: {this.props.numberOfRecords}</p>
          <ul className="horizontal">
            <li>
              <span>Display:</span>
            </li>
            {this.props.offsetValues.map((item, key) => (
              <li key={key}>
                <button
                  disabled={this.props.offset === item}
                  className="button"
                  onClick={() => this.handleChangeOffset(item)}
                >
                  {item} records
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  handleGoToPage(page) {
    let newPage;

    if (newPage > this.numberOfPages) {
      newPage = this.numberOfPages;
    } else if (newPage < 1) {
      newPage = 1;
    } else {
      newPage = page;
    }

    this.props.onChangePage(newPage);
  }

  handleNextPage() {
    this.handleGoToPage(this.props.page + 1);
  }

  handleChangeOffset(offset) {
    const currentStartIndex = ((this.props.page - 1) * (this.props.offset));
    const newPage = Math.floor(currentStartIndex / offset) + 1;
    
    this.props.onChangeOffset(offset);
    this.handleGoToPage(newPage);
  }

  handlePreviousPage() {
    this.handleGoToPage(this.props.page - 1);
  }

  nextPageExists() {
    return (this.props.page < this.numberOfPages);
  }

  previousPageExists() {
    return (this.props.page > 1);
  }

  handleSubmitPageNumber(event) {
    event.preventDefault();

    if (
      this.state.changingPageNumber > this.numberOfPages
      || this.state.changingPageNumber <= 0
    ) {
      alert(`${this.state.changingPageNumber} is not a valid page number.`);
      return;
    }

    const pageNumber = parseInt(this.state.changingPageNumber, 10);
    this.setState(() => ({ changingPageNumber: '' }));
    this.handleGoToPage(parseInt(pageNumber, 10));
  }
}