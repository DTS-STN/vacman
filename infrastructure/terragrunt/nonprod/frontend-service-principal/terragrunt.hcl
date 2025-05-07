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
  app_name            = "Vacancy Manager: Frontend Service Principal (nonprod)"
  app_identifier_uris = ["api://nonprod.vacman.esdc-edsc.gc.ca/frontend"]
  app_passwords       = ["Default secret"]

  app_owners = [
    "gregory.j.baker@hrsdc-rhdcc.gc.ca",
    "landon.a.harrison@hrsdc-rhdcc.gc.ca",
  ]

  app_required_resource_accesses = [{
    resource_app_id = local.msgraph_api.id

    resource_accesses = [
      {
        id   = local.msgraph_api.roles["User.Read.All"]
        type = "Role",
      },
    ]
  }]

  app_roles = [
    {
      display_name = "Administrator"
      description  = "Administrator"
      group_name   = "Vacancy Manager Administrators (nonprod)"
      id           = "cb7175b7-6858-4b06-849c-5599cd5c5b9b"
      value        = "admin"
    },
    {
      display_name = "User"
      description  = "User"
      group_name   = "Vacancy Manager Users (nonprod)"
      id           = "f40d2349-41e5-4e14-9250-6923681c8538"
      value        = "user"
    }
  ]

  app_web_redirect_uris = [
    "http://localhost:3000/auth/callback/azuread",
  ]

  role_assignments = {
    admin = [
      "gregory.j.baker@hrsdc-rhdcc.gc.ca",
      "landon.a.harrison@hrsdc-rhdcc.gc.ca",
    ]
    user = [
      "gregory.j.baker@hrsdc-rhdcc.gc.ca",
      "landon.a.harrison@hrsdc-rhdcc.gc.ca",
    ]
  }

  service_principal_group_memberships = ["admin"]
}
