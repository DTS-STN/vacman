# CI Pipelines

## Overview

This subproject contains TeamCity pipeline configurations written in Kotlin DSL.
These files define the build, test, and deployment jobs for the Vacman project
across different environments.

The pipelines are organized into subdirectories based on the component (backend,
frontend, gitops) and environment (nonprod, prod). Each directory contains
Kotlin files that specify the TeamCity jobs, such as building container images,
running tests, publishing artifacts, and deploying to various stages.

## Purpose

**THESE FILES ARE MAINTAINED FOR INFORMATIONAL PURPOSES ONLY.** They serve as a
reference and backup in case the TeamCity pipelines need to be recreated or
modified manually.

**Important notes:**

- These files are **NOT** synchronized with TeamCity in any way.
- Editing these files will **NOT** affect the actual pipelines running in TeamCity.
- Changes to TeamCity pipelines should be made directly in the TeamCity
  interface or through its API, **NOT** these .kt files.

## Structure

- **`backend/`:** pipelines for the backend component
  - **`nonprod/`:** non-production pipelines (e.g., development, integration, UAT)
  - **`prod/`:** production pipelines
- **`frontend/`:** pipelines for the frontend component
  - **`nonprod/`:** non-production pipelines
  - **`prod/`:** production pipelines
- **`gitops/`:** pipelines for GitOps deployments
  - **`nonprod/`:** non-production GitOps pipelines
  - **`prod/`:** production GitOps pipelines

## Recreating Pipelines

If you need to recreate a pipeline in TeamCity, use these Kotlin files as a
reference. Copy the relevant code into TeamCity's DSL configuration or recreate
the jobs manually based on the definitions here.
