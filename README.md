### Frontend

All in `/frontend`

#### Install

```bash
yarn install
```

#### Build production

Builds optimised bundles to `/frontend/build` for the backend to serve

```bash
yarn build
```

#### Build dev 

Builds development bundles and listens for changes for recompilation. Runs on port 3000

```bash
yarn start
```

When running dev frontend make sure there is a server running on port 10000 (or modify src/setupProxy for actual port)

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

docker-compose sets up a postgres database and builds the FE + BE and exposes it on port 10000. Database files are stored in the `data` directory

`docker compose up --build`
