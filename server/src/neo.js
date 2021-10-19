require('./date-ext');
const axios = require('axios');
const stream = require('stream');
const parallel = require('parallel-stream');
const utils = require('./utils');

// Length of NEO feed interval in days.
const NEO_FEED_INTERVAL_IN_DAYS = 7;
// Number of simultaneous HTTP requests to NASA API. You can play with this setting.
// I was able to get 20 work smoothly, but 6 is a safe bet.
const HTTP_MAX_SIMULTANEOUS_REQUESTS = 6;
// Obviously this is a NASA API key. It comes from an environment variable.
const NASA_API_KEY = process.env.NASA_API_KEY;

// We'll write to log only first and last two characters from NASA API key
console.debug(`NASA_API_KEY: ${(NASA_API_KEY || "").replaceAll(/^(.{3}).+(.{3})$/g, "$1...$2")}`);

/**
 * Fetches data from NEO feed for one period specified by starting and end dates.
 **/
const neoFeed = async (startDate, endDate, callback) => {
  try {
    const url = "https://api.nasa.gov/neo/rest/v1/feed?" +
      `start_date=${utils.formatDate(startDate)}&` +
      `end_date=${utils.formatDate(endDate)}&` +
      `api_key=${NASA_API_KEY}`;
    console.debug(url);
    const response = await axios.get(url);
    callback(null, response.data);
  } catch (err) {
    callback(err);
  }
}

/**
 * Generates intervals for which we'll be fetching data from NEO feed.
 **/
async function* neoIntervals(year) {
  let date = new Date(year, 0, 1);
  const maxDate = date.plusYears(1).plusDays(-1);
  while (date < maxDate) {
    yield { startDate: date, endDate: utils.minDate( date.plusDays(NEO_FEED_INTERVAL_IN_DAYS), maxDate) };
    date = date.plusDays(NEO_FEED_INTERVAL_IN_DAYS + 1);
  }
}

/**
 * Fetches data from NASA API for the whole year by splitting that year
 * in intervals, fetching data for each of them separately and packing in a
 * single response object that'll be returned back to app for further processing.
 **/
module.exports = async (year) => {
  const out = stream.Readable.from(neoIntervals(year)).pipe(
    parallel.transform(
      (item, encoding, callback) => {
        neoFeed(item.startDate, item.endDate, (err, response) => {
          if (err) {
            console.error(err.response);
            return callback(new Error(
              `NEO feed returned ${err.response.status} '${err.response.statusText}' ` +
              `(${err.response.config.url})`
            ));
          }
          callback(null, response.near_earth_objects);
        });
      },
      {
        objectMode: true,
        concurrency: HTTP_MAX_SIMULTANEOUS_REQUESTS,
        highWaterMark: HTTP_MAX_SIMULTANEOUS_REQUESTS * 2
      }
    )
  );
  const result = {};
  for await (const item of out) {
    Object.assign(result, item);
  }
  return result;
}
