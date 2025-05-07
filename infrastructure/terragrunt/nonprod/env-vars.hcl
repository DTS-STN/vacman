# ---------------------------------------------------------------------------------------------------------------------
# ENVIRONMENT-SPECIFIC TERRAGRUNT VARIABLES
#
# Variables that are common to all environments.
# Usage: env_vars = read_terragrunt_config(find_in_parent_folders("env-vars.hcl"))
# ---------------------------------------------------------------------------------------------------------------------

locals {
  common_vars = read_terragrunt_config("../common-vars.hcl")

  environment                  = "DTS Nonprod"
  backend_resource_group_name  = "vacancy-management"
  backend_storage_account_name = "vacancymanagementdev"
  backend_subscription_id      = "07f55ef5-e27b-42ca-9771-f2705b08acd1" # MTS

  tags = merge(local.common_vars.locals.tags, {
    "Environment" = local.environment
  })
}
