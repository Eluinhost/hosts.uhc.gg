FROM node:12-alpine AS old-calendar
RUN apk add git
RUN git clone --depth 1 https://github.com/Eluinhost/Match-Calendar.git
WORKDIR Match-Calendar
RUN yarn install --frozen-lockfile
RUN yarn build

FROM caddy:2.11.4-alpine
COPY --from=old-calendar /Match-Calendar/web /srv

