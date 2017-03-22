/**
 * @file Worker file used for operatin of grouping the array.
 */

const CSVArrayController = require('../utils/CSVArrayController');

onmessage = function(event) {
    const data = event.data;

    const array = data[0];
    const columnId = data[1];

    const arrayUtils = new CSVArrayController.default(array);
    const groupedArray = arrayUtils.groupByColumn(columnId);

    postMessage(groupedArray);
}
