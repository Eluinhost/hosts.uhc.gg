FROM node:24-alpine AS frontend-build
WORKDIR /app

RUN corepack enable

COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY frontend/ .

RUN pnpm build

FROM node:12-alpine AS old-calendar
RUN apk add git
RUN git clone --depth 1 https://github.com/Eluinhost/Match-Calendar.git
WORKDIR Match-Calendar
RUN yarn install --frozen-lockfile
RUN yarn build

####
## Caddy environment builds
####

FROM caddy:builder AS builder
RUN xcaddy build --with github.com/caddy-dns/porkbun

# Local dev-server, assumes host is running vite dev server, no old calendar
FROM caddy:2.11.4-alpine AS vite
COPY caddy/Caddyfile.vite /etc/caddy/Caddyfile
COPY caddy/common.conf /etc/caddy/common.conf

# Local dev, uses static frontend assets on localhost, no old calendar
FROM caddy:2.11.4-alpine AS local
COPY --from=frontend-build /app/build /srv/hosts
COPY caddy/Caddyfile.local /etc/caddy/Caddyfile
COPY caddy/common.conf /etc/caddy/common.conf

# Prod, uses static frontend assets on prod domains, includes old calendar on c.uhc.gg
FROM caddy:2.11.4-alpine AS prod
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
COPY --from=old-calendar /Match-Calendar/web /srv/old
COPY --from=frontend-build /app/build /srv/hosts
COPY caddy/Caddyfile.prod /etc/caddy/Caddyfile
COPY caddy/common.conf /etc/caddy/common.conf
