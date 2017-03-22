/**
 * @file Utility functions for file loading/parsing.
 */
import Baby from 'babyparse';
import CryptoJS from 'crypto-js';

/**
 * Load file and get different hash values for it.
 * @param {object} file Value of input[type="file"]
 * @param {function} onComplete Called when done hashing. Passes object with checksums to it.
 * @param {function} onError Called when there is an error.
 */
export function getFileHashes(file, onComplete, onError) {
  const reader = new FileReader();

  reader.onerror = (err) => {
    onError(err);
  };

  reader.onload = event => {
    const data = event.target.result;
    const wordArray = CryptoJS.lib.WordArray.create(data);

    onComplete({
      MD5: CryptoJS.MD5(wordArray).toString(),
      SHA1: CryptoJS.SHA1(wordArray).toString(),
      SHA256: CryptoJS.SHA256(wordArray).toString(),
      SHA224: CryptoJS.SHA224(wordArray).toString(),
      SHA512: CryptoJS.SHA512(wordArray).toString(),
      SHA384: CryptoJS.SHA384(wordArray).toString(),
      SHA3: CryptoJS.SHA3(wordArray).toString(),
      RIPEMD160: CryptoJS.RIPEMD160(wordArray).toString(),
    });
  };

  reader.readAsArrayBuffer(file);
}

/**
 * Load a file and parse it as CSV.
 * @param {object} file Value of input[type="file"]
 * @param {function} handleComplete Called when loading and parsing is done.
 *                                  Passes array with parsed CSV contents.
 * @param {function} handleError Called when error occured.
 */
export function loadAndParseCsvFile(file, handleComplete, handleError) {
  const reader = new FileReader();

  reader.onerror = (err) => {
    handleError(err);
  };

  reader.onload = (event) => {
    const csvText = event.target.result;

    // Parse CSV file
    Baby.parse(csvText, {
      skipEmptyLines: true,
      worker: true,
      complete: result => {
        if (handleComplete) {
          handleComplete(result.data);
        }
      },
      error: err => {
        if (handleError) {
          handleError(err);
        }
      }
    });
  };

  reader.readAsText(file);
}
