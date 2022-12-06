class Rule {
  constructor(requestMethod, requestPathRegExp, responseUri, responseStatus) {
    this.requestMethod = requestMethod;
    this.requestUriRegExp = requestUriRegExp;
    this.responseUri = responseUri;
    this.responseStatus = responseStatus;
  }

  matches(request) {
    return this._methodMatches(request) && this._uriMatches(request);
  }

  targetFor(request) {
    return request.uri.replace(this.requestUriRegExp, this.responseUri);
  }

  _methodMatches(request) {
    return this.requestMethod === "*" || request.method == this.requestMethod;
  }

  _uriMatches(request) {
    return request.uri.match(this.requestPathRegExp);
  }
}

export default Rule;
