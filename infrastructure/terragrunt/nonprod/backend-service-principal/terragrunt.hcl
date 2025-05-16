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
  app_name            = "Vacancy Manager API (nonprod)"
  app_identifier_uris = ["api://nonprod.esdc-edsc.gc.ca/vacman-api"]
  app_passwords       = ["Default secret"]

  app_owners = [
    "gregory.j.baker@hrsdc-rhdcc.gc.ca",
    "jordan.willis@hrsdc-rhdcc.gc.ca",
    "landon.a.harrison@hrsdc-rhdcc.gc.ca",
  ]

  app_oauth2_permission_scopes = [
    {
      id                         = "a47c2131-aa47-4d5c-ae3a-484bf1cdd965"
      value                      = "Users.Manage"
      admin_consent_description  = "Allows the application to manage user accounts within the system on your behalf."
      admin_consent_display_name = "Manage users"
      user_consent_description   = "Allows the application to manage user accounts within the system on your behalf."
      user_consent_display_name  = "Manage users"
    }
  ]

  app_roles = [
    {
      display_name = "Administrator"
      description  = "Administrator"
      group_name   = "Vacancy Manager: Administrators (nonprod)"
      id           = "cb7175b7-6858-4b06-849c-5599cd5c5b9b"
      value        = "admin"
    },
    {
      display_name = "Hiring Manager"
      description  = "Hiring Manager"
      group_name   = "Vacancy Manager: Hiring Managers (nonprod)"
      id           = "c37fcf70-a2f5-4b02-bae6-b552f4fee249"
      value        = "hiring-manager"
    },
    {
      display_name = "HR Advisor"
      description  = "HR Advisor"
      group_name   = "Vacancy Manager: HR Advisors (nonprod)"
      id           = "7b15982a-d72a-476a-8ac3-2691354680ab"
      value        = "hr-advisor"
    },
    {
      display_name = "Employee"
      description  = "Employee"
      group_name   = "Vacancy Manager: Employees (nonprod)"
      id           = "f40d2349-41e5-4e14-9250-6923681c8538"
      value        = "employee"
    },
  ]

  app_web_redirect_uris = [
    "http://localhost:3000/auth/callback/azuread",
  ]

  role_assignments = {
    admin = [
      "gregory.j.baker@hrsdc-rhdcc.gc.ca",
      "jordan.willis@hrsdc-rhdcc.gc.ca",
      "landon.a.harrison@hrsdc-rhdcc.gc.ca",
    ]
    employee = [
      "gregory.j.baker@hrsdc-rhdcc.gc.ca",
      "jordan.willis@hrsdc-rhdcc.gc.ca",
      "landon.a.harrison@hrsdc-rhdcc.gc.ca",
    ]
  }

  service_principal_group_memberships = ["admin"]
}
