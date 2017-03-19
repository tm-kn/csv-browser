import React from 'react';
import Baby from 'babyparse';

import logo from './logo.svg';

class CsvBrowser extends React.Component {
  get offsetValues() {
    return [15, 30, 60, 90];
  }
  get numberOfColumns() {
    const entries = this.getEntriesForPage(this.state.page);

    return entries.length ? entries[0].length : 0;
  }

  get numberOfPages() {
    return Math.ceil(this.numberOfRecords / this.state.offset);
  }

  get numberOfRecords() {
    return this.state.processedLogEntries.length;
  }

  constructor() {
    super();

    this.state = {
      changingFile: undefined,
      changingPageNumber: '',
      changingSearch: '',
      loading: false,
      error: undefined,
      logEntries: [],
      offset: this.offsetValues[0],
      page: 1,
      search: '',
      processedLogEntries: [],
      sortBy: {}
    };

    this.handleGoToPage = this.handleGoToPage.bind(this);
    this.handleSortByColumn = this.handleSortByColumn.bind(this);
    this.handleSubmitPageNumber = this.handleSubmitPageNumber.bind(this);
    this.handleSubmitFile = this.handleSubmitFile.bind(this);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    this.handleChangeFile = this.handleChangeFile.bind(this);
    this.handleNextPage = this.handleNextPage.bind(this);
    this.handlePreviousPage = this.handlePreviousPage.bind(this);
    this.handleResetFilters = this.handleResetFilters.bind(this);
    this.loadCSVFile = this.loadCSVFile.bind(this);
    this.sortArray = this.sortArray.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // Sorting changed
    if (
      this.state.sortBy.columnId
      && this.state.sortBy.ascending !== undefined &&
      this.state.sortBy !== prevState.sortBy
    ) {
      this.sortArray();
    }

    // Searching changed
    if (this.state.search && this.state.search !== prevState.search) {
      this.searchArray();
    }

    // Change current
    if (this.state.file && this.state.file !== prevState.file) {
      this.loadCSVFile();
    }
  }

  async loadCSVFile() {
    this.setState(state => ({
      error: undefined,
      loading: true,
      page: 1,
      sortBy: {}
    }));

    const reader = new FileReader();
   
    reader.onload = async (event) => {
      const csvText = event.target.result;

      Baby.parse(csvText, {
        skipEmptyLines: true,
        worker: true,
        complete: result => {
          this.setState(state => ({
            loading: false,
            logEntries: result.data,
            processedLogEntries: result.data
          }));
        },
        error: err => {
          this.setState(() => ({
            error: JSON.stringify(err),
            loading: false
          }));
        }
      });
    };

    reader.readAsText(this.state.file);
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
        <div>
          <img src={logo} className="App-logo" alt="Loading CSV file..." />
          <p>Loading CSV file...</p>
        </div>
      );
    } else if (!this.state.file) {
      content = (
        <div>
          <h1>Select file</h1>
          <p>Select the CSV file you want to open.</p>
          <form onSubmit={this.handleSubmitFile}>
            <input type="file" onChange={this.handleChangeFile} name="csvFile" accept="text/csv, .csv" />
            <input disabled={!this.state.changingFile} className="button" type="submit" value="Load to the browser" />
          </form>
        </div>
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
          <div>
            <button className="button" disabled={this.state.page === 1} onClick={() => this.handleGoToPage(1)}>First page</button>
            <button className="button" disabled={!this.previousPageExists()} onClick={this.handlePreviousPage}>Previous page</button>
            <span>{this.state.page} / {this.numberOfPages}</span>
            <button className="button" disabled={!this.nextPageExists()} onClick={this.handleNextPage}>Next page</button>
            <button className="button" disabled={this.state.page === this.numberOfPages} onClick={() => this.handleGoToPage(this.numberOfPages)}>Last page</button>
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
              <input className="button" type="submit" name="submitPageNumber" value="Go" />
            </form>
          </div>
          <div>
            <p>Records found: {this.numberOfRecords}</p>
            <ul className="horizontal">
              <li>
                <span>Display:</span>
              </li>
              {this.offsetValues.map((item, key) => (
                <li key={key}>
                  <button disabled={this.state.offset === item} className="button" onClick={() => this.changeOffsetTo(item)}>{item} records</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <button className="button" onClick={this.handleResetFilters}>Reset filter/sort</button>
            {(() => {
              if (this.state.search) {
                return (
                  <p>Searching by: {this.state.search}</p>
                );
              }

              return (
                <form onSubmit={this.handleSearchSubmit}>
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
            })()}
          </div>
        </div>
      );

      let table = (
        <div>
          <p>No entries...</p>
        </div>
      );

      if (this.state.processedLogEntries.length) {
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
                          {this.state.sortBy.columnId === i ? `${i} ${this.state.sortBy.ascending ? 'ASC' : 'DESC'}` : i}
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
                      <td key={`${key}_${subkey}`}>{subitem}</td>
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

  handleNextPage() {
    this.setState(state => {
      return {
        page: state.page + 1
      };
    });
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

    this.setState(() => ({
      page: newPage
    }));
  }

  sortArray() {
    const logEntriesCopy = this.state.processedLogEntries.slice();

    const compareValues = (val, val2) => {
      const index = this.state.sortBy.columnId;
      if (!val[index] && !val2[index]) {
        return 0;
      } else if (!val[index] && val2[index]) {
        return -1;
      } else if (val[index] && !val2[index]) {
        return 1;
      }

      const comparison = val[index].localeCompare(val2[index]);

      if (this.state.sortBy.ascending) {
        return comparison;
      } else {
        return comparison * -1;
      }
    };

    logEntriesCopy.sort(compareValues);

    this.setState(() => ({
      processedLogEntries: [
        ...logEntriesCopy
      ]
    }));
  }

  searchArray() {
    this.setState(() => ({
      loading: true,
      page: 1
    }));

    const pattern = new RegExp(this.state.search, 'i');

    this.setState(state => ({
      loading: false,
      processedLogEntries: state.processedLogEntries.filter(row => {
        for (let column of row) {
          if (column.search(pattern) !== -1) {
            return true;
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
      }
    }));
  }

  nextPageExists() {
    return (this.state.page < this.numberOfPages);
  }

  handleResetFilters() {
    this.setState(state => ({
      processedLogEntries: [...state.logEntries],
      sortBy: {},
      search: '',
      page: 1
    }));    
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

    this.setState(state => ({
      file: state.changingFile,
      changingFile: undefined
    }));
  }

  previousPageExists() {
    return (this.state.page > 1);
  }

  changeOffsetTo(offset) {
    const currentStartIndex = ((this.state.page - 1) * (this.state.offset));
    const newPage = Math.floor(currentStartIndex / offset) + 1;

    this.setState(state => ({
      offset,
      page: newPage
    }));
  }

  handlePreviousPage() {
    this.setState(state => ({
      page: state.page - 1
    }));
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

    this.setState(() => ({
      changingPageNumber: ''
    }));

    this.handleGoToPage(parseInt(pageNumber, 10));
  }

  handleSearchSubmit(event) {
    event.preventDefault();

    this.setState(state => ({
      changingSearch: '',
      search: state.changingSearch
    }));
  }
}

export default CsvBrowser;