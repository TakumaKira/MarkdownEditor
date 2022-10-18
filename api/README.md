## How to generate secure enough API token

[How To Use JSON Web Tokens (JWTs) in Express.js _ DigitalOcean -- Step 1 — Generating a Token](https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs#step-1-generating-a-token)

> The token secret is a long random string used to encrypt and decrypt the data.
>
> To generate this secret, one option is to use Node.js’s built-in crypto library, like so:

```js
require('crypto').randomBytes(64).toString('hex')
// '09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611'
```

## Setup Gmail OAuth to send confirmation email

Please follow [this page](https://alexb72.medium.com/how-to-send-emails-using-a-nodemailer-gmail-and-oauth2-fe19d66451f9) to get your gmail OAuth ready and get and put `OAUTH_USER`(your gmail address) / `OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET` / `OAUTH_REFRESH_TOKEN` in /MarkdownEditor/api/.env file.
(You can store the downloaded client secret JSON named `client_secret_<your_client_id>.apps.googleusercontent.com.json` in /Markdown/api/ as it will be ignored by git;) ).

## How to run for development

Run `DATABASE_HOST=localhost MYSQL_DATABASE_USERNAME_FOR_APP=markdown_editor_app MYSQL_DATABASE_PASSWORD_FOR_APP=<your_password_for_app_to_communicate_database> MYSQL_DATABASE=markdown_editor API_PORT=3000 WS_PORT=3001 APP_PORT=19006 yarn dev`.

## How to build and run as a docker image

Run `docker build -t api .` from /MarkdownEditor/api to build image.
Then run

```bash
docker run \
-e ORIGIN=http://localhost \
-e API_PORT=3000 \
-e WS_PORT=3001 \
-e APP_PORT=19006 \
-e DATABASE_HOST=localhost \
-e MYSQL_DATABASE_USERNAME_FOR_APP=markdown_editor_app \
-e MYSQL_DATABASE_PASSWORD_FOR_APP=<your_password_for_app_to_communicate_database> \
-e MYSQL_DATABASE=markdown_editor \
-e JWT_SECRET_KEY=<your_jwt_secret_key> \
-e OAUTH_USER=<your_oAuth_user> \
-e OAUTH_CLIENT_ID=<your_oAuth_client_id> \
-e OAUTH_CLIENT_SECRET=<your_oAuth_client_secret> \
-e OAUTH_REFRESH_TOKEN=<your_oAuth_refresh_token> \
api
```

(you can change any in relation with frontend/database) to start container with required environment variables.
