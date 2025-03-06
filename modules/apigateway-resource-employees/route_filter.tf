################# IAM ####################

data "aws_iam_policy_document" "lambda_policy_document_employees_filter" {
  statement {
    actions = [
      "dynamodb:Scan"
    ]
    resources = [
      "arn:aws:dynamodb:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:table/tbl-${var.app_name}-employees-${var.env}"
    ]
  }
}

resource "aws_iam_role" "lambda_role_employees_filter" {
  name = "role-${var.app_name}-employees-filter-${var.env}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_role_policy_employees_filter" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role_employees_filter.name
}

resource "aws_iam_policy" "dynamodb_lambda_policy_employees_filter" {
  name        = "policy-${var.app_name}-employees-filter-${var.env}"
  description = "This policy will be used by the lambda to write get data from DynamoDB"
  policy      = data.aws_iam_policy_document.lambda_policy_document_employees_filter.json
}

resource "aws_iam_role_policy_attachment" "lambda_attachements_employees_filter" {
  role       = aws_iam_role.lambda_role_employees_filter.name
  policy_arn = aws_iam_policy.dynamodb_lambda_policy_employees_filter.arn
}

################# LAMBDA ####################

data "archive_file" "lambda_package_employees_filter" {
  type        = "zip"
  source_dir  = "${path.root}/lambdas/core/employees-filter"
  output_path = "${path.root}/resources/core/employees-filter/index.zip"
}

resource "aws_lambda_function" "html_lambda_employees_filter" {
  filename         = data.archive_file.lambda_package_employees_filter.output_path
  function_name    = "lmb-${var.app_name}-employees-filter-${var.env}"
  role             = aws_iam_role.lambda_role_employees_filter.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x" # https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
  source_code_hash = data.archive_file.lambda_package_employees_filter.output_base64sha256
  timeout          = 30
  publish          = false
  tags             = var.tags
  architectures    = ["arm64"] #x86_64
  memory_size      = 128
}

resource "aws_cloudwatch_log_group" "html_loggroup_lambda_employees_filter" {
  name              = "/aws/lambda/${aws_lambda_function.html_lambda_employees_filter.function_name}"
  log_group_class   = "STANDARD"
  retention_in_days = 7
}

################# INTEGRATION ####################

resource "aws_apigatewayv2_integration" "lambda_handler_employees_filter" {
  api_id           = var.api_id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.html_lambda_employees_filter.invoke_arn
  depends_on       = [aws_lambda_function.html_lambda_employees_filter]
}

resource "aws_apigatewayv2_route" "handler_employees_filter" {
  api_id             = var.api_id
  route_key          = "GET /api/v1/employees"
  target             = "integrations/${aws_apigatewayv2_integration.lambda_handler_employees_filter.id}"
  authorization_type = "CUSTOM"
  authorizer_id      = var.authorizer_id
}

resource "aws_lambda_permission" "api_gw_employees_filter" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.html_lambda_employees_filter.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${data.aws_apigatewayv2_api.selected.execution_arn}/*/*"
}
