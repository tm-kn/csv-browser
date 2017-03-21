import _ from 'underscore';

import { CSVArrayController } from 'utils';
import FIXTURE from 'tests/fixtures/csv_test_array';

it('should initialise CSVArrayController object', () => {
  const instance = new CSVArrayController(FIXTURE);

  expect(instance).toBeInstanceOf(CSVArrayController);
});

it('should group the array', () => {
  const GROUP_BY_COLUMN_INDEX = 5;

  const instance = new CSVArrayController(FIXTURE);

  // Get the unique values of that column by using Set
  const uniqueValues = new Set();

  for (const row of FIXTURE) {
    uniqueValues.add(row[GROUP_BY_COLUMN_INDEX]);
  }

  // Group by the column
  const grouppedArray = instance.groupByColumn(GROUP_BY_COLUMN_INDEX);

  expect(grouppedArray.length).toEqual(uniqueValues.size);
});

describe('should sort array', () => {
  // Column with TCP/UDP
  const SORT_BY_COLUMN_INDEX = 1;

  it('should sort array by column using ascending order', () => {
    const instance = new CSVArrayController(FIXTURE);
    const sortedArrayASC = instance.sortByColumn(SORT_BY_COLUMN_INDEX);

    const lastIndexOfTCP = _.findLastIndex(sortedArrayASC, row => row[SORT_BY_COLUMN_INDEX].search(/^tcp$/i) !== -1);
    const firstIndexOfUDP = sortedArrayASC.findIndex(row => row[SORT_BY_COLUMN_INDEX].search(/^udp$/i) !== -1);
  
    expect(lastIndexOfTCP).toBeGreaterThanOrEqual(0); // so it's not -1 (not found)
    expect(firstIndexOfUDP).toBeGreaterThanOrEqual(0); // so it's not -1 (not found)
    
    // TCP appears before UDP
    expect(lastIndexOfTCP).toBeLessThan(firstIndexOfUDP);
  });
  
  it('should sort array by column using decending order', () => {
    const instance = new CSVArrayController(FIXTURE);
    const sortedArrayASC = instance.sortByColumn(SORT_BY_COLUMN_INDEX, false);

    const lastIndexOfUDP = _.findLastIndex(sortedArrayASC, row => row[SORT_BY_COLUMN_INDEX].search(/^udp$/i) !== -1);
    const firstIndexOfTCP = sortedArrayASC.findIndex(row => row[SORT_BY_COLUMN_INDEX].search(/^tcp$/i) !== -1);
  
    expect(lastIndexOfUDP).toBeGreaterThanOrEqual(0); // so it's not -1 (not found)
    expect(firstIndexOfTCP).toBeGreaterThanOrEqual(0); // so it's not -1 (not found)
    
    // TCP appears after UDP
    expect(firstIndexOfTCP).toBeGreaterThan(lastIndexOfUDP);
  });
});

describe('should search array', () =>{
  it('should search all columns by string', () => {
    const SEARCH_STRING = 'udp';
    const SEARCH_PATTERN = new RegExp(SEARCH_STRING, 'i');

    const instance = new CSVArrayController(FIXTURE);

    const searchedArray = instance.searchAllColumnsByString(SEARCH_STRING);

    // Fail test if value is not found in the array
    for (const row of searchedArray) {
      let foundString = false;

      for (const column of row) {
        if (String(column).search(SEARCH_PATTERN) !== -1) {
          foundString = true;
        }
      }

      expect(foundString).toBeTruthy();
    }
  });
  
  it('should search all columns by a number', () => {
    const SEARCH_STRING = 0;
    const SEARCH_PATTERN = new RegExp(SEARCH_STRING, 'i');

    const instance = new CSVArrayController(FIXTURE);

    const searchedArray = instance.searchAllColumnsByString(SEARCH_STRING);

    // Fail test if value is not found in the array
    for (const row of searchedArray) {
      let foundString = false;

      for (const column of row) {
        if (String(column).search(SEARCH_PATTERN) !== -1) {
          foundString = true;
        }
      }

      expect(foundString).toBeTruthy();
    }
  });
});

