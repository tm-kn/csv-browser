import { Component } from 'react';

import { Pager } from 'components';

import template from './CsvBrowser.jsx';

const CSVParserWorker = require('workers/loadAndParseCsvFile.js');
const GroupByWorker = require('workers/groupBy.js');
const SortByWorker = require('workers/sortBy.js');
const SearchWorker = require('workers/searchAllColumnsByString.js');

export default class CsvBrowser extends Component {
  /**
   * Number of columns that will be used to generate the table header.
   * 
   * @description It might not reflect all the columns where number
   * of rows is different.
   */
  get numberOfColumns() {
    const entries = this.state.currentPageEntries;

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
      currentPageEntries: [],
      file: undefined,
      loading: false,
      error: undefined,
      logEntries: [],
      offset: Pager.defaultProps.offsetValues[0],
      page: 1,
      search: undefined,
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

    const worker = new CSVParserWorker();

    worker.onmessage = event => {
      const eventData = event.data;
      worker.terminate();

      const status = eventData[0];
      const data = eventData[1];

      if (status === 'ok') {
        this.setState(state => ({
          loading: false,
          logEntries: data,
          processedLogEntries: data
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

  render() {
    return template.call(this);
  }

  /**
   * Event handler for sort by column CTA.
   * @param {number} columnId Column index array will be sorted by
   */
  handleSortByColumn(columnId) {
    if (this.state.isLoading) {
      return;
    }

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
    if (this.state.isLoading) {
      return;
    }

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
        search: undefined,
        page: 1
      }));
    }, 100);

  }

  /**
   * Event handler for initiating search operation.
   * @param {string} searchString String that will be used to search array with
   */
  handleSearch(searchString) {
    if (this.state.isLoading) {
      return;
    }

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
    const worker = new GroupByWorker();
    
    worker.onmessage = event => {
      const groupedArray = event.data;

      worker.terminate();

      this.setState(() => ({
        processedLogEntries: groupedArray,
        page: 1
      }));

      this.setState({
        loading: false
      });
    };

    worker.postMessage([this.state.processedLogEntries, this.state.groupBy]);
  }
  
  /**
   * Sort the array operation.
   */
  sortArray() {
    const worker = new SortByWorker();

    worker.onmessage = event => {
      const sortedArray = event.data;

      worker.terminate();

      this.setState(state => ({
        processedLogEntries: sortedArray
      }));

      this.setState(() => ({
        loading: false
      }));
    };

    worker.postMessage([
      this.state.processedLogEntries,
      this.state.sortBy.columnId,
      this.state.sortBy.ascending
    ])
  }

  /**
   * Serach the array operation.
   */
  searchArray() {
    const worker = new SearchWorker();
    
    worker.onmessage = event => {
      const searchedArray = event.data;
      worker.terminate();

      this.setState(state => ({
        processedLogEntries: searchedArray
      }));

      this.setState({
        loading: false
      });
    };

    worker.postMessage([this.state.processedLogEntries, this.state.search])
  }
}
