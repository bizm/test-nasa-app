const utils = require('../src/utils');
const { neo } = require('./helper');

test("minDate", () => {
  expect(utils.minDate(new Date(2021, 0, 10), new Date(2021, 0, 1)))
    .toStrictEqual(new Date(2021, 0, 1));
  expect(utils.minDate(new Date(2021, 0, 1), new Date(2020, 11, 31)))
    .toStrictEqual(new Date(2020, 11, 31));
})

test("formatDate", () => {
  expect(utils.formatDate(new Date(2021, 0, 1))).toBe('2021-01-01');
  expect(utils.formatDate(new Date(2021, 9, 10))).toBe('2021-10-10');
  expect(utils.formatDate(new Date(2021, 11, 31))).toBe('2021-12-31');
});

test("dates", () => {
  const expected = [
    new Date(2015, 11, 19), new Date(2015, 11, 20), new Date(2015, 11, 21),
    new Date(2015, 11, 22), new Date(2015, 11, 23), new Date(2015, 11, 24),
    new Date(2015, 11, 25), new Date(2015, 11, 26)
  ];
  const actual = utils.dates(new Date(2015, 11, 19), new Date(2015, 11, 26));
  expect(actual).toStrictEqual(expected);
});

test("findClosest should find closest NEO and handle dates with no data", () => {
  const data = {
    '2015-12-19': [ neo(1, 49800), neo(2, 73600), neo(3, 237300) ],
    '2015-12-20': [ neo(4, 22700), neo(5, 177400), neo(6, 53000) ],
    '2015-12-21': [ neo(7, 361900), neo(8, 165900) ]
  };
  const result = utils.findClosest(data, new Date(2015, 11, 19), new Date(2015, 11, 26));
  expect(result.id).toBe(4);
})

test("findBiggest should find biggest NEO and handle dates with no data", () => {
  const data = {
    '2015-01-20': [ neo(1, null, 5.2), neo(2, null, 4.1), neo(3, null, 9.9) ],
    '2015-02-21': [ neo(4, null, 1.5), neo(5, null, 24), neo(6, null, 53) ],
    '2015-10-22': [ neo(7, null, 12), neo(8, null, 6.7) ]
  };
  const result = utils.findBiggest(data);
  expect(result.id).toBe(6);
})
