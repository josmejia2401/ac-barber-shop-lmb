################################################################################
# API Gateway
################################################################################

output "api_id" {
  description = "The API identifier"
  value       = aws_apigatewayv2_api.main.id
}
