FROM node:16.16.0-alpine3.16 AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .
ARG API_DOMAIN API_PORT WS_PORT
ENV API_DOMAIN=$API_DOMAIN API_PORT=$API_PORT WS_PORT=$WS_PORT
RUN yarn build:web

FROM nginx
COPY --from=builder /app/web-build /usr/share/nginx/html