FROM node:16.18-alpine3.16 AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .

RUN yarn test:ci

ARG USE_SECURE_PROTOCOL API_DOMAIN API_PORT WS_PORT WEB_VERSION_URL
ENV USE_SECURE_PROTOCOL=$USE_SECURE_PROTOCOL API_DOMAIN=$API_DOMAIN API_PORT=$API_PORT WS_PORT=$WS_PORT WEB_VERSION_URL=$WEB_VERSION_URL
RUN yarn build:web

FROM nginx
COPY --from=builder /app/web-build /usr/share/nginx/html