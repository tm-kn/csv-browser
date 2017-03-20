export default class CSVArrayController {
  constructor(array) {
    this.array = array;
  }

  sortByColumn(columnId, asc = true) {
    const compareValues = (val, val2) => {
      if (!val[columnId] && !val2[columnId]) {
        return 0;
      } else if (!val[columnId] && val2[columnId]) {
        return -1;
      } else if (val[columnId] && !val2[columnId]) {
        return 1;
      } else if (val[columnId] instanceof Set) {
        if (val2[columnId] instanceof Set) {
          if (asc) {
            return val[columnId].size > val2[columnId].size;
          } else {
            return val[columnId].size < val2[columnId].size;
          }
        }

        return 0;
      }

      const comparison = val[columnId].localeCompare(val2[columnId]);

      if (asc) {
        return comparison;
      } else {
        return comparison * -1;
      }
    };

    return this.array.slice().sort(compareValues);
  }

  searchAllColumnsByString(searchString) {
    const pattern = new RegExp(searchString, 'i');

    return this.array.filter(row => {
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
    });
  }

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
