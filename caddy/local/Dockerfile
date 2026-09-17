FROM node:24-alpine AS frontend-build
WORKDIR /app

RUN corepack enable

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY frontend/ .

RUN pnpm build

FROM caddy:2.11.4-alpine

COPY --from=frontend-build /app/build /srv/hosts
COPY caddy/local/Caddyfile /etc/caddy/Caddyfile
COPY caddy/common.conf /etc/caddy/common.conf
