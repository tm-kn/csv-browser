/**
 * @file Worker file used for searching array by string.
 */

const CSVArrayController = require('../utils/CSVArrayController');

onmessage = function(event) {
    const data = event.data;

    const array = data[0];
    const searchString = data[1];

    const arrayUtils = new CSVArrayController.default(array);
    const searchedArray = arrayUtils.searchAllColumnsByString(searchString);

    postMessage(searchedArray);
}
