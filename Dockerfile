FROM node:12-slim AS frontend-build
WORKDIR /app

COPY frontend/package.json frontend/yarn.lock ./

RUN yarn install --frozen-lockfile

COPY frontend/ .

RUN yarn run build

FROM eclipse-temurin:17-jdk AS backend-build
WORKDIR /app

COPY project/ ./project/
COPY build.sbt .
RUN apt-get update && apt-get install apt-transport-https curl gnupg -yqq && \
    echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | tee /etc/apt/sources.list.d/sbt.list &&  \
    echo "deb https://repo.scala-sbt.org/scalasbt/debian /" | tee /etc/apt/sources.list.d/sbt_old.list && \
    curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | gpg --no-default-keyring --keyring gnupg-ring:/etc/apt/trusted.gpg.d/scalasbt-release.gpg --import && \
    chmod 644 /etc/apt/trusted.gpg.d/scalasbt-release.gpg && \
    apt-get update && \
    apt-get install sbt=1.12.1 -yqq && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY src/ ./src/

RUN sbt universal:stage

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=backend-build /app/target/universal/stage /app
COPY --from=frontend-build /app/build /app/frontend/build
COPY application.conf /app/conf/application.conf

EXPOSE 10000

ENTRYPOINT ["bin/hosts"]
