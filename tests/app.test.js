const request = require('supertest');
const app = require('../src/app.js');
const helper = require('./helper');

/**
 * Mock 'neo' module implementation. It'll return data for January 1, February 20
 * and December 20 of specified year. It's obvious that only December 20 data
 * will be included into /api/2015-12-19/2015-12-26 response.
 */
jest.mock('../src/neo');
const neo = require('../src/neo');
neo.mockImplementation(async (year) => {
  const response = {};
  response[`${year}-01-01`] = [
    helper.neo(1, 49800, 5.2), helper.neo(2, 73600, 4.1), helper.neo(3, 237300, 9.9)
  ];
  response[`${year}-02-20`] = [
    helper.neo(4, 22700, 1.5), helper.neo(5, 177400, 24), helper.neo(6, 53000, 53)
  ];
  response[`${year}-12-20`] = [
    helper.neo(7, 361900, 12), helper.neo(8, 165900, 6.7)
  ];

  return response;
});

describe('GET /api/ping', () => {
  it('should return 200', async () => {
    const response = await request(app).get("/api/ping");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ data: "pong" });
  })

  test("GET /api/2015 should return 202 at first", async () => {
    const response = await request(app).get("/api/2015");
    expect(response.statusCode).toBe(202);
  })

  test("GET /api/2015 should return 200 on a second turn", async () => {
    const response = await request(app).get("/api/2015");
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(6);
  })

  test("GET /api/2015-12-19/2015-12-26 should return 200 immediatelly", async () => {
    const response = await request(app).get("/api/2015-12-19/2015-12-26");
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(8);
  })
})
