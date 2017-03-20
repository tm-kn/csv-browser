import { Component } from 'react';

import { Pager } from 'components';
import { CSVArrayController } from 'utils';
import { loadAndParseCsvFile } from 'utils/file';

import template from './CsvBrowser.jsx';

export default class CsvBrowser extends Component {
  /**
   * Number of columns that will be used to generate the table header.
   * 
   * @description It might not reflect all the columns where number
   * of rows is different.
   */
  get numberOfColumns() {
    const entries = this.getEntriesForPage(this.state.page);

    return entries.length ? entries[0].length : 0;
  }

  /**
   * Number of records currently present in the processed
   * (e.g. sorted, grouped, etc.) array, not the raw array.
   */
  get numberOfRecords() {
    return this.state.processedLogEntries.length;
  }

  constructor() {
    super();

    this.state = {
      file: undefined,
      loading: false,
      error: undefined,
      logEntries: [],
      offset: Pager.defaultProps.offsetValues[0],
      page: 1,
      search: '',
      processedLogEntries: [],
      sortBy: {},
      groupBy: undefined
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.handeGroupByColumn = this.handleGroupByColumn.bind(this);
    this.handleSortByColumn = this.handleSortByColumn.bind(this);
    this.handleResetFilters = this.handleResetFilters.bind(this);
    this.loadCSVFile = this.loadCSVFile.bind(this);
    this.sortArray = this.sortArray.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // Sorting changed
    if (
      this.state.sortBy.columnId !== undefined
      && this.state.sortBy.ascending !== undefined &&
      this.state.sortBy !== prevState.sortBy
    ) {
      this.sortArray();
    }

    // Searching changed
    if (this.state.search !== undefined && this.state.search !== prevState.search) {
      this.searchArray();
    }

    // File changed
    if (this.state.file && this.state.file !== prevState.file) {
      this.loadCSVFile();
    }

    // Column used to group records changed
    if (this.state.groupBy !== undefined && this.state.groupBy !== prevState.groupBy) {
      this.groupArray();
    }
  }

  /**
   * Load CSV file to the view.
   */
  loadCSVFile() {
    this.setState(state => ({
      error: undefined,
      groupBy: undefined,
      loading: true,
      page: 1,
      sortBy: {}
    }));

    const onComplete = (data) => {
      this.setState(state => ({
        loading: false,
        logEntries: data,
        processedLogEntries: data
      }));
    };

    const onError = (err) => {
      this.setState(() => ({
        error: JSON.stringify(err),
        loading: false
      }));
    };

    loadAndParseCsvFile(this.state.file, onComplete, onError);
  }

  /**
   * Get log entries for the particular page
   * @param {number} pageNumber Page that we want entries for 
   */
  getEntriesForPage(pageNumber) {
    let startIndex = ((pageNumber - 1) * (this.state.offset));
    let endIndex = startIndex + this.state.offset;

    if (startIndex !== 0) {
      startIndex += 1;
    }

    // If supposde index is greater than the last entry in the array,
    // use the last entry instead
    if (endIndex > this.numberOfRecords) {
      endIndex = this.numberOfRecords;
    }

    const result = this.state.processedLogEntries.slice(startIndex, endIndex);
    return result;
  }

  render() {
    return template.call(this);
  }

  /**
   * Event handler for sort by column CTA.
   * @param {number} columnId Column index array will be sorted by
   */
  handleSortByColumn(columnId) {
    this.setState(() => ({
      loading: true
    }));

    // Set timeout so the browser does not look like it hung
    setTimeout(() => {
      this.setState(state => ({
        sortBy: {
          ...state.sortBy,
          columnId,
          ascending: state.sortBy.ascending ? !state.sortBy.ascending : true
        }
      }));
    }, 100);

  }

  /**
   * Event handler for reseting all filters (e.g. search, sort, group, etc.)
   * and bringing the original array to the view.
   */
  handleResetFilters() {
    this.setState(() => ({
      loading: true
    }));

    // Use timeout to minimise feeling of a lag
    setTimeout(() => {
      this.setState(state => ({
        groupBy: undefined,
        loading: false,
        processedLogEntries: state.logEntries,
        sortBy: {},
        search: '',
        page: 1
      }));
    }, 100);

  }

  /**
   * Event handler for initiating search operation.
   * @param {string} searchString String that will be used to search array with
   */
  handleSearch(searchString) {
    this.setState({
      loading: true
    });

    // Use timeout to minimise feeling of a lag
    setTimeout(() => {
      this.setState(state => ({
        page: 1,
        search: searchString
      }));
    }, 100);
  }
  
  /**
   * Event handler for initiating group by column operation.
   * @param {number} columnId Column index that the array will be grouped by
   */
  handleGroupByColumn(columnId) {
    this.setState(() => ({
      loading: true
    }));

    // Set timeout so the browser does not look like it froze
    setTimeout(() => {
      this.setState(state => ({
        groupBy: columnId
      }));
    }, 100);
  }

  /**
   * Group the array operation.
   */
  groupArray() {
    const arrayUtility = new CSVArrayController(this.state.processedLogEntries);
    const groupedArray = arrayUtility.groupByColumn(this.state.groupBy);

    this.setState(() => ({
      processedLogEntries: groupedArray,
      page: 1
    }));

    this.setState({
      loading: false
    });
  }
  
  /**
   * Sort the array operation.
   */
  sortArray() {
    const arrayUtility = new CSVArrayController(this.state.processedLogEntries);
    const sortedArray = arrayUtility.sortByColumn(
      this.state.sortBy.columnId,
      this.state.sortBy.ascending
    );

    this.setState(state => ({
      processedLogEntries: sortedArray
    }));

    this.setState(() => ({
      loading: false
    }));
  }

  /**
   * Serach the array operation.
   */
  searchArray() {
    const arrayUtility = new CSVArrayController(this.state.processedLogEntries);
    const searchedArray = arrayUtility.searchAllColumnsByString(this.state.search);


    this.setState(state => ({
      processedLogEntries: searchedArray
    }));

    this.setState({
      loading: false
    });
  }
}
