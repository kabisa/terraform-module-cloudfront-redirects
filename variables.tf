variable "label_context" {
  type        = any
  description = "Context for the null label which determines names of resources"
}

variable "config" {
  type = string

  description = <<-EOF
    Formatted file containing the redirect rules. This is simple text files with
    space separated fields per line. Whitespace only lines are ignored.

    The following fields should be defined on each line. The first two fields
    are used to match the request, the last two fields are used to build the
    response.

    * Request method: the rule only applies if the method of the request matches
      this this field exactly. Specify a literal * to match all request methods.
    * Request URI: the rule only applies if the request URI, excluding the
      protocol, matches this field as a regular expression. The field is
      compiled to a JavaScript RegExp, so this dialect applies. The full URL
      should match the regex, start and end of line matchers are not necessary.
    * Response status code: HTTP status code for the response. This should be
      in the 3xx range, though this module does not validate if it is correct.
    * Response URI: this URI will be used as the location header in the
      response. Any captured groups from the request path can be used in this
      URI according to the String.prototype.replace function in JavaScript.
      This field contains the full URI including the protocol.

    When a request is processed by the lambda, each rule is evaluated in order
    until one matches the request. This rule is applied and the other rules are
    ignored.

    An example of a valid configuration is:

      GET example.org/index.html 301 https://example.com/
      GET example.org/(.*)       301 https://example.com/$1

      GET example.net/index.html 301 https://example.com/
      GET example.net/(.*)       301 https://example.com/$1
  EOF
}
