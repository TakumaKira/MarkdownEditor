# Frontend Mentor - In-browser markdown editor solution

[![MarkdownEditor](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/simple/fidmw8/master&style=flat-square&logo=cypress)](https://cloud.cypress.io/projects/fidmw8/runs)

This is a full-stack solution to the [In-browser markdown editor challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/inbrowser-markdown-editor-r16TrrQX9). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Frontend Mentor - In-browser markdown editor solution](#frontend-mentor---in-browser-markdown-editor-solution)
  - [Table of contents](#table-of-contents)
  - [Overview](#overview)
    - [The challenge](#the-challenge)
    - [Screenshot](#screenshot)
    - [Links](#links)
  - [My process](#my-process)
    - [Built with](#built-with)
    - [What I learned](#what-i-learned)
    - [Continued development](#continued-development)
    - [Useful resources](#useful-resources)
  - [Author](#author)
  - [How to run my solution](#how-to-run-my-solution)
    - [Please give .sh files permission](#please-give-sh-files-permission)
    - [Run using kubernetes](#run-using-kubernetes)
      - [Prerequisites for running kubernetes](#prerequisites-for-running-kubernetes)
      - [Prepare secrets for kubernetes containers](#prepare-secrets-for-kubernetes-containers)
      - [Run everything on kubernetes](#run-everything-on-kubernetes)
      - [How I prepared kubernetes manifest files](#how-i-prepared-kubernetes-manifest-files)
    - [Run using docker](#run-using-docker)
      - [Prerequisites for running docker](#prerequisites-for-running-docker)
      - [Prepare env file storing secrets](#prepare-env-file-storing-secrets)
      - [Run everything on docker](#run-everything-on-docker)
    - [Run for development](#run-for-development)
      - [Run database](#run-database)
      - [Run API server](#run-api-server)
      - [Run frontend](#run-frontend)
        - [With Storybook and Expo dev tools](#with-storybook-and-expo-dev-tools)
        - [With Storybook and without Expo dev tools](#with-storybook-and-without-expo-dev-tools)
        - [Without Storybook and with Expo dev tools](#without-storybook-and-with-expo-dev-tools)
        - [Without Storybook and Expo dev tools](#without-storybook-and-expo-dev-tools)
    - [Run E2E testing](#run-e2e-testing)

## Overview

### The challenge

Users should be able to:

- Create, Read, Update, and Delete markdown documents
- Name and save documents to be accessed as needed
- Edit the markdown of a document and see the formatted preview of the content
- View a full-page preview of the formatted content
- View the optimal layout for the app depending on their device's screen size
- See hover states for all interactive elements on the page
- **Bonus**: If you're building a purely front-end project, use localStorage to save the current state in the browser that persists when the browser is refreshed
- **Bonus**: Build this project as a full-stack application

### Screenshot

![](./preview.jpg)
<!-- ![](./screenshot.jpg) TODO: Switch from preview.jpg above to this line when I got my own screenshot.jpg -->

### Links

- Solution URL: [Frontend Mentor](https://www.frontendmentor.io/challenges/inbrowser-markdown-editor-r16TrrQX9/hub/inbrowser-markdown-editor-HkEJ07cE9)
- Live Site URL: [Vercel](https://markdown-editor-git-master-takumakira.vercel.app/)

## My process

### Built with

- [React](https://reactjs.org/) - JS library
- [React Native](https://reactnative.dev/) - React framework for building native mobile apps
- [Expo](https://docs.expo.dev/) - React Native framework
- [Storybook](https://storybook.js.org/) - For Component Driven Development and visual testing
- [Jest](https://jestjs.io/) - For unit testing

### What I learned

- I needed to chose frameworks carefully to realize the most suitable development environment for this project.
- Basically, I wanted to build this as web app, but also as mobile apps. So I saw Flutter, React Native and React Native using Expo. I wanted to experience React Native more for now, and whole setup things of pure React Native was not my current point. Besides, it was plus for this that there were more documents for using Storybook with Expo.

### Continued development

- I tried to using [Chromatic](https://www.chromatic.com/) for getting visual difference of the Storybook of each development, but it looked not to support React Native for now.

### Useful resources

- [Setting up Storybook for React Native/TypeScript](https://dev.to/risafj/setting-up-storybook-for-react-native-typescript-server-loader-ios-android-3b0i) - Setting up Storybook correctly was the most challenging part of the setup phase of this project. This explains how to see the stories with Expo project which other explanations left off(I needed to conditionally export ``StorybookUIRoot`` as App root).

## Author

- Website - [TakumaKira@Github](https://github.com/TakumaKira)
- Frontend Mentor - [@TakumaKira](https://www.frontendmentor.io/profile/TakumaKira)

## How to run my solution

If you want to deploy this to [Google Cloud Platform](https://cloud.google.com), please see [How to deploy this to GCP](./how-to-deploy-this-to-GCP.md).

### Please give .sh files permission

When you try to run this project, you might encounter error messages like ``permission denied: ./some-shell-script.sh``, which I prepared mostly for initializing database. In such a case, please run ``chmod +x ./some-shell-script.sh`` to give the permission it needs to run.

### Run using kubernetes

#### Prerequisites for running kubernetes

If you are willing to run this on local kubernetes, please make sure you installed [Skaffold](https://skaffold.dev/docs/install/#standalone-binary).(I'm not sure if the install takes care, but it definitely requires tools like [kubectl](https://kubernetes.io/docs/tasks/tools/), [minikube](https://minikube.sigs.k8s.io/docs/start/) and [Docker](https://www.docker.com/) to run kubernetes project on your machine. Skaffold just orchestrates multiple tasks on a single command as declaration files I prepared in `/k8s-manifests`.)(trivia: I googled that '8' is 'ubernete' in Greek so 'kubernetes' often call 'k8s'...)
If you had installed and used them before, you may still need to start docker and then minikube with command like ``minikube start``.

#### Prepare secrets for kubernetes containers

When your machine are ready to run kubernetes projects, you need 2 steps to go to run this.

First, setting up secrets for api and db.

For db, please run below:

```sh
kubectl create secret generic db-secret \
  --from-literal=MYSQL_ROOT_PASSWORD=<password-for-root-user-of-your-local-mysql-container> \
  --from-literal=MYSQL_PASSWORD=<password-for-app-as-a-database-user>
```

And below is for api:

```sh
kubectl create secret generic api-secret \
  --from-literal=JWT_SECRET_KEY=<secret-key-for-api-to-verify-json-web-tokens> \
  --from-literal=MYSQL_PASSWORD=<password-for-app-as-a-database-user> \
  --from-literal=SENDER_EMAIL=<your-email-address-to-send-confirmation-emails@your-email-service-provider.com> \
  --from-literal=CONFIRMATION_EMAIL_SERVER_TYPE=StandardMailServer \
  --from-literal=STANDARD_MAIL_SERVER_HOST=<your-email-service-provider.com> \
  --from-literal=STANDARD_MAIL_SERVER_USER=<your-email-user-name> \
  --from-literal=STANDARD_MAIL_SERVER_PASS=<your-email-user-password>
```

These values will be provided to each container.

#### Run everything on kubernetes

Then, just run ``skaffold dev --port-forward`` and your terminal will tell you the addresses you can access(like `http://localhost:4503` for frontend).

*I used [Cloud Code Extension for VSCode](https://marketplace.visualstudio.com/items?itemName=GoogleCloudTools.cloudcode), which is really great for inspecting running kubernetes, but using Skaffold CLI was stable in my case, so I mostly use Cloud Code Extension for debugging(it can inspect even if you run it from Skaffold CLI).*

*This skaffold.yaml configuration includes only unit tests for frontend, so you need to run database initialization scripts tests manually whenever modified(See [/db/README.md](./db/README.md)) and make sure including api testing step on your CI/CD(See [How to deploy this to GCP](./how-to-deploy-this-to-GCP.md)).*

#### How I prepared kubernetes manifest files

I used [kompose](https://kompose.io/) to generate the base of kubernetes configuration files from `docker-compose.yaml` in this directory. If you want to try this step, follow the instruction below.

Run ``kompose convert`` to generate yaml files to apply to Kubernetes.
If you check the diff between its result and what `k8s-manifests` directory has, you can see some modifications I applied. I'm not going to explain every one of them, but point out what I wanted to do.

- Modified how to reference environment variables, which contains configurations and secrets. I modified it as it reads configurations from `api-configmap`, expects `db-secret` and `api-secret`(mentioned above) are generated adequately beforehand and uses database initialization scripts through `ConfigMap`.
- Added ``spec.type: loadbalancer`` to all `*-service.yaml` files to allow access to containers.
- Some renames.

### Run using docker

#### Prerequisites for running docker

You just need to install [Docker](https://www.docker.com/)

#### Prepare env file storing secrets

`docker-compose.yaml` will read `*.env` files containing secrets. I prepared template files so you just fill them out with your own values. Please remove `.template` from `docker-compose-api-secrets.template.env` and `docker-compose-db-secrets.template.env`(then these files will not be tracked by git as written in `.gitignore`), and fill out the values inside to your own.

#### Run everything on docker

When you finished preparing `docker-compose-api-secrets.env` and  `docker-compose-db-secrets.env` as mentioned above, then just run ``docker compose -p markdown up --build`` and docker will build images from resources(this command will take a few minutes for the first build) and run everything work together.

### Run for development

If you want to make a change on this project, running every part in development setting would be fastest to make sure the change will work as a whole. Below are the commands for each part.

#### Run database

You can choose from running docker container from [mysql official docker image](https://hub.docker.com/_/mysql) or standalone [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) inside `/db` directory,

To run it on docker,

``docker compose -p markdown-dev-db up``(using docker compose)

or

``MYSQL_CONTAINER_NAME=db-dev MYSQL_ROOT_PASSWORD=root-password MYSQL_PASSWORD=password ./init-docker.sh``(without docker compose)

will start a container with setting up database for this project.

To use MySQL Community Server, start your mysql local server, and to set up database, run:

```sh
MYSQL_ROOT_PASSWORD=<your-mysql-local-server-root-password> MYSQL_PASSWORD=password ./init.sh
```

#### Run API server

Run API server with the following command inside `/api` directory.
*When you run this for the first time, you need to run ``yarn install`` first to install dependencies.*

```sh
API_PORT=3000 \
WS_PORT=3001 \
FRONTEND_DOMAIN=localhost \
FRONTEND_PORT=19006 \
JWT_SECRET_KEY=<secret-key-for-api-to-verify-json-web-tokens> \
DATABASE_HOST=localhost \
MYSQL_DATABASE=markdown_editor \
MYSQL_USER=markdown_editor_app \
MYSQL_PASSWORD=<password-for-app-as-a-database-user> \
SENDER_EMAIL=<your-email-address-to-send-confirmation-emails@your-email-service-provider.com> \
CONFIRMATION_EMAIL_SERVER_TYPE=StandardMailServer \
STANDARD_MAIL_SERVER_HOST=<your-email-service-provider.com> \
STANDARD_MAIL_SERVER_USER=<your-email-user-name> \
STANDARD_MAIL_SERVER_PASS=<your-email-user-password> \
yarn dev
```

*This command will enable hot reload, so you can try to edit anywhere in the code.*
*Your email account information will be used to send confirmation email, that is, if you sign up new account on frontend running at `http://localhost:19006`, API server will send email to the new account email address using your email account.*

#### Run frontend

You have several options to run frontend as development mode. You need to move `/frontend` directory to run any of the following commands.
*When you run this for the first time, you need to run ``yarn install`` first to install dependencies.*

If you want to use [Storybook](https://storybook.js.org/), run ``yarn storybook`` first. Then Storybook UI will showup at `http://0.0.0.0:7007`. *Storybook UI won't show you any stories until you start an app.*

##### With Storybook and Expo dev tools

Run following command:

```sh
REACT_NATIVE_PACKAGER_HOSTNAME=<your-local-ip-address> \
EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
API_DOMAIN=localhost \
API_PORT=3000 \
WS_PORT=3001 \
yarn start:storybook
```

This will start expo dev tools at `http://<your-local-ip-address>:19002` and you can start app on iOS/Android/Web from expo dev tools UI(You need to setup and get iOS/Android simulator ready to run app on it). After starting app, storybook UI will show you stories.

##### With Storybook and without Expo dev tools

If you don't need to start app on iOS/Android, then expo dev tools might only be too much. If so, you can run only app on web by the following command without touching expo dev tools UI.

```sh
API_DOMAIN=localhost \
API_PORT=3000 \
WS_PORT=3001 \
yarn web:storybook
```

##### Without Storybook and with Expo dev tools

```sh
REACT_NATIVE_PACKAGER_HOSTNAME=<your-local-ip-address> \
EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
API_DOMAIN=localhost \
API_PORT=3000 \
WS_PORT=3001 \
yarn start
```

##### Without Storybook and Expo dev tools

```sh
API_DOMAIN=localhost \
API_PORT=3000 \
WS_PORT=3001 \
yarn web
```

### Run E2E testing

When you get frontend/api/database ready, then you can open up E2E testing tool with Cypress by running the following command:

```sh
CYPRESS_BASE_URL=<frontend-url> yarn cypress:open
```
