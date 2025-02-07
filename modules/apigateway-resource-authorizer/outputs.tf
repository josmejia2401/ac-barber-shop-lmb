################################################################################
# Authorizer(s)
################################################################################

output "authorizer_id" {
  #description = "Map of API Gateway Authorizer(s) created and their attributes"
  description = "ID authorizer"
  value       = aws_apigatewayv2_authorizer.header_based_authorizer.id
}
