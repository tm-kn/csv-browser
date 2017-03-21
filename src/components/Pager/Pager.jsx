import React from 'react';

export default function render() {
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
        disabled={this.props.page === this.numberOfPages}
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
        <p>Records found: {this.props.array.length}</p>
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
