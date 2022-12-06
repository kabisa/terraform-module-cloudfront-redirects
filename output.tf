output "lambda_arn" {
  description = "ARN of redirect function without version specifier"
  value       = aws_lambda_function.this.arn
}

output "lambda_qualified_arn" {
  description = "ARN of redirect function with version specifier"
  value       = aws_lambda_function.this.qualified_arn
}
