import React from 'react';
import Baby from 'babyparse';

import logo from './logo.svg';

class CsvBrowser extends React.Component {
  get numberOfColumns() {
    const entries = this.getEntriesForPage(this.state.page);

    return entries.length ? entries[0].length : 0;
  }

  get numberOfPages() {
    return Math.ceil(this.numberOfRecords / this.state.offset);
  }

  get numberOfRecords() {
    return this.state.logEntries.length;
  }

  constructor() {
    super();

    this.state = {
      loading: false,
      error: undefined,
      logEntries: [],
      offset: 30,
      page: 1,
      sortBy: {}
    };

    this.handleGoToPage = this.handleGoToPage.bind(this);
    this.handleSortByColumn = this.handleSortByColumn.bind(this);
    this.handleNextPage = this.handleNextPage.bind(this);
    this.handlePreviousPage = this.handlePreviousPage.bind(this); 
    this.loadCSVFile = this.loadCSVFile.bind(this);
    this.sortArray = this.sortArray.bind(this);
  }

  componentDidMount() {
    this.loadCSVFile();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.sortBy.columnId
      && this.state.sortBy.ascending !== undefined &&
      this.state.sortBy !== prevState.sortBy
    ) {
      this.sortArray();
    }
  }

  async loadCSVFile() {
    this.setState(state => ({
      error: undefined,
      loading: true,
      page: 1
    }));

    const response = await fetch('example.csv');
    const csvText = await response.text();

    const result = await Baby.parse(csvText, {
      skipEmptyLines: true,
      worker: true,
      error: (err) => {
        this.setState(() => ({
          error: JSON.stringify(err),
          loading: false
        }));
      }
    });

    this.setState(state => ({
      loading: false,
      logEntries: result.data
    }));
  }

  getEntriesForPage(pageNumber) {
    const startIndex = ((pageNumber - 1) * (this.state.offset + 1));
    let endIndex = startIndex + this.state.offset;

    if (endIndex > this.numberOfRecords - 1) {
      endIndex = this.numberOfRecords - 1;
    }

    const result = this.state.logEntries.slice(startIndex, endIndex);
    return result;
  }
    
  render() {
    let prevButton;
    let nextButton;
    let logEntriesList = (
      <p>No entries...</p>
    );

    if (this.state.loading) {
      logEntriesList = (
        <div>
          <img src={logo} className="App-logo" alt="Loading CSV file..." />
          <p>Loading CSV file...</p>
        </div>
      );
    } else if (this.state.error) {
      logEntriesList = (
        <div>
          <h1>Error!</h1>
          <p>{this.state.error}</p>
        </div>
      );
    } else if (this.state.logEntries.length) {
      prevButton = (
        <button disabled={!this.previousPageExists()} onClick={this.handlePreviousPage}>Previous page</button>
      );

      nextButton = (
        <button disabled={!this.nextPageExists()} onClick={this.handleNextPage}>Next page</button>
      );

      const summary = (
        <div>
          {prevButton}
          {nextButton}
          <div>
            <button onClick={() => this.handleResetSorting()}>
              Reset sorting
            </button>
            <p>Page: {this.state.page} / <button onClick={() => this.handleGoToPage(this.numberOfPages)}>{this.numberOfPages}</button></p>
            <p>Total records: {this.numberOfRecords}</p>
            <p>Display:</p>
            <ul>
              {[30, 60, 90].map((item, key) => (
                <li key={key}>
                  <button onClick={() => this.changeOffsetTo(item)}>{item} records</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );

      logEntriesList = (
        <div>
          {summary}
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
          {summary}
        </div>
      );
    }

    return (
      <div>
        {logEntriesList}
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

    console.log(newPage);

    this.setState(() => ({
      page: newPage
    }));
  }

  sortArray() {
    const logEntriesCopy = this.state.logEntries.slice();

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
      logEntries: [
        ...logEntriesCopy
      ]
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

  previousPageExists() {
    return (this.state.page > 1);
  }

  changeOffsetTo(offset) {
    this.setState(() => ({
      offset
    }));
  }

  handlePreviousPage() {
    this.setState(state => ({
      page: state.page - 1
    }));
  }

  handleResetSorting() {
    this.setState(() => ({
      sortBy: []
    }));

    this.loadCSVFile();
  }
}

export default CsvBrowser;