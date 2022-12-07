variable "label_context" {
  type        = any
  description = "Context for the null label which determines names of resources"
}

variable "redirect_rules" {
  type = list(
    object(
      {
        status = number
        url    = string

        match = object({
          method = optional(string)
          url    = string
        })
      }
    )
  )

  description = <<-EOF
    Rules determine which URLs redirect to which other URLs.

    The match object determines if a request matches the rule. Both the method
    and URL should match. If no method is specified, all request methods
    will match.

    The match URL can be a regular expression. In this case, the beginning and
    end of line matchers are added implicitly. The JavaScript regular expression
    dialect should be used. Only the host and path of the URL are used to match
    the request. All other parts, like the scheme, query and fragment are
    ignored.

    The status and URL determine where the client is redirected to. Both must be
    set. The URL should include a scheme and can use any capturing groups
    captured during the matching phase.

    See documentation on JavaScript's String.prototype.replace to learn more
    about JavaScript regular expressions and the usage of capturing groups in
    the reponse URL.
  EOF

  validation {
    condition = alltrue([
      for rule in var.redirect_rules :
      rule.match.method == null ? true : contains(
        [
          "GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE", "CONNECT",
          "TRACE"
        ],
        rule.match.method
      )
    ])

    error_message = "Request method should be an HTTP method, or be omitted"
  }

  validation {
    condition = alltrue([
      for rule in var.redirect_rules :
      contains([301, 302, 303, 307, 308], rule.status)
    ])

    error_message = "Response status should be a valid redirect status code"
  }
}
