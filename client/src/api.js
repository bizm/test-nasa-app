import * as Constants from './constants';

/**
 * Returns a url for API call based on mode (user selection). Default value
 * is '/api/ping'.
 **/
function getAPIUrl (mode, year) {
  switch (mode) {
    case Constants.MODE_DECEMBER_2015:
      return "/api/2015-12-19/2015-12-26";
    case Constants.MODE_SELECTED_YEAR:
      return `/api/${year}`;
    default:
      return "/api/ping";
  }
}

export class API {
  /**
   * Fetches data from API endpoint matching user selected option (mode).
   * In case of 202 (Accepted) response we return null. It should be treated by app
   * as a request in progress. In that case it should retry the same call later. Otherwise
   * anything that is not 200 (OK) is treated as error.
   */
  static fetch = async (mode, year) => {
    const url = getAPIUrl(mode, year);
    const response = await fetch(url);

    if (response.status === 202) {
      return null;
    }

    const body = await response.json();
    if (response.status !== 200) {
      throw Error(body.message);
    }

    return body;
  }
}
