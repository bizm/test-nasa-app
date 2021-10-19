require('./date-ext');

const minDate = (dateA, dateB) => {
  return (dateB < dateA) ? dateB : dateA;
}

const formatDate = (date) => {
  return `${date.getFullYear()}-${fillUp(date.getMonth() + 1, '0', 2)}-${fillUp(date.getDate(), '0', 2)}`;
}

function fillUp(value, filler, length) {
  value = String(value) || "";
  while (value.length < length) {
    value = filler + value;
  }
  return value;
}

const dates = (startDate, endDate) => {
  let date = new Date(startDate);
  const result = [];
  while (date <= endDate) {
    result.push(date);
    date = date.plusDays(1);
  }
  return result;
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
function findClosest(oneYearData, startDate, endDate) {
  return dates(startDate, endDate)
    .map(date => {
      return (oneYearData[formatDate(date)] || [])
        .sort(byClosestApproach)[0]
    })
    .sort(byClosestApproach)[0];
}
/**
 * A comparison function for sorting near-earth objects by their approach distance.
 */
function byClosestApproach(a, b) {
  // We assume that close_approach_data always has exactly one item
  // but we're not sure if this approach is not correct.
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

exports.minDate = minDate;
exports.formatDate = formatDate;
exports.dates = dates;
exports.findBiggest = findBiggest;
exports.findClosest = findClosest;
