terraform init
terraform validate
terraform plan
terraform apply
terraform destroy



# lista los folder a eliminar
find . -name 'node_modules' -type d -prune

# elimina los folders node_modules
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

