locals {
  tbl_users       = "tbl-${var.app_name}-users-${var.env}"
  tbl_token       = "tbl-${var.app_name}-token-${var.env}"
  tbl_customers   = "tbl-${var.app_name}-customers-${var.env}"
  tbl_employees   = "tbl-${var.app_name}-employees-${var.env}"
  tbl_suppliers   = "tbl-${var.app_name}-suppliers-${var.env}"
  tbl_inventories = "tbl-${var.app_name}-inventories-${var.env}"
}
