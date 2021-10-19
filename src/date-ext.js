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
