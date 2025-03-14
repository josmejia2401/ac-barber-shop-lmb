################# IAM ####################

data "aws_iam_policy_document" "lambda_policy_document_transaction_history_create" {
  statement {
    actions = [
      "dynamodb:Scan", "dynamodb:PutItem", "dynamodb:Query"
    ]
    resources = [
      "arn:aws:dynamodb:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:table/tbl-${var.app_name}-transaction-history-${var.env}"
    ]
  }
}

resource "aws_iam_role" "lambda_role_transaction_history_create" {
  name = "role-${var.app_name}-transaction-history-create-${var.env}"
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

resource "aws_iam_role_policy_attachment" "lambda_role_policy_transaction_history_create" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role_transaction_history_create.name
}

resource "aws_iam_policy" "dynamodb_lambda_policy_transaction_history_create" {
  name        = "policy-${var.app_name}-transaction-history-create-${var.env}"
  description = "This policy will be used by the lambda to write get data from DynamoDB"
  policy      = data.aws_iam_policy_document.lambda_policy_document_transaction_history_create.json
}

resource "aws_iam_role_policy_attachment" "lambda_attachements_transaction_history_create" {
  role       = aws_iam_role.lambda_role_transaction_history_create.name
  policy_arn = aws_iam_policy.dynamodb_lambda_policy_transaction_history_create.arn
}

################# LAMBDA ####################

data "archive_file" "lambda_package_transaction_history_create" {
  type        = "zip"
  source_dir  = "${path.root}/lambdas/core/transaction-history-create"
  output_path = "${path.root}/resources/core/transaction-history-create/index.zip"
}

resource "aws_lambda_function" "html_lambda_transaction_history_create" {
  filename         = data.archive_file.lambda_package_transaction_history_create.output_path
  function_name    = "lmb-${var.app_name}-transaction-history-create-${var.env}"
  role             = aws_iam_role.lambda_role_transaction_history_create.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x" # https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
  source_code_hash = data.archive_file.lambda_package_transaction_history_create.output_base64sha256
  timeout          = 30
  publish          = false
  tags             = var.tags
  architectures    = ["arm64"] #x86_64
  memory_size      = 128
}

resource "aws_cloudwatch_log_group" "html_loggroup_lambda_transaction_history_create" {
  name              = "/aws/lambda/${aws_lambda_function.html_lambda_transaction_history_create.function_name}"
  log_group_class   = "STANDARD"
  retention_in_days = 7
}

################# INTEGRATION ####################

resource "aws_apigatewayv2_integration" "lambda_handler_transaction_history_create" {
  api_id           = var.api_id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.html_lambda_transaction_history_create.invoke_arn
  depends_on       = [aws_lambda_function.html_lambda_transaction_history_create]
}

resource "aws_apigatewayv2_route" "handler_transaction_history_create" {
  api_id             = var.api_id
  route_key          = "POST /api/v1/transaction-history"
  target             = "integrations/${aws_apigatewayv2_integration.lambda_handler_transaction_history_create.id}"
  authorization_type = "CUSTOM"
  authorizer_id      = var.authorizer_id
}

resource "aws_lambda_permission" "api_gw_transaction_history_create" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.html_lambda_transaction_history_create.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${data.aws_apigatewayv2_api.selected.execution_arn}/*/*"
}
