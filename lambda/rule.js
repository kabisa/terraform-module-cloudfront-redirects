class Rule {
  constructor({ match, status, url }) {
    this.match = {
      method: match.method,
      url: this._urlToRegExp(match.url)
    };

    this.status = status;
    this.url = url;
  }

  matches(request) {
    return this._methodMatches(request) && this._urlMatches(request);
  }

  responseLocation(request) {
    return request.url.replace(this.match.url, this.url);
  }

  _methodMatches(request) {
    return !this.match.method || this.match.method === request.method;
  }

  _urlMatches(request) {
    return request.url.match(this.match.url);
  }

  _urlToRegExp(url) {
    const schemeRegExp = /^[a-zA-Z][a-zA-Z0-9+-.]*:\/\//;
    const urlWithoutScheme = url.replace(schemeRegExp, "");

    return new RegExp(`^${urlWithoutScheme}$`);
  }
}

export default Rule;
