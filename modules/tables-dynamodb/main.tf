resource "aws_dynamodb_table" "tbl_users" {
  name         = local.tbl_users
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "N"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "tbl_token" {
  name         = local.tbl_token
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "N"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "tbl_customers" {
  name         = local.tbl_customers
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "userId"

  attribute {
    name = "id"
    type = "N"
  }
  attribute {
    name = "userId"
    type = "N"
  }

  tags = var.tags
}


resource "aws_dynamodb_table" "tbl_employees" {
  name         = local.tbl_employees
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "userId"

  attribute {
    name = "id"
    type = "N"
  }
  attribute {
    name = "userId"
    type = "N"
  }

  tags = var.tags
}


resource "aws_dynamodb_table" "tbl_suppliers" {
  name         = local.tbl_suppliers
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "userId"

  attribute {
    name = "id"
    type = "N"
  }
  attribute {
    name = "userId"
    type = "N"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "tbl_inventories" {
  name         = local.tbl_inventories
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "userId"

  attribute {
    name = "id"
    type = "N"
  }
  attribute {
    name = "userId"
    type = "N"
  }

  tags = var.tags
}
