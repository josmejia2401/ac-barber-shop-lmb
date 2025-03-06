################# IAM ####################

data "aws_iam_policy_document" "lambda_policy_document_authorizer" {
  statement {
    actions = [
      "dynamodb:Scan", "dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:DeleteItem"
    ]
    resources = [
      "arn:aws:dynamodb:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:table/tbl-${var.app_name}-token-${var.env}"
    ]
  }
}

resource "aws_iam_role" "lambda_role_authorizer" {
  name = "role-${var.app_name}-authorizer-${var.env}"
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
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_role_policy_authorizer" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role_authorizer.name
}

resource "aws_iam_policy" "dynamodb_lambda_policy_authorizer" {
  name        = "policy-${var.app_name}-authorizer-${var.env}"
  description = "This policy will be used by the lambda to write get data from DynamoDB"
  policy      = data.aws_iam_policy_document.lambda_policy_document_authorizer.json
  tags        = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_attachements" {
  role       = aws_iam_role.lambda_role_authorizer.name
  policy_arn = aws_iam_policy.dynamodb_lambda_policy_authorizer.arn
}

################# LAMBDA ####################

data "archive_file" "lambda_package_authorizer" {
  type        = "zip"
  source_dir  = "${path.root}/lambdas/auth/authorizer"
  output_path = "${path.root}/resources/auth/authorizer/index.zip"
}

resource "aws_lambda_function" "html_lambda_authorizer" {
  filename         = data.archive_file.lambda_package_authorizer.output_path
  function_name    = "lmb-${var.app_name}-authorizer-${var.env}"
  role             = aws_iam_role.lambda_role_authorizer.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x" # https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html
  source_code_hash = data.archive_file.lambda_package_authorizer.output_base64sha256
  timeout          = 30
  publish          = false
  tags             = var.tags
  architectures    = ["arm64"] #x86_64
  memory_size      = 128
}

resource "aws_cloudwatch_log_group" "html_loggroup_lambda_authorizer" {
  name              = "/aws/lambda/${aws_lambda_function.html_lambda_authorizer.function_name}"
  log_group_class   = "STANDARD"
  retention_in_days = 7
  tags              = var.tags
}

################# INTEGRATION ####################

resource "aws_apigatewayv2_authorizer" "header_based_authorizer" {
  api_id                            = var.api_id
  authorizer_type                   = "REQUEST"
  name                              = "lmb-${var.app_name}-authorizer-${var.env}"
  authorizer_payload_format_version = "2.0"
  authorizer_uri                    = aws_lambda_function.html_lambda_authorizer.invoke_arn
  enable_simple_responses           = true
  identity_sources                  = ["$request.header.authorization"]
  authorizer_result_ttl_in_seconds  = 0 #3600
}

resource "aws_lambda_permission" "allow_api_gw_invoke_authorizer" {
  statement_id  = "allowInvokeFromAPIGatewayAuthorizer"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.html_lambda_authorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${data.aws_apigatewayv2_api.selected.execution_arn}/authorizers/${aws_apigatewayv2_authorizer.header_based_authorizer.id}"
  depends_on    = [aws_apigatewayv2_authorizer.header_based_authorizer]
}
