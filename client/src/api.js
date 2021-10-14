import * as Constants from './constants';

function getAPIUrl (mode, year) {
  switch (mode) {
    case Constants.MODE_DECEMBER_2015:
      return "/api/2015-12-19/2015-12-26";
    case Constants.MODE_SELECTED_YEAR:
      return `/api/${year}`;
    default:
      return null;
  }
}

export class API {
  static fetch = async (mode, year) => {
    const url = getAPIUrl(mode, year);
    const response = await fetch(url);
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  }
}
