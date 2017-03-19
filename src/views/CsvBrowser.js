import React, { Component } from 'react';

import { loadAndParseCsvFile } from '../utils/csv';
import {
  FileChooser,
  LoadingIndicator,
  SearchBox,
  Pager
} from '../components';

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
              onChange={searchString => this.setState(state => ({
                loading: true,
                page: 1,
                search: searchString
              }))}
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
    const compareValues = (val, val2) => {
      const index = this.state.sortBy.columnId;

      if (!val[index] && !val2[index]) {
        return 0;
      } else if (!val[index] && val2[index]) {
        return -1;
      } else if (val[index] && !val2[index]) {
        return 1;
      } else if (val[index] instanceof Set) {
        if (val2[index] instanceof Set) {
          if (this.state.sortBy.ascending) {
            return val[index].size > val2[index].size;
          } else {
            return val[index].size < val2[index].size;
          }
        }

        return 0;
      }

      const comparison = val[index].localeCompare(val2[index]);

      if (this.state.sortBy.ascending) {
        return comparison;
      } else {
        return comparison * -1;
      }
    };

    this.setState(state => ({
      processedLogEntries: [
        ...state.processedLogEntries.slice().sort(compareValues)
      ],
      loading: false
    }));
  }

  searchArray() {
    const pattern = new RegExp(this.state.search, 'i');

    this.setState(state => ({
      loading: false,
      processedLogEntries: state.processedLogEntries.filter(row => {
        for (let column of row) {
          if (
            !(column instanceof Set) && column.search(pattern) !== -1
          ) {
            return true;
          } else if (column instanceof Set) {
            for (let rowColumn of column) {
              if (rowColumn.search(pattern) !== -1) {
                return true;
              }
            }
          }
        }

        return false;
      })
    }));
  }

  handleSortByColumn(columnId) {
    this.setState(state => ({
      sortBy: {
        ...state.sortBy,
        columnId,
        ascending: state.sortBy.ascending ? !state.sortBy.ascending : true
      },
      loading: true
    }));
  }

  handleResetFilters() {
    this.setState(state => ({
      groupBy: undefined,
      processedLogEntries: [...state.logEntries],
      sortBy: {},
      search: '',
      page: 1
    }));    
  }

  handleGroupByColumn(columnId) {
    this.setState(state => ({
      groupBy: columnId,
      loading: true
    }));
  }

  groupArray() {
    const newArray = [];
    const index = this.state.groupBy;
    const uniqueValuesSet = new Set();

    // Find unique entries in the group by column
    for (let rowKey in this.state.processedLogEntries) {
      uniqueValuesSet.add(this.state.processedLogEntries[rowKey][index]);
    }

    // Create empty array with empty unique keys
    for (let uniqueKey of uniqueValuesSet) {
      const internalArray = [];
      internalArray[index] = uniqueKey;
      newArray.push(internalArray);
    }

    this.setState(() => ({
      loading: false,
      processedLogEntries: [
        ...newArray.map((value, newArayIndex, array) => {
          const internalArray = [];
          
          let count = 1;
          // Go throught all the log entries
          for (let logEntryKey in this.state.processedLogEntries) {
            // Match log entry with the same GROUP BY index
            if (this.state.processedLogEntries[logEntryKey][index] === value[index]) {
              // Go through keys
              for (let logEntryColumnKey in this.state.processedLogEntries[logEntryKey]) {
                // If it's the key that we group by...
                if (parseInt(logEntryColumnKey, 10) === index) {
                  internalArray[logEntryColumnKey] = `${this.state.processedLogEntries[logEntryKey][logEntryColumnKey]}`
                                                      + ` - COUNT(${count})`;
                  count++;
                // Other keys
                } else {
                  // No values in this column - assign the first value
                  if (!internalArray[logEntryColumnKey]) {
                    internalArray[logEntryColumnKey] = this.state.processedLogEntries[logEntryKey][logEntryColumnKey];

                  // If it's a set of values, add it to the set - won't duplicate anyway
                  } else if (internalArray[logEntryColumnKey] instanceof Set) {
                    internalArray[logEntryColumnKey].add(
                      this.state.processedLogEntries[logEntryKey][logEntryColumnKey]
                    );
                  
                  // If the value insice the log entry is not the same, create a set to store all the different values
                  } else if (
                    internalArray[logEntryColumnKey] !== this.state.processedLogEntries[logEntryKey][logEntryColumnKey]
                  ) {
                    internalArray[logEntryColumnKey] = new Set([internalArray[logEntryColumnKey]]);
                  }
                } 
              }
            }
          }
          
          return internalArray; 
        })
      ],
      page: 1
    }));
  }
}
