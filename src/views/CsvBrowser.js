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
  get numberOfColumns() {
    const entries = this.getEntriesForPage(this.state.page);

    return entries.length ? entries[0].length : 0;
  }

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

    // Change current file
    if (this.state.file && this.state.file !== prevState.file) {
      this.loadCSVFile();
    }

    // Change grouping
    if (this.state.groupBy !== undefined && this.state.groupBy !== prevState.groupBy) {
      this.groupArray();
    }
  }

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

  getEntriesForPage(pageNumber) {
    let startIndex = ((pageNumber - 1) * (this.state.offset));
    let endIndex = startIndex + this.state.offset;

    if (startIndex !== 0) {
      startIndex += 1;
    }

    if (endIndex > this.numberOfRecords) {
      endIndex = this.numberOfRecords;
    }
    const result = this.state.processedLogEntries.slice(startIndex, endIndex);
    return result;
  }
    
  render() {
    let content;

    if (this.state.loading) {
      content = (
        <LoadingIndicator />
      );
    } else if (!this.state.file) {
      content = (
        <FileChooser
          accept="text/csv, .csv"
          onChangeFile={file => this.setState(() => ({ file }))}
        />
      );
    } else if (this.state.error) {
      content = (
        <div>
          <h1>Error!</h1>
          <p>{this.state.error}</p>
        </div>
      );
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
                            `${this.state.sortBy.ascending ?'ASC':'DESC'}`
                            : 'Sort'}
                        </button>
                        <button
                          disabled={this.state.groupBy !== undefined}
                          onClick={() => this.handleGroupByColumn(i)}
                        >
                          {this.state.groupBy !== i ? 'Group'  : 'GROUPPING BY'}
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
          <p>If your browser freezes, wait until it unfreezes... It is most likely analysing the data!</p>
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

  handleResetFilters() {
    this.setState(() => ({
      loading: true
    }));

    // Use timeout to minimise feeling of a lag
    setTimeout(() => {
      this.setState(state => ({
        groupBy: undefined,
        loading: false,
        processedLogEntries: [...state.logEntries],
        sortBy: {},
        search: '',
        page: 1
      }));    
    }, 100);

  }

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
}
