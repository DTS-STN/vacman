# ---------------------------------------------------------------------------------------------------------------------
# TERRAGRUNT NONPROD CONFIGURATION
# ---------------------------------------------------------------------------------------------------------------------

terraform {
  source = "../../../terraform//entra-app"
}

include "root" {
  path = "../../terragrunt-root.hcl"
}

locals {
  common_vars = read_terragrunt_config("../env-vars.hcl").locals.common_vars
  msgraph_api = local.common_vars.locals.external_apis["Microsoft Graph"]
}

inputs = {
  app_name            = "Vacancy Manager (nonprod)"
  app_identifier_uris = ["api://nonprod.esdc-edsc.gc.ca/vacman"]
  app_passwords       = ["Default secret"]

  app_owners = [
    "gregory.j.baker@hrsdc-rhdcc.gc.ca",
    "jordan.willis@hrsdc-rhdcc.gc.ca",
    "landon.a.harrison@hrsdc-rhdcc.gc.ca",
  ]

  app_web_redirect_uris = [
    "http://localhost:3000/auth/callback/azuread",
  ]
}
