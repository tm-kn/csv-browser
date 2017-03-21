import React from 'react';

import {
  FileChooser,
  LoadingIndicator,
  Pager,
  SearchBox,
} from 'components';

export default function() {
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
          ref={pager => this.pager = pager}
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
            {this.state.currentPageEntries.map((item, key) => {
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
