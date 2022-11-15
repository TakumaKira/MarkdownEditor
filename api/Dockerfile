FROM node:16.18.0-alpine3.16 AS builder

WORKDIR /app
COPY package.json yarn.lock ./


FROM builder AS test

# Dockerize is needed to sync test database container startup
RUN apk add --no-cache openssl
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN yarn install --frozen-lockfile
COPY . .


FROM builder AS prod
RUN yarn install --frozen-lockfile --production
COPY . .
CMD yarn start