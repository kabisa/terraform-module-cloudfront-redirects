# Terraform module for CloudFront redirect

This module can be used to set up static redirects from one URL to another in a
Lambda@Edge function for CloudFront. An example usage is as follows:

```hcl
data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}

module "redirects_label" {
  source  = "cloudposse/label/null"
  version = "0.24.1"

  name      = "redirects"
  stage     = "production"
  namespace = "namespace"
}

module "redirects" {
  providers = {
    aws = aws.us_east_1
  }

  source        = "../../terraform-module-cloudfront-redirects"
  label_context = module.redirects_label.context

  config = <<-EOF
    GET example.org/index.html 301 https://example.com/
    GET example.org/(.*)       301 https://example.com/$1

    GET example.net/index.html 301 https://example.com/
    GET example.net/(.*)       301 https://example.com/$1
  EOF
}

resource "aws_cloudfront_distribution" "redirects" {
  enabled     = true
  comment     = "Redirects distribution"
  price_class = "PriceClass_100"

  origin {
    domain_name = "www.example.org"
    origin_id   = "www.example.org"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods          = ["HEAD", "GET", "OPTIONS"]
    cached_methods           = ["HEAD", "GET", "OPTIONS"]
    target_origin_id         = "www.example.org"
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id

    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = module.redirects.lambda_qualified_arn
      include_body = false
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_archive"></a> [archive](#requirement\_archive) | ~> 2.2.0 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 4.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_archive"></a> [archive](#provider\_archive) | ~> 2.2.0 |
| <a name="provider_aws"></a> [aws](#provider\_aws) | ~> 4.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_label"></a> [label](#module\_label) | cloudposse/label/null | 0.24.1 |

## Resources

| Name | Type |
|------|------|
| [aws_iam_role.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy_attachment.lambda_basic_execution](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_lambda_function.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function) | resource |
| [archive_file.this](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file) | data source |
| [aws_iam_policy.lambda_basic_execution](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy) | data source |
| [aws_iam_policy_document.assume_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_config"></a> [config](#input\_config) | Formatted file containing the redirect rules. This is simple text files with<br>space separated fields per line. Whitespace only lines are ignored.<br><br>The following fields should be defined on each line. The first two fields<br>are used to match the request, the last two fields are used to build the<br>response.<br><br>* Request method: the rule only applies if the method of the request matches<br>  this this field exactly. Specify a literal * to match all request methods.<br>* Request URI: the rule only applies if the request URI, excluding the<br>  protocol, matches this field as a regular expression. The field is<br>  compiled to a JavaScript RegExp, so this dialect applies. The full URL<br>  should match the regex, start and end of line matchers are not necessary.<br>* Response status code: HTTP status code for the response. This should be<br>  in the 3xx range, though this module does not validate if it is correct.<br>* Response URI: this URI will be used as the location header in the<br>  response. Any captured groups from the request path can be used in this<br>  URI according to the String.prototype.replace function in JavaScript.<br>  This field contains the full URI including the protocol.<br><br>When a request is processed by the lambda, each rule is evaluated in order<br>until one matches the request. This rule is applied and the other rules are<br>ignored.<br><br>An example of a valid configuration is:<br><br>  GET example.org/index.html 301 https://example.com/<br>  GET example.org/(.*)       301 https://example.com/$1<br><br>  GET example.net/index.html 301 https://example.com/<br>  GET example.net/(.*)       301 https://example.com/$1 | `string` | n/a | yes |
| <a name="input_label_context"></a> [label\_context](#input\_label\_context) | Context for the null label which determines names of resources | `any` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_lambda_arn"></a> [lambda\_arn](#output\_lambda\_arn) | ARN of redirect function without version specifier |
| <a name="output_lambda_qualified_arn"></a> [lambda\_qualified\_arn](#output\_lambda\_qualified\_arn) | ARN of redirect function with version specifier |
<!-- END_TF_DOCS -->