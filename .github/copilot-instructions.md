# Copilot instructions for DTS-STN/vacman

Multi-app workspace:
- backend (Java 21, Spring Boot 3.5) — REST API, OAuth2 resource server (Entra ID), Liquibase
- frontend (TS, React Router v7 SSR on Express 5, Vite, Vitest/Playwright, Tailwind)
- support (Node 22) — CLI for Microsoft Graph
- gitops (Kustomize) and infrastructure (Terraform/Terragrunt)

## Architecture & flow
- Browser → frontend (Express SSR + React Router loaders/actions).
  - Env validated with valibot in `app/.server/environment/**`.
  - Backend calls centralized in `app/.server/domain/services/api-client.ts` returning `Result<Ok|Err, AppError>`.
- Frontend → backend JSON API under `/api/v1/**`.
  - Resource server expects Entra ID JWT; `roles` claim → authorities; audience = API client-id.
  - Controllers in `.../web/*Controller.java` use `@PreAuthorize`, DTOs in `web/model/**`, mappers in `web/model/mapper/**`.
- DB via Liquibase (`backend/src/main/resources/db/changelog/**`); H2 local/test, MSSQL in envs.

## Conventions
- Frontend
  - Use `apiClient.get/post/put/delete(path, context, token?)`; always provide a human-readable context string.
  - Return/handle `Result` (oxide.ts) and `AppError` (`app/errors/app-error.ts`).
  - Feature flags (`features.ts`) toggle mock services in `shared/mock-lookup-service-implementation.ts`.
  - Express v5 routing uses `app.all('*splat', rrRequestHandler(...))`.
- Backend
  - Security in `WebSecurityConfig`: `/api/**` requires JWT; annotate endpoints e.g., `@PreAuthorize("hasAuthority('hr-advisor')")`.
  - Keep entities in `data/entity/**`, repos in `data/repository/**`; map to DTOs via MapStruct.

## Local workflows
- Frontend (Node ≥22, pnpm ≥10): `pnpm install` → `pnpm dev` (HMR via `nodemon.json`), tests `pnpm test` / `pnpm test:e2e`, build `pnpm build`, preview `pnpm preview`.
- Backend (Java 21, Maven): copy `application-local.yaml.example` → `application-local.yaml`, run `mvn spring-boot:run` (Swagger at `/swagger-ui/index.html`), package `mvn -D revision=x clean package`.
- Support: configure `.env` (see `support/README.md`), run `pnpm group-sync`.

## Integration notes
- Frontend base URL `VACMAN_API_BASE_URI` (default `http://localhost:8080/api/v1/`) — set in `.env`.
- Sessions via `express-session`; Redis supported when `SESSION_TYPE=redis`.
- OpenTelemetry wired in both apps; endpoints configurable via env.

## Gotchas
- Express v5 path syntax uses `*splat`.
- Hibernate naming strategy fixed to `PhysicalNamingStrategyStandardImpl` (matches Liquibase).
- `only-allow pnpm` enforced in frontend.
