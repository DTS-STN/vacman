# VacMan (Vacancy Management)

A comprehensive solution for managing vacancies within an organization, built as
a full-stack application with modern technologies and infrastructure-as-code
practices.

## Overview

VacMan provides a web-based interface for managing job vacancies, integrated
with organizational identity systems. The solution consists of multiple
components working together to deliver a secure, scalable, and maintainable
vacancy management system.

## Architecture & Components

This monorepo contains the following subprojects:

### Backend (`backend/`)

The main API service built with Spring Boot 3.5.x and Java 21.

- **Technology Stack:** Spring Boot, JPA, Liquibase, OAuth2, H2/SQL Server,
  Caffeine caching
- **Features:** REST API, database migrations, security with OAuth2, OpenAPI
  documentation
- **Purpose:** Handles business logic, data persistence, and API endpoints for
  vacancy management

### Frontend (`frontend/`)

A modern React application with server-side rendering.

- **Technology Stack:** React Router, TypeScript, Tailwind CSS, Vite, Express
- **Features:** SSR, HMR, internationalization, OAuth integration, responsive UI
- **Purpose:** Provides the user interface for interacting with vacancy data

### Infrastructure (`infrastructure/`)

Infrastructure-as-code for cloud resources using Terraform and Terragrunt.

- **Technology Stack:** Terraform, Terragrunt, Azure CLI
- **Features:** Entra ID application setup, service principals, RBAC,
  environment-specific configurations
- **Purpose:** Manages identity and access management resources in Microsoft
  Azure

### GitOps (`gitops/`)

Kubernetes manifests and deployment configurations.

- **Technology Stack:** Kustomize, Kubernetes
- **Features:** Multi-environment deployments (nonprod/prod), Redis, ingress
  configurations
- **Purpose:** Defines and manages the deployment of VacMan components to
  Kubernetes clusters

### Support (`support/`)

Utility tools and scripts for maintaining the VacMan ecosystem.

- **Technology Stack:** TypeScript, Effect, Node.js
- **Features:** Group synchronization utility for Entra ID, batch processing,
  dry-run mode
- **Purpose:** Provides operational support tools for identity management and
  system maintenance

## Getting Started

### Prerequisites

- **Java 21** (for backend)
- **Node.js 24+** and **pnpm 10+** (for frontend and support)
- **Azure CLI 2.60+** (for infrastructure)
- **Terraform 1.10+** and **Terragrunt 0.65+** (for infrastructure)
- **Docker/Podman** (for containerized deployments)

### Quick Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/DTS-STN/vacman.git
   cd vacman
   ```

2. **Set up the backend:**

   ```bash
   cd backend
   cp src/main/resources/application-local.yaml.example src/main/resources/application-local.yaml
   # Edit application-local.yaml with your local config
   mvn spring-boot:run
   ```

3. **Set up the frontend:**

   ```bash
   cd ../frontend
   pnpm install
   pnpm dev
   ```

4. **Configure infrastructure (if deploying):**

   ```bash
   cd ../infrastructure
   az login
   cd terragrunt/nonprod/backend-service-principal
   terragrunt init
   terragrunt plan
   ```

## Development

Each subproject has its own development setup. Refer to the individual READMEs
in each directory for detailed instructions:

- [Backend Development](backend/README.md)
- [Frontend Development](frontend/README.md)
- [Infrastructure Setup](infrastructure/README.md)
- [Support Tools](support/README.md)

### Common Development Tasks

- **Building all components:** Run build scripts in each subproject
- **Running tests:** Use `mvn test` (backend), `pnpm test` (frontend/support)
- **Linting:** Use `pnpm lint:check` and `pnpm format:check` where applicable

## Deployment

### Containerized Deployment

Each component can be containerized:

- **Backend:** `mvn spring-boot:build-image` (produces OCI image)
- **Frontend:** `docker build -f containerfile .` (or podman)

### Kubernetes Deployment

Use the GitOps configurations in `gitops/` for deploying to Kubernetes clusters.
The setup includes:

- Multi-environment support (dev, int, uat, prod)
- Redis for session management
- Ingress configurations for external access
- Horizontal Pod Autoscalers (HPAs)

### Cloud Deployment

The infrastructure component sets up necessary Azure resources, and the
application can be deployed to various cloud platforms supporting containers.

## Contributing

1. Fork the repository
2. Create a feature branch from `development`
3. Make your changes following the established patterns in each subproject
4. Ensure tests pass and code is linted
5. Submit a pull request targeting the `development` branch

## License

This project is licensed under the MIT License - see individual component
licenses for details.

## Support

For issues and questions:

- Check individual component READMEs
- Review the `support/` directory for operational tools
- Contact the development team for assistance
