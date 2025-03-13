################# IAM ####################

data "aws_iam_policy_document" "lambda_policy_document_customers_update" {
  statement {
    actions = [
      "dynamodb:UpdateItem", "dynamodb:GetItem", "dynamodb:Scan"
    ]
    resources = [
      "arn:aws:dynamodb:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:table/tbl-${var.app_name}-customers-${var.env}"
    ]
  }
}

resource "aws_iam_role" "lambda_role_customers_update" {
  name = "role-${var.app_name}-customers-update-${var.env}"
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

resource "aws_iam_role_policy_attachment" "lambda_role_policy_customers_update" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role_customers_update.name
}

resource "aws_iam_policy" "dynamodb_lambda_policy_customers_update" {
  name        = "policy-${var.app_name}-customers-update-${var.env}"
  description = "This policy will be used by the lambda to write get data from DynamoDB"
  policy      = data.aws_iam_policy_document.lambda_policy_document_customers_update.json
}

resource "aws_iam_role_policy_attachment" "lambda_attachements_customers_update" {
  role       = aws_iam_role.lambda_role_customers_update.name
  policy_arn = aws_iam_policy.dynamodb_lambda_policy_customers_update.arn
}

################# LAMBDA ####################

data "archive_file" "lambda_package_customers_update" {
  type        = "zip"
  source_dir  = "${path.root}/lambdas/core/customers-update-by-id"
  output_path = "${path.root}/resources/core/customers-update-by-id/index.zip"
}

resource "aws_lambda_function" "html_lambda_customers_update" {
  filename         = data.archive_file.lambda_package_customers_update.output_path
  function_name    = "lmb-${var.app_name}-customers-update-${var.env}"
  role             = aws_iam_role.lambda_role_customers_update.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x" # https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
  source_code_hash = data.archive_file.lambda_package_customers_update.output_base64sha256
  timeout          = 30
  publish          = false
  tags             = var.tags
  architectures    = ["arm64"] #x86_64
  memory_size      = 128
}

resource "aws_cloudwatch_log_group" "html_loggroup_lambda_customers_update" {
  name              = "/aws/lambda/${aws_lambda_function.html_lambda_customers_update.function_name}"
  log_group_class   = "STANDARD"
  retention_in_days = 7
}

################# INTEGRATION ####################

resource "aws_apigatewayv2_integration" "lambda_handler_customers_update" {
  api_id           = var.api_id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.html_lambda_customers_update.invoke_arn
  depends_on       = [aws_lambda_function.html_lambda_customers_update]
}

resource "aws_apigatewayv2_route" "handler_customers_update" {
  api_id             = var.api_id
  route_key          = "PUT /api/v1/customers/{id}"
  target             = "integrations/${aws_apigatewayv2_integration.lambda_handler_customers_update.id}"
  authorization_type = "CUSTOM"
  authorizer_id      = var.authorizer_id
}

resource "aws_lambda_permission" "api_gw_customers_update" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.html_lambda_customers_update.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${data.aws_apigatewayv2_api.selected.execution_arn}/*/*"
}
