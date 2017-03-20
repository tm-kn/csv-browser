/* Class used to perform operations on array that has a CSV file loaded to it. */
export default class CSVArrayController {
  /**
   * Create new instance for the particular array.
   * @param {array} array Array with CSV entries in.
   */
  constructor(array) {
    this.array = array;
  }

  /**
   * Sort CSV array by values of a particular column.
   * @param {number} columnId Column index that array will be sorted by.
   * @param {boolean} asc If true array will be sorted by ascending order,
   *                      otherwise descending order will be used.
   * @returns {array} Sorted array.
   */
  sortByColumn(columnId, asc = true) {

    /**
     * Comparison function sort Array.prototype.sort().
     * @param {*} val Value 1
     * @param {*} val2 Value 2
     * @returns {number}
     */
    const compareValues = (val, val2) => {
      // Test for undefined values
      if (val[columnId] === undefined && val2[columnId] === undefined) {
        return 0;
      } else if (val[columnId] !== undefined && val2[columnId] === undefined) {
        return asc ? 1 : 0;
      } else if (val[columnId] !== undefined && val2[columnId] === undefined) {
        return asc ? 0 : 1;

      // If value is a set, order it by size
      } else if (val[columnId] instanceof Set || val2[columnId] instanceof Set) {
        // If both values are sets, sort by size...
        if (val[columnId] instanceof Set && val2[columnId] instanceof Set) {
          if (asc) {
            return val[columnId].size - val2[columnId].size;
          } else {
            return val2[columnId].size - val[columnId].size;
          }
        
        // Otherwise sets come first
        } else if (val[columnId] instanceof Set && !(val2[columnId] instanceof Set)) {
          return asc ? 1 : -1;
        } else {
          return asc ? -1 : 1;
        }

      // If both of the values are numbers
      } else if (!isNaN(Number(val[columnId])) && !isNaN(Number(val2[columnId]))) {
        if (asc) {
          return Number(val[columnId]) - Number(val2[columnId]);
        } else {
          return Number(val2[columnId] - val[columnId]);
        }
      // If the value is a string.
      } else if (typeof val[columnId] === 'string' || typeof val2[columnId] === 'string') {
        if (typeof val[columnId] === 'string' && typeof val2[columnId] === 'string') {
          if (asc) {
            return val[columnId].localeCompare(val2[columnId]);
          } else {
            return val2[columnId].localeCompare(val[columnId]);
          }
        } else if (typeof val[columnId] === 'string' && typeof val2[columnId] !== 'string') {
          return asc ? 1 : -1;
        } else {
          return asc ? -1 : 1;
        }
      }

      return 0;
    };

    // Clone the array first, then sort.
    return this.array.slice().sort(compareValues);
  }

  /**
   * Search all the columns by the string provided.
   * @param {string} searchString
   * @returns {array} Array with entries that match the search string.
   */
  searchAllColumnsByString(searchString) {
    // TODO: Make sure that injecting string from user into regex is secure
    const pattern = new RegExp(searchString, 'i');

    return this.array.filter(row => {
      for (let column of row) {
        // If string, just compare it with regex
        if (typeof column === 'string' && column.search(pattern) !== -1) {
          return true;
        
        // If set, go through all the entries in the set
        } else if (column instanceof Set) {
          for (let rowColumn of column) {
            if (typeof rowColumn === 'string' && rowColumn.search(pattern) !== -1) {
              return true;
            }
          }
        }
      }

      return false;
    });
  }

  /**
   * Group the array by the value of column, something like GROUP BY in SQL.
   * @description Merges the row into one for the values that are the same in
   *              specified column, something like GROUP BY in SQL. It is very
   *              expensive when the column contains a lot of unique values.
   * @param {number} columnId Column array will be sorted by.
   * @returns {array} Grouped array
   */
  groupByColumn(columnId) {
    const newArray = [];
    const uniqueValuesSet = new Set();

    // Find unique entries in the group by column
    for (let rowKey in this.array) {
      uniqueValuesSet.add(this.array[rowKey][columnId]);
    }

    // Create empty array with empty unique keys
    for (let uniqueKey of uniqueValuesSet) {
      const internalArray = [];
      internalArray[columnId] = uniqueKey;
      newArray.push(internalArray);
    }

    const groupedArray = newArray.map((value, newArayIndex, array) => {
      const internalArray = [];
      let count = 1;

      // Go throught all the log entries
      for (let logEntryKey in this.array) {
        // Match log entry with the same GROUP BY index
        if (this.array[logEntryKey][columnId] === value[columnId]) {
          // Go through keys
          for (let logEntryColumnKey in this.array[logEntryKey]) {
            // If it's the key that we group by...
            if (parseInt(logEntryColumnKey, 10) === columnId) {
              internalArray[logEntryColumnKey] = `${this.array[logEntryKey][logEntryColumnKey]}`
                + ` - COUNT(${count})`;
              count++;
              // Other keys
            } else {
              // No values in this column - assign the first value
              if (!internalArray[logEntryColumnKey]) {
                internalArray[logEntryColumnKey] = this.array[logEntryKey][logEntryColumnKey];

                // If it's a set of values, add it to the set - won't duplicate anyway
              } else if (internalArray[logEntryColumnKey] instanceof Set) {
                internalArray[logEntryColumnKey].add(
                  this.array[logEntryKey][logEntryColumnKey]
                );

                // If the value insice the log entry is not the same, create a set to store all the different values
              } else if (
                internalArray[logEntryColumnKey] !== this.array[logEntryKey][logEntryColumnKey]
              ) {
                internalArray[logEntryColumnKey] = new Set([internalArray[logEntryColumnKey]]);
              }
            }
          }
        }
      }

      return internalArray;
    });

    return groupedArray;
  }
}
