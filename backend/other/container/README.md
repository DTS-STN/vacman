# Purpose

This folder contains helper artifacts for running a local containerized SQL
Server for development and initialising the `vacman` database.

## Files

- `compose.yaml` - docker-compose / podman-compose file that starts an `mssql`
  service and an initialization job (`db-init`).
- `init-db.sh` - waits for the SQL Server to become ready and runs `init.sql`
  using `sqlcmd`.
- `init.sql` - idempotent SQL that creates the `vacman` database, users, and
  roles (for development).

## Quick Start

1. Start the services (Docker):

   ```bash
   docker compose -f compose.yaml up -d
   ```

   If using Podman with compose support:

   ```bash
   podman compose -f compose.yaml up -d
   ```

# Notes & Recommendations

- Ports: The compose file maps host port `1433` by default. Change this if you
  have a local SQL Server instance.
- Production: These artifacts are intended for local development only. For
  production, use proper secret management, stronger passwords, and
  least-privilege roles.
