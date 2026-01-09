# Vacman Support

This project contains support software for the Vacancy Management (Vacman)
solution. The primary tool in this repository is a group synchronization utility
for Microsoft Entra ID (formerly Azure Active Directory).

## Group synchronization utility

This utility synchronizes the membership of a target Entra ID group with the
members of one or more source Entra ID groups. It is designed to be run as a
scheduled task or on-demand to ensure that the target group's membership is
always up-to-date.

### Features

* **Transitive membership sync:**
  The utility can sync all members of the source groups, including members of
  nested groups (transitive members).
* **Dry run mode:**
  A dry run mode is available to preview the changes that will be made without
  actually modifying the target group. This is useful for testing and auditing
  purposes.
* **Efficient batch processing:**
  The utility uses batch processing to efficiently add and remove members from
  the target group, minimizing the number of API calls to the Microsoft Graph
  API.
* **Configuration via environment variables:**
  All configuration is done through environment variables, making it easy to
  configure the utility for different environments.

### How it works

The utility performs the following steps:

1. **Authentication:**
   Authenticates with the Microsoft Graph API using the provided client
   credentials.
1. **Fetch source group members:**
   Fetches all transitive members of the source groups.
1. **Fetch target group members:**
   Fetches all direct members of the target group.
1. **Calculate membership changes:**
   Compares the source and target group members to determine which users need to
   be added or removed from the target group.
1. **Execute changes:**
   Adds or removes the necessary users from the target group. If dry run mode is
   enabled, the utility will only log the changes that would be made.

### Prerequisites

* Node.js (version 24.x or higher)
* pnpm (version 10.x or higher)
* A Microsoft Entra ID application registration with the following API
  permissions:
  * `GroupMember.Read.All`
  * Ownership of the target security group

### Installation

1. Clone the repository:

    ``` bash
    git clone https://github.com/stn-dts/vacman.git
    ```

1. Navigate to the `support` directory:

    ``` bash
    cd vacman/support
    ```

1.  Install the dependencies:

    ``` bash
    pnpm install
    ```

### Configuration

The utility is configured using environment variables. Create a `.env` file in
the `support` directory with the following variables:

``` bash
# .env

# (Optional) Set to "false" to execute the changes. Defaults to "true" (dry run).
DRY_RUN=true

# (Optional) The log level. Defaults to "info".
# Possible values: "trace", "debug", "info", "warn", "error", "fatal"
LOG_LEVEL=info

# The Entra ID tenant ID
TENANT_ID=your-tenant-id

# The client ID of the Entra ID application registration
CLIENT_ID=your-client-id

# The client secret of the Entra ID application registration
CLIENT_SECRET=your-client-secret

# A comma-separated list of the source group IDs
SOURCE_GROUP_IDS=source-group-id-1,source-group-id-2

# The target group ID
TARGET_GROUP_ID=target-group-id
```

### Usage

To run the group synchronization utility, use the following command:

``` bash
pnpm group-sync
```

To run in debug mode, use the following command:

``` bash
pnpm group-sync:debug
```

### Development

#### Running Tests

To run the tests, use the following command:

``` bash
pnpm test
```

To run the tests with coverage, use the following command:

``` bash
pnpm test:coverage
```

#### Linting and Formatting

To check for linting errors, use the following command:

``` bash
pnpm lint:check
```

To fix linting errors, use the following command:

``` bash
pnpm lint:fix
```

To check for formatting errors, use the following command:

``` bash
pnpm format:check
```

To fix formatting errors, use the following command:

``` bash
pnpm format:write
```

#### Type Checking

To check for TypeScript errors, use the following command:

``` bash
pnpm typecheck
```
