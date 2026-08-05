# infrastructure/docker

Local dev services (Postgres, Redis) are defined in the root `docker-compose.yml`.

Production Dockerfiles for `apps/api` will be added in the CI/CD phase (Phase 12);
this directory is reserved for them so infra concerns stay out of `apps/api`.
