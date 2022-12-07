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

  redirect_rules = [
    {
      match = {
        method = "GET"
        url    = "https://example.org/index.html"
      }

      status = 301
      url    = "https://example.com/"
    },
    {
      match = {
        method = "GET"
        url    = "https://example.org/(.*)"
      }

      status = 301
      url    = "https://example.com/$1"
    }
  ]
}

resource "aws_cloudfront_distribution" "redirects" {
  enabled     = true
  comment     = "Redirects distribution"
  price_class = "PriceClass_100"
  aliases     = ["example.org"]

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
| <a name="input_label_context"></a> [label\_context](#input\_label\_context) | Context for the null label which determines names of resources | `any` | n/a | yes |
| <a name="input_redirect_rules"></a> [redirect\_rules](#input\_redirect\_rules) | Rules determine which URLs redirect to which other URLs.<br><br>The match object determines if a request matches the rule. Both the method<br>and URL should match. If no method is specified, all request methods<br>will match.<br><br>The match URL can be a regular expression. In this case, the beginning and<br>end of line matchers are added implicitly. The JavaScript regular expression<br>dialect should be used. Only the host and path of the URL are used to match<br>the request. All other parts, like the scheme, query and fragment are<br>ignored.<br><br>The status and URL determine where the client is redirected to. Both must be<br>set. The URL should include a scheme and can use any capturing groups<br>captured during the matching phase.<br><br>See documentation on JavaScript's String.prototype.replace to learn more<br>about JavaScript regular expressions and the usage of capturing groups in<br>the reponse URL. | <pre>list(<br>    object(<br>      {<br>        status = number<br>        url    = string<br><br>        match = object({<br>          method = optional(string)<br>          url    = string<br>        })<br>      }<br>    )<br>  )</pre> | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_lambda_arn"></a> [lambda\_arn](#output\_lambda\_arn) | ARN of redirect function without version specifier |
| <a name="output_lambda_qualified_arn"></a> [lambda\_qualified\_arn](#output\_lambda\_qualified\_arn) | ARN of redirect function with version specifier |
<!-- END_TF_DOCS -->
