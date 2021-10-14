const axios = require('axios');
const stream = require('stream');
const parallel = require('parallel-stream');
const utils = require('./utils');

const NEO_FEED_INTERVAL_IN_DAYS = 7;
const HTTP_MAX_SIMULTANEOUS_REQUESTS = 20;
const NASA_API_KEY = process.env.NASA_API_KEY;

// We'll debug only first and last two characters from NASA API key
console.debug(`NASA_API_KEY: ${(NASA_API_KEY || "").replaceAll(/^(.{3}).+(.{3})$/g, "$1...$2")}`);

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

async function* neoIntervals(year) {
  let date = new Date(year, 0, 1);
  const maxDate = date.plusYears(1).plusDays(-1);
  while (date < maxDate) {
    yield { startDate: date, endDate: utils.minDate( date.plusDays(NEO_FEED_INTERVAL_IN_DAYS), maxDate) };
    date = date.plusDays(NEO_FEED_INTERVAL_IN_DAYS + 1);
  }
}

exports.neo = async (year) => {
  const out = stream.Readable.from(neoIntervals(year)).pipe(
    parallel.transform(
      (item, encoding, callback) => {
        neoFeed(item.startDate, item.endDate, (err, response) => {
          if (err) {
            console.error(err);
            return callback(new Error(
              `NEO feed returned ${err.response.data.code} '${err.response.data.error_message}' ` +
              `(${err.response.data.request})`
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
