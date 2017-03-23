/**
 * @file Web worker thread for hashing file.
 */

const fileLib = require('../utils/file');

onmessage = event => {
    const data = event.data;
    const file = data;

    const onComplete = hashes => {
        postMessage(['ok', hashes]);
    };

    const onError = error => {
        postMessage(['error', JSON.stringify(error)]);
    }

    fileLib.getFileHashes(file, onComplete, onError);
};
