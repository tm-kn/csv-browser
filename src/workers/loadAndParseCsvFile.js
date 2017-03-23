const fileLib = require('../utils/file');

onmessage = event => {
    const file = event.data;

    const onComplete = data => {
        postMessage(['ok', data]);
    };

    const onError = error => {
        postMessage(['error', error]);
    };

    fileLib.loadAndParseCsvFile(file, onComplete, onError);
};
