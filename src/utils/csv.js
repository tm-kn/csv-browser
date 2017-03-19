import Baby from 'babyparse';

export function loadAndParseCsvFile(file, handleComplete, handleError) {
  const reader = new FileReader();

  reader.onload = (event) => {
    const csvText = event.target.result;

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