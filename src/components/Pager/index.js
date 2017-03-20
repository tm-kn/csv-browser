import { Component, PropTypes } from 'react';

import template from './Pager.jsx';

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
    return template.call(this);
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
