import React, { Component } from 'react';

import {
  FileChooser,
  LoadingIndicator,
  SearchBox,
  Pager
} from '../components';
import { CSVArrayController } from '../utils';
import { loadAndParseCsvFile } from '../utils/file';

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
    let content;

    // Loading state
    if (this.state.loading) {
      content = (
        <LoadingIndicator />
      );
    
    // File upload state
    } else if (!this.state.file) {
      content = (
        <FileChooser
          accept="text/csv, .csv"
          onChangeFile={file => this.setState(() => ({ file }))}
        />
      );
    
    // Error state
    } else if (this.state.error) {
      content = (
        <div>
          <h1>Error!</h1>
          <p>{this.state.error}</p>
        </div>
      );

    // CSV browser view - CSV file loaded
    } else {
      const controls = (
        <div className="controlsContainer">
          <div>
            <button className="button" onClick={() => this.loadCSVFile()}>
              Reload file
            </button>
            <button className="button" onClick={() => this.setState(() => ({ file: undefined, logEntries: [] }))}>
              Unload file
            </button>
          </div>
          <Pager
            numberOfRecords={this.numberOfRecords}
            onChangePage={page => this.setState(() => ({ page }))}
            onChangeOffset={offset => this.setState(() => ({ offset }))}
            offset={this.state.offset}
            page={this.state.page}
          />
          <div>
            <button className="button" onClick={this.handleResetFilters}>Reset filter/sort</button>
            <SearchBox
              onChange={this.handleSearch}
              value={this.state.search}
            />
          </div>
        </div>
      );

      let table = (
        <div>
          <p>No entries...</p>
        </div>
      );

      if (this.numberOfRecords) {
        table = (
          <table>
            <thead>
              <tr>
                {(() => {
                  const rows = [];

                  for (let i = 0; i < this.numberOfColumns; i++) {
                    rows.push(
                      <th key={`thead_${i}`}>
                        <button
                          onClick={() => this.handleSortByColumn(i)}
                        >
                          {this.state.sortBy.columnId === i ?
                            `${this.state.sortBy.ascending ? 'ASC' : 'DESC'}`
                            : 'Sort'}
                        </button>
                        <button
                          disabled={this.state.groupBy !== undefined}
                          onClick={() => this.handleGroupByColumn(i)}
                        >
                          {this.state.groupBy !== i ? 'Group' : 'GROUPPING BY'}
                        </button>
                      </th>
                    );
                  }

                  return rows;
                })()}
              </tr>
            </thead>
            <tbody>
              {this.getEntriesForPage(this.state.page).map((item, key) => {
                return (
                  <tr key={key}>
                    {item.map((subitem, subkey) => (
                      <td key={`${key}_${subkey}`}>
                        {(() => {
                          if (subitem instanceof Set) {
                            let joinedSet = '';

                            for (let item of subitem) {
                              joinedSet += `${item}\n`;
                            }

                            return (
                              <button
                                onClick={() => {
                                  alert(joinedSet);
                                }}
                              >
                                {subitem.size} different values
                              </button>
                            );
                          }

                          return subitem;
                        })()}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      }

      content = (
        <div>
          {controls}
          <p>
            {'If your browser freezes, wait until it unfreezes... '}
            {'It will unfreeze after the operation has been completed. '}
            {'Grouping by columns with a lot of unique keys may take ages.'}
          </p>
          <div className="tableContainer">
            {table}
          </div>
          {controls}
        </div>
      );
    }

    return (
      <div>
        {content}
      </div>
    );
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
