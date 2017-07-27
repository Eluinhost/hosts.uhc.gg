### Frontend

All in `/frontend`

#### Install

```bash
yarn install
```

#### Build production

Builds optimised bundles to `/assets` for the backend to serve

```bash
yarn build
```

#### Build dev 

Builds development bundles and listens for changes for recompilation. Builds to `/assets` for backend to serve

```bash
yarn dev
```

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