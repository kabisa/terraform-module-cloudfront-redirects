locals {
  lambda_path = "${path.module}/lambda"
}

data "archive_file" "this" {
  type             = "zip"
  output_path      = "${path.module}/lambda.zip"
  output_file_mode = "0644"

  source {
    content  = jsonencode(var.redirect_rules)
    filename = "rules.json"
  }

  dynamic "source" {
    for_each = fileset(local.lambda_path, "**")

    content {
      filename = source.key
      content  = file("${local.lambda_path}/${source.key}")
    }
  }
}

resource "aws_lambda_function" "this" {
  filename         = data.archive_file.this.output_path
  function_name    = module.label.id
  publish          = true
  role             = aws_iam_role.this.arn
  handler          = "index.handler"
  runtime          = "nodejs16.x"
  source_code_hash = filebase64sha256(data.archive_file.this.output_path)
}
