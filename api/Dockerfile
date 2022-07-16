FROM node:16.16.0-alpine3.16

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn
COPY . .

EXPOSE 19007
