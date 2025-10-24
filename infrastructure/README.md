# Vacancy Manager - Infrastructure

This repository contains the infrastructure-as-code (IaC) for the Vacancy Manager application, using Terraform and Terragrunt to manage Microsoft Entra ID resources.

## Overview

The project is structured to provide a reusable Terraform module for creating Entra ID application registrations and to use Terragrunt for managing different deployment environments (e.g., non-production and production).

- **Terraform:** Used to define the Entra ID application resources in a modular and reusable way.
- **Terragrunt:** Used as a wrapper for Terraform to manage remote state, and environment-specific configurations, promoting a DRY (Don't Repeat Yourself) approach.

## Requirements

This project has been tested with the following toolchain:

| Tool       | Version          |
| ---------- | ---------------- |
| [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)   | ≥ 2.60.x          |
| [Terraform](https://www.terraform.io/downloads.html)                        | ≥ 1.10.x, < 2.0.x |
| [Terragrunt](https://terragrunt.gruntwork.io/docs/getting-started/install/) | ≥ 0.65.x          |

## Directory Structure

```
.
├── terraform/
│   └── entra-app/      # Reusable Terraform module for creating an Entra ID app
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── terragrunt/
    ├── common-vars.hcl # Variables common to all environments
    ├── terragrunt-root.hcl # Root Terragrunt configuration for remote state
    ├── nonprod/
    │   ├── env-vars.hcl
    │   └── ...
    └── prod/
        ├── env-vars.hcl
        └── ...
```

### Terraform Module: `entra-app`

This module (`terraform/entra-app`) is responsible for creating and configuring a Microsoft Entra ID application. Its key features include:

- **App Registration:** Creates the main Entra ID application registration.
- **Service Principal:** Creates a service principal for the application.
- **App Roles & Security Groups:** Dynamically creates app roles and corresponding security groups for role-based access control (RBAC).
- **Group Assignments:** Assigns users and the service principal to the appropriate security groups based on role definitions.
- **OAuth2 & API Permissions:** Configures OAuth2 permission scopes and required API permissions (e.g., for Microsoft Graph).

### Terragrunt Configuration

Terragrunt is used to orchestrate the deployment of the `entra-app` module across different environments.

- **`terragrunt-root.hcl`:** Sets up the Azure backend for storing Terraform's remote state.
- **`common-vars.hcl`:** Defines variables and configurations that are shared across all environments (e.g., common tags, external API definitions).
- **`nonprod/` and `prod/` directories:** Contain the environment-specific configurations. Each environment has its own `env-vars.hcl` for environment-specific variables and a `terragrunt.hcl` file that defines the inputs for the `entra-app` module for that particular environment.

## Usage

To apply the infrastructure for a specific environment, navigate to the environment's directory and run the Terragrunt commands.

### Prerequisites

- Azure CLI with an active login (`az login`)
- Appropriate permissions in the target Azure subscription to create and manage Entra ID applications.

### Applying Changes

1.  **Navigate to the environment directory:**
    ```bash
    cd terragrunt/nonprod/backend-service-principal
    ```

2.  **Initialize Terragrunt (and Terraform):**
    ```bash
    terragrunt init
    ```

3.  **Plan the changes:**
    ```bash
    terragrunt plan
    ```

4.  **Apply the changes:**
    ```bash
    terragrunt apply
    ```

### Updating Terraform Modules

To update the Terraform modules to their latest versions, run the following command from the root of the infrastructure directory:

```bash
terragrunt init -upgrade --terragrunt-working-dir ./terragrunt/<environment>/<module>
```

Replace `<environment>` and `<module>` with the appropriate values, such as `prod/backend-service-principal`.

For example:

```bash
terragrunt init -upgrade --terragrunt-working-dir ./terragrunt/prod/backend-service-principal
```

### Retrieving Outputs

After applying the infrastructure, you can retrieve the outputs, such as application secrets or client IDs, using the `terragrunt output` command.

```bash
# Example: Retrieve application secrets
terragrunt output app_secrets
```