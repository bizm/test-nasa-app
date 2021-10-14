// let's assume that end date is indeed greater then start date
// TODO: do we still need this?
const dateDiffInDays = (startDate, endDate) => {
  return (endDate - startDate) / (86400000);
}

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
  while (date < endDate) {
    result.push(date);
    date = date.plusDays(1);
  }
  return result;
}

exports.dateDiffInDays = dateDiffInDays;
exports.minDate = minDate;
exports.formatDate = formatDate;
exports.dates = dates;
