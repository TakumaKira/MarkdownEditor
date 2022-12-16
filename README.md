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
      - [Run frontend standalone](#run-frontend-standalone)
      - [Run API server standalone](#run-api-server-standalone)
      - [Run database standalone](#run-database-standalone)
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
- Live Site URL: [Vercel](https://markdown-editor-git-master-takumakira.vercel.app/) *Signup/Login feature does not work here as I don't want to provide any backend services publicly.*

## My process

### Built with

- [React](https://reactjs.org/) - JS library
- [React Native](https://reactnative.dev/) - React framework for building native mobile apps
- [Expo](https://docs.expo.dev/) - React Native framework
- [Storybook](https://storybook.js.org/) - For Component Driven Development and visual testing
- [Express](https://expressjs.com/) - For building API server
- [Jest](https://jestjs.io/) - For unit testing
- [MySQL](https://www.mysql.com/) - For building database
- [Cypress](https://www.cypress.io/) - For E2E testing
- [Docker](https://www.docker.com/) - Containerized development environment
- [Kubernetes](https://kubernetes.io/) - Manage deployment of containerized applications
- [Skaffold](https://skaffold.dev/) - Kubernetes orchestration(only used to run entire app quickly)
- [Google Cloud](https://cloud.google.com/) - Platform to deploy applications using Docker and Kubernetes

### What I learned

- I needed to chose frameworks carefully to realize the most suitable development environment for this project.
- Basically, I wanted to build this as web app, but also as mobile apps. So I saw Flutter, React Native and React Native using Expo. I wanted to experience React Native more for now, and whole setup things of pure React Native was not my current point. Besides, it was plus for this that there were more documents for using Storybook with Expo.
- This is the first time for me to build and deploy a full stack application, so I needed to (re)learn a lot about backend stacks like Express/MySQL and deployment stacks like Docker/Kubernetes/Google Cloud. Obviously I still need to learn much more about these areas, but this will be a great first step for me.

### Continued development

- I tried to using [Chromatic](https://www.chromatic.com/) for getting visual difference of the Storybook of each development, but it looked not to support React Native for now.

### Useful resources

- [Setting up Storybook for React Native/TypeScript](https://dev.to/risafj/setting-up-storybook-for-react-native-typescript-server-loader-ios-android-3b0i) - Setting up Storybook correctly was the most challenging part of the setup phase of this project. This explains how to see the stories with Expo project which other explanations left off(I needed to conditionally export ``StorybookUIRoot`` as App root).
- [Courses on Code with Mosh](https://codewithmosh.com/courses) - He always shows us not "how to write working code" but "how to write clean code". As starter of building my first full stack application, courses like [The Complete Node.js Course](https://codewithmosh.com/p/the-complete-node-js-course) / [Complete SQL Mastery](https://codewithmosh.com/p/complete-sql-mastery) / [The Ultimate Docker Course](https://codewithmosh.com/p/the-ultimate-docker-course) helped me to get a right sense of new tools.
- [A Better Approach to Google Cloud Continuous Deployment](https://www.toptal.com/devops/better-google-cloud-continuous-deployment) - This showed me a beautiful way to setup CI/CD environment on Google Cloud.

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

#### Run frontend standalone

Please see [README for frontend](/frontend/README.md)

#### Run API server standalone

Please see [README for api](/api/README.md).

#### Run database standalone

Please see [README for db](./db/README.md).

### Run E2E testing

When you get frontend/api/database ready, then you can open up E2E testing tool with Cypress by running the following command:
*When you run this for the first time, you need to run ``yarn install`` first to install dependencies.*

```sh
CYPRESS_BASE_URL=<frontend-url> yarn cypress:open
```
