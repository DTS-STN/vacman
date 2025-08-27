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
  app_name            = "Vacancy Manager (prod)"
  app_identifier_uris = ["api://prod.esdc-edsc.gc.ca/vacman"]
  app_passwords       = ["Default secret"]

  app_owners = [
    "gregory.j.baker@hrsdc-rhdcc.gc.ca",
    "jordan.willis@hrsdc-rhdcc.gc.ca",
    "landon.a.harrison@hrsdc-rhdcc.gc.ca",
    "sebastien.comeau@hrsdc-rhdcc.gc.ca",
  ]

  app_required_resource_accesses = [{
    resource_app_id = local.msgraph_api.id

    resource_accesses = [
      {
        id   = local.msgraph_api.scopes["openid"]
        type = "Scope",
      },
      {
        id   = local.msgraph_api.scopes["email"]
        type = "Scope",
      },
      {
        id   = local.msgraph_api.scopes["profile"]
        type = "Scope",
      },
      {
        id   = local.msgraph_api.roles["User.ReadBasic.All"]
        type = "Role",
      },
    ]
  }]

  app_roles = [
    {
      display_name = "HR Advisor"
      description  = "HR Advisor"
      group_name   = "Vacancy Manager: HR Advisors (prod)"
      id           = "4414634e-53f1-4427-833a-1c20e1f580b5"
      value        = "hr-advisor"
    },
  ]

  app_spa_redirect_uris = [
    # TODO ::: GjB ::: add prod redirect URIs here when available
  ]

  app_web_redirect_uris = [
    # TODO ::: GjB ::: add prod redirect URIs here when available
  ]
}
