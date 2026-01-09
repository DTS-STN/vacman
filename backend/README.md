# VacMan API

## Overview

The main API for the VacMan (Vacancy Management) application.

## Technology Stack

- **Java:** 21
- **Spring Boot:** 3.5.x
- **Build Tool:** Maven
- **Database:**
  - H2 (for local development and testing)
  - Microsoft SQL Server (for production)
- **Database Migrations:** Liquibase
- **Security:** Spring Security with OAuth2
- **API Documentation:** Springdoc OpenAPI (Swagger UI)
- **Caching:** Caffeine

## Getting Started

### Prerequisites

*   Java 21
*   Maven

### Running the Application Locally

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:STN-DTS/vacman.git
    cd vacman/backend/
    ```

2.  **Create a local configuration file:** Copy the example local configuration file to create your own:
    ```bash
    cp src/main/resources/application-local.yaml.example src/main/resources/application-local.yaml
    ```
    ⚠️ Modify `src/main/resources/application-local.yaml` with your local database credentials (if applicable) and any other
    necessary configuration. This file is ignored by Git, so your credentials will not be committed.

3.  **Build and run the application:** You can run the application using the Spring Boot Maven plugin:
    ```bash
    mvn spring-boot:run
    ```
    The application will be available at `http://localhost:8080`.

## API Documentation

The API documentation is generated using Springdoc OpenAPI and is available at `http://localhost:8080/swagger-ui/index.html`
when the application is running.

## Building for Production

This project uses ['CI friendly'](https://maven.apache.org/maven-ci-friendly.html) versioning. To build this project with a
non-trivial version string, use the following command:

```bash
mvn --define revision={version} clean package
```

This will create a file in the `target/` directory named `vacman-api-{version}.jar`.

To build a container image, use the following command:

```bash
mvn --define revision={version} --define image.name=localhost/vacman-api spring-boot:build-image
```

## Dependency Management

To check for dependency updates, use the following command:

```bash
mvn versions:display-property-updates
```
