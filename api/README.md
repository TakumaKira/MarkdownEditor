# Markdown Editor api

This directory is api for [Markdown Editor](../README.md).

## Table of contents

- [Markdown Editor api](#markdown-editor-api)
  - [Table of contents](#table-of-contents)
  - [What will be explained here](#what-will-be-explained-here)
  - [Run API server](#run-api-server)
    - [How to generate secure enough API token](#how-to-generate-secure-enough-api-token)
    - [Using your email account](#using-your-email-account)
    - [Using your SendGrid account](#using-your-sendgrid-account)
    - [Using your Gmail account](#using-your-gmail-account)
  - [Run tests](#run-tests)

## What will be explained here

If you just want to see how this project works as a full stack project and don't want to change any code, [running everything on kubernetes](/README.md#run-everything-on-kubernetes) or [running everything on docker](/README.md#run-everything-on-docker) is way easier, so please check respective links.
I'll go through how to run and test api mainly for development.

## Run API server

Run API server with any of the following command inside this directory.
*When you run this for the first time, you need to run ``yarn install`` first to install dependencies.*
*These command will enable hot reload, so you can try to edit anywhere in the code.*

This app needs mail server to send confirmation emails to user's registered address, that is, if you sign up new account on frontend running at `http://<your-local-ip-address>:19006`, API server will send email to the new account email address using provided mail server information. You have 3 options to set it properly.

### How to generate secure enough API token

To run API server, you need secret key for JSON web token to be verified at API server. You can use simple strings, but better prepare more complex one especially on production environment.
Just run ``node generateToken.js`` and this script generates and display something like `09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611` for you.

### Using your email account

With this option, API server simply uses your email account.

```sh
API_PORT=3000 \
WS_PORT=3001 \
FRONTEND_DOMAIN=<your-local-ip-address> \
FRONTEND_PORT=19006 \
JWT_SECRET_KEY=<secret-key-for-api-to-verify-json-web-tokens> \
DATABASE_HOST=localhost \
MYSQL_DATABASE=markdown_db \
MYSQL_PORT=3306 \
MYSQL_USER=markdown_api \
MYSQL_PASSWORD=<password-for-api-as-a-database-user> \
REDIS_HOST=localhost \
REDIS_PORT=6379 \
REDIS_USER=markdown_api \
REDIS_PASSWORD=<password-for-api-as-a-redis-user> \
SENDER_EMAIL=<your-email-address-to-send-confirmation-emails@your-email-service-provider.com> \
CONFIRMATION_EMAIL_SERVER_TYPE=StandardMailServer \
STANDARD_MAIL_SERVER_HOST=<your-email-service-provider.com> \
STANDARD_MAIL_SERVER_USER=<your-email-user-name> \
STANDARD_MAIL_SERVER_PASS=<your-email-user-password> \
yarn dev
```

### Using your SendGrid account

With this option, [SendGrid](https://sendgrid.com/) email server sends confirmation emails. You need to get API key from your SendGrid account. With SendGrid, you can check whether the mail opened by recipient, whether the link clicked and other great statistics it provides. It provides [free tier](https://sendgrid.com/pricing/) so it worth trying.

```sh
API_PORT=3000 \
WS_PORT=3001 \
FRONTEND_DOMAIN=<your-local-ip-address> \
FRONTEND_PORT=19006 \
JWT_SECRET_KEY=<secret-key-for-api-to-verify-json-web-tokens> \
DATABASE_HOST=localhost \
MYSQL_DATABASE=markdown_db \
MYSQL_PORT=3306 \
MYSQL_USER=markdown_api \
MYSQL_PASSWORD=<password-for-api-as-a-database-user> \
REDIS_HOST=localhost \
REDIS_PORT=6379 \
REDIS_USER=markdown_api \
REDIS_PASSWORD=<password-for-api-as-a-redis-user> \
SENDER_EMAIL=<your-email-address-to-send-confirmation-emails@your-email-service-provider.com> \
CONFIRMATION_EMAIL_SERVER_TYPE=SendGrid \
SENDGRID_API_KEY=<your_sendgrid_api_key> \
yarn dev
```

### Using your Gmail account

With this option, API server sends emails using Gmail server through OAuth authentication. You need to get OAuth tokens to use this option. Please follow [this page](https://alexb72.medium.com/how-to-send-emails-using-a-nodemailer-gmail-and-oauth2-fe19d66451f9) to get your gmail OAuth ready and get the following values: `OAUTH_USER`(your gmail address) / `OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET` / `OAUTH_REFRESH_TOKEN`. *Gmail will overwrite sender of the emails.*

```sh
API_PORT=3000 \
WS_PORT=3001 \
FRONTEND_DOMAIN=<your-local-ip-address> \
FRONTEND_PORT=19006 \
JWT_SECRET_KEY=<secret-key-for-api-to-verify-json-web-tokens> \
DATABASE_HOST=localhost \
MYSQL_DATABASE=markdown_db \
MYSQL_PORT=3306 \
MYSQL_USER=markdown_api \
MYSQL_PASSWORD=<password-for-api-as-a-database-user> \
REDIS_HOST=localhost \
REDIS_PORT=6379 \
REDIS_USER=markdown_api \
REDIS_PASSWORD=<password-for-api-as-a-redis-user> \
SENDER_EMAIL=<your-email-address-to-send-confirmation-emails@your-email-service-provider.com> \
CONFIRMATION_EMAIL_SERVER_TYPE=Gmail \
OAUTH_USER=<your_oAuth_user> \
OAUTH_CLIENT_ID=<your_oAuth_client_id> \
OAUTH_CLIENT_SECRET=<your_oAuth_client_secret> \
OAUTH_REFRESH_TOKEN=<your_oAuth_refresh_token> \
yarn dev
```

## Run tests

Some tests use testing database, so running ``yarn test`` will **not** pass.
To run tests including integration tests with testing database container, run:

```sh
docker container prune -f && \
docker volume prune -f && \
docker compose -f docker-compose.test.yml -p api-test up --abort-on-container-exit --build
```
