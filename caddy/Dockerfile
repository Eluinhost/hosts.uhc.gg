FROM node:12-alpine AS old-calendar
RUN apk add git
RUN git clone --depth 1 https://github.com/Eluinhost/Match-Calendar.git
WORKDIR Match-Calendar
RUN yarn install --frozen-lockfile
RUN yarn build

FROM caddy:builder AS builder
RUN xcaddy build --with github.com/caddy-dns/porkbun

FROM caddy:2.11.4-alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
COPY --from=old-calendar /Match-Calendar/web /srv
