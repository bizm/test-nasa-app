const express = require('express');
const utils = require('./utils');
const neo = require('./neo');

// Starting date for the period for wich we find closest asteroid.
const ACCEPTABLE_START_DATE = new Date(2015, 11, 19);
// Ending date for the period for wich we find closest asteroid.
const ACCEPTABLE_END_DATE = new Date(2015, 11, 26);
// Internal cache
const NEO_DATA = {};

const app = express();

/**
 * Serve static content.
 */
app.use(express.static('client/build'));
/**
 * Ping endpoint.
 **/
app.get('/api/ping', (req, res) => {
  console.debug(`Serving request ${req.url}`);
  res.send({ data: "pong" });
});
/**
 * Returns the closest NEO for the specified period.
 */
app.get('/api/:startDate/:endDate', (req, res) => {
  console.debug(`Serving request ${req.url}`);

  const startDate = new Date(req.params.startDate);
  const endDate = new Date(req.params.endDate);

  if ((!startDate || !endDate) ||
      // two checks below are fine enough for assignment but in theory we should allow any dates
      startDate.getTime() !== ACCEPTABLE_START_DATE.getTime() ||
      endDate.getTime() !== ACCEPTABLE_END_DATE.getTime()) {
    return res.status(400).send({ error: "Invalid request" });
  }

  const year = startDate.getFullYear();
  withNeoData(year, (err, result) => {
    if (err) {
      return res.status(500).send({ message: "Internal server error"});
    }
    if (result === null) {
      return res.status(202).send({});
    }
    res.send(result.closest);
  });
})
/**
 * Returns the biggest NEO for the specified year.
 */
app.get('/api/:year', (req, res) => {
  console.debug(`Serving request ${req.url}`);

  if (! /^\d+$/.test(req.params.year)) {
    return res.status(400).send({ message: "Invalid request" });
  }
  const year = Number(req.params.year);
  withNeoData(year, (err, result) => {
    if (err) {
      return res.status(500).send({ message: "Internal server error"});
    }
    if (result === null) {
      return res.status(202).send({});
    }
    res.send(result.biggest);
  });
})

/**
 * Invokes a callback with data for specified year. A 'null' value is passed
 * if specified year has not been requested yet or data from NASA API has not
 * been completely fetched. If year has not been requested yet then data
 * fetching from NASA API is initiated.
 **/
function withNeoData(year, callback) {
  // Invoke callback with current data or null. In case of null a 202 response
  // is sent back to FE.
  callback(null, NEO_DATA[year] || null);

  // If there is no NEO data for specified year (not even null) we need to
  // initiate data fetching from NASA API.
  if (!NEO_DATA.hasOwnProperty(year)) {
    NEO_DATA[year] = null;
    fetchNeoData(year);
  }
}
/**
 * Fetch data via 'neo' function and process the data. We get back and object
 * with lists of NEOs for each day. Out of that we must find the biggest one
 * and closest in case year is 2015. This one/two will be stored in cache.
 **/
function fetchNeoData(year) {
  NEO_DATA[year] = null;
  return neo(year)
    .then(oneYearData => {
      const neoData = {
        biggest: utils.findBiggest(oneYearData)
      };
      if (year === ACCEPTABLE_START_DATE.getFullYear()) {
        neoData.closest = utils.findClosest(oneYearData, ACCEPTABLE_START_DATE, ACCEPTABLE_END_DATE);
      }
      NEO_DATA[year] = neoData;
      console.debug(`fetched data for year ${year}:`);
      console.debug(neoData);

      return Promise.resolve(neoData);
    })
    .catch(err => {
      console.error(err.response);
      delete NEO_DATA[year];
      return Promise.reject(err);
    });
}

module.exports = app;
