################# IAM ####################

data "aws_iam_policy_document" "lambda_policy_document_login" {
  statement {
    actions = [
      "dynamodb:Scan", "dynamodb:DeleteItem", "dynamodb:PutItem"
    ]
    resources = [
      "arn:aws:dynamodb:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:table/tbl-${var.app_name}-token-${var.env}",
      "arn:aws:dynamodb:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:table/tbl-${var.app_name}-users-${var.env}"
    ]
  }
}

resource "aws_iam_role" "lambda_role_login" {
  name = "role-${var.app_name}-login-${var.env}"
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

resource "aws_iam_role_policy_attachment" "lambda_role_policy_login" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role_login.name
}

resource "aws_iam_policy" "dynamodb_lambda_policy_login" {
  name        = "policy-${var.app_name}-login-${var.env}"
  description = "This policy will be used by the lambda to write get data from DynamoDB"
  policy      = data.aws_iam_policy_document.lambda_policy_document_login.json
}

resource "aws_iam_role_policy_attachment" "lambda_attachements_login" {
  role       = aws_iam_role.lambda_role_login.name
  policy_arn = aws_iam_policy.dynamodb_lambda_policy_login.arn
}

################# LAMBDA ####################

data "archive_file" "lambda_package_login" {
  type        = "zip"
  source_dir  = "${path.root}/lambdas/auth/login"
  output_path = "${path.root}/resources/auth/login/index.zip"
}

resource "aws_lambda_function" "html_lambda_login" {
  filename         = data.archive_file.lambda_package_login.output_path
  function_name    = "lmb-${var.app_name}-login-${var.env}"
  role             = aws_iam_role.lambda_role_login.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x" # https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
  source_code_hash = data.archive_file.lambda_package_login.output_base64sha256
  timeout          = 30
  publish          = false
  tags             = var.tags
  architectures    = ["arm64"] #x86_64
  memory_size      = 128
}

resource "aws_cloudwatch_log_group" "html_loggroup_lambda_login" {
  name              = "/aws/lambda/${aws_lambda_function.html_lambda_login.function_name}"
  log_group_class   = "STANDARD"
  retention_in_days = 7
}

################# INTEGRATION ####################

resource "aws_apigatewayv2_integration" "lambda_handler_login" {
  api_id           = var.api_id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.html_lambda_login.invoke_arn
  depends_on       = [aws_lambda_function.html_lambda_login]
}

resource "aws_apigatewayv2_route" "handler_login" {
  api_id             = var.api_id
  route_key          = "POST /api/v1/security/login"
  target             = "integrations/${aws_apigatewayv2_integration.lambda_handler_login.id}"
  authorization_type = "NONE"
  authorizer_id      = 0
}

resource "aws_lambda_permission" "api_gw_login" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.html_lambda_login.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${data.aws_apigatewayv2_api.selected.execution_arn}/*/*"
}
