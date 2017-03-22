/**
 * @file Worker file used for operatin of sorting the array.
 */

const CSVArrayController = require('../utils/CSVArrayController');

onmessage = function(event) {
    const data = event.data;

    const array = data[0];
    const columnId = data[1];
    const asc = data[2];

    const arrayUtils = new CSVArrayController.default(array);
    const sortedArray = arrayUtils.sortByColumn(columnId, asc);

    postMessage(sortedArray);
}
