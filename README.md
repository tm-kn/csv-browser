# CSV Browser
Simple React app I made as a part of my coursework. It loads a CSV file supplied by user and lets them browse it. Has functionality to search, sort and group by a column. Naturally it implements paging. I also used Web Workers API to separate the heavy processes out of the main thread, so the application stays quite responsive.

## Why web browser app?
The choice of environment is crazy since it is meant to be working with large CSV files and sometimes makes user wait a bit long, but that is just a silly experiment of mine and I enjoyed implementing it.

## Installation
I run project using Node v6 on Linux. NPM or Yarn is required.

To install all required dependecies.

```bash
yarn # npm install
```

To start the development server.

```bash
yarn start # npm start
```

To build a production package that can be server from a server.

```bash
yarn run build # npm run build
```

To run unit tests.

```bash
yarn test # npm test
```
