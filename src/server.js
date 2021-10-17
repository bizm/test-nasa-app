const express = require('express');
const utils = require('./utils');
const NASA = require('./nasa');

/**
 * Add helper methods to Date class that will simplify our life.
 */
Date.prototype.plusDays = function(days) {
  const date = new Date(this);
  date.setDate(date.getDate() + days);
  return date;
}
Date.prototype.plusYears = function(years) {
  const date = new Date(this);
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date;
}

const APP_PORT = process.env.PORT || 80;
const ACCEPTABLE_START_DATE = new Date(2015, 11, 19);
const ACCEPTABLE_END_DATE = new Date(2015, 11, 26);
const NEO_DATA = {};

const app = express();
app.listen(APP_PORT, () => console.log(`Listening on port ${APP_PORT}`));
app.use(express.static('client/build'));
app.get('/api/ping', (req, res) => {
  console.debug(`Serving request ${req.url}`);
  res.send({ data: "pong" });
});
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
app.get('/api/:year', (req, res) => {
  console.debug(`Serving request ${req.url}`);

  if (! /^\d+$/.test(req.params.year)) {
    return res.status(400).send({ error: "Invalid request" });
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


function withNeoData(year, callback) {
  callback(null, NEO_DATA[year] || null);
  // if (NEO_DATA.hasOwnProperty(year)) {
  //   return callback(null, NEO_DATA[year]);
  // }
  // NEO_DATA[year] = null;
  if (!NEO_DATA.hasOwnProperty(year)) {
    NEO_DATA[year] = null;
    fetchNeoData(year);
  }
  // fetchNeoData(year)
  //   .then(result => callback(null, result))
  //   .catch(err => callback(err));
}
function fetchNeoData(year) {
  NEO_DATA[year] = null;
  return NASA.neo(year)
    .then(oneYearData => {
      const neoData = {
        biggest: findBiggest(oneYearData)
      };
      if (year === ACCEPTABLE_START_DATE.getFullYear()) {
        neoData.closest = findClosest(oneYearData);
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

/**
 * Find biggest near-earth object from the list of all the objects from the whole year data.
 */
function findBiggest(oneYearData) {
  const arr = [];
  return arr.concat.apply(arr, Object.values(oneYearData))
    .sort(byDiameter).reverse()[0];
}
/**
 * Find the largest near-earth object from the list of all the objects from the whole year data.
 * In our case we only compare objects between acceptable start and end date, which are
 * December 19 and December 26 year 2015 (respectively). In theory we also have
 * to make sure that provided data is indeed for year 2015, otherwise this implementation
 * will fail. For now we will just assume it is invoked correctly.
 */
function findClosest(oneYearData) {
  return utils.dates(ACCEPTABLE_START_DATE, ACCEPTABLE_END_DATE)
    .map(date => {
      return oneYearData[utils.formatDate(date)]
        .sort(byClosestApproach)[0]
    })
    .sort(byClosestApproach)[0];
}
/**
 * A comparison function for sorting near-earth objects by their approach distance.
 */
function byClosestApproach(a, b) {
  // We assume that close_approach_data always has exactly one item
  // but of course this approach is not correct.
  const valueA = a.close_approach_data[0].miss_distance.kilometers;
  const valueB = b.close_approach_data[0].miss_distance.kilometers;
  return valueA - valueB;
}
/**
 * A comparison function for sorting near-earth objects by their size (estimated_diameter).
 */
function byDiameter(a, b) {
  // Let's assume there are no asteroids A and B so that
  // A.max > B.max and A.min < B.min
  const aMax = a.estimated_diameter.meters.estimated_diameter_max;
  const bMax = b.estimated_diameter.meters.estimated_diameter_max;
  return aMax - bMax;
}

// Pre-fetch data for year 2015.
// fetchNeoData(2015);
