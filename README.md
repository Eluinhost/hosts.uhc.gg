### Frontend

All in `/frontend`

#### Setup 

`nvm use` - installs required node version
`corepack enable` - required for pnpm

#### Install

```bash
pnpm install
```

#### Build production

Builds optimised bundles to `/frontend/build` for the backend to serve

```bash
pnpm build
```

#### Build dev 

Builds development bundles and listens for changes for recompilation. Runs on port 3000

```bash
pnpm start
```

When running dev frontend make sure there is a server running on port 10000 (or modify the `server.proxy` target in frontend/vite.config.mjs for actual port)

### Backend

#### Build production zip

Make sure to run the frontend build first to have latest assets in the zip

With SBT:
```sbtshell
;clean;universal:packageBin
```

Zip can be found in `/target/universal`

When unpackaged an `application.conf` must be created in the `/conf` folder using `reference.conf` as an example.

All keys are optional and `reference.conf` shows you what values they will fallback to.

#### Development

Watches for backend changes are re-compiles + re-starts the server.

Make sure to make an `application.conf` in the `/conf` folder.

With SBT:
```sbtshell
~re-start
```

Alternatively use `re-start` and `re-stop` to manually start/stop the backend server and not listen for changes

# Docker

Create application.conf in main folder using reference.conf if required, minimum should be:

```
reddit {
  clientId = "<>"
  clientSecret = "<>"
  redirectUri = "http://localhost:10000/authenticate/callback"
}
jwt {
  secret = "CHANGE ME CHANGE ME CHANGE ME CHANGE ME CHANGE ME CHANGE ME CHANGE ME CHANGE ME CHANGE ME CHANGE ME CHANGE ME CHANGE ME"
}
```

By default `docker compose up` will spin up a Caddy server on port 80 without hot reloading.

If frontend hot reloading is required, copy the relevant section from `docker-compose.override.examples.yml` to `docker-compose.override.yml`,
this assumes you are running `pnpm start` in the frontend directory outside of docker.

Database files are stored in the `data` directory
