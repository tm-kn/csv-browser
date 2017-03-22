import { getFileHashes, loadAndParseCsvFile } from 'utils/file';

// Node functions to load files
const fs = require('fs');
const path = require('path');

it('should get file\'s hash values', done => {
  const TEST_FILE_PATH = path.join(__dirname, '../fixtures/csv_test_array.json');

  const onComplete = result => {
    try {
      expect(result).toHaveProperty('MD5','c9f460a44705434ac93b0e0975267740');
      expect(result).toHaveProperty('SHA1', 'de3c996e23f0bba1b25c03d25588985bde90801a');
      expect(result).toHaveProperty('SHA256', 'd314339985f1b2b790674111b863ec15eaba87afa476f6064b7ba19685b95fe3');
      expect(result).toHaveProperty('SHA224', '108a398a2e36b2599334e7c2764d53eb4f5faaa9a6f0c170385399ae');
      expect(result).toHaveProperty('SHA512','3979503f81e5caa92be6be14dfe729cdba2ba32490a37f3edc6c4b01aa2af989173'
                                              + '8e0f6623611f9383c2a6c0fa9cdd523ce55b3d0fe99afdfbcf6c036c66194');
      expect(result).toHaveProperty('SHA384', 'b99590a5cf9a99a9afde1cc84b5b7346e73359d8dd86319d800'
                                               + '6706e33fc6159e92932378bc1e3c35da9fc9fad957cab');

    } catch (e) {
      fail(e);
    }

    done();
  };

  const onError = error => {
    fail();
  };

  fs.readFile(TEST_FILE_PATH, 'utf-8', (error, data) => {
    if (error) {
      fail(error);
    }

    getFileHashes(new Blob([data]), onComplete, onError);
  });
});

it('should load and parse CSV file', done => {
  const TEST_FILE_PATH = path.join(__dirname, '../fixtures/csv_test.csv');

  const onComplete = result => {
    try {
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toEqual(111);
    } catch (e) {
      fail(e);
    }

    done();
  };

  const onError = error => {
    fail();
  };

  fs.readFile(TEST_FILE_PATH, 'utf-8', (error, data) => {
    if (error) {
      fail(error);
    }

    loadAndParseCsvFile(new Blob([data]), onComplete, onError);
  });
});
