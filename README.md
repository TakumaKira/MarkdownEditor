# Frontend Mentor - In-browser markdown editor solution

This is a full-stack solution to the [In-browser markdown editor challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/inbrowser-markdown-editor-r16TrrQX9). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Frontend Mentor - In-browser markdown editor solution](#frontend-mentor---in-browser-markdown-editor-solution)
  - [Table of contents](#table-of-contents)
  - [Setup](#setup)
    - [Run as full-stack project](#run-as-full-stack-project)
  - [Run on kubernetes on local](#run-on-kubernetes-on-local)
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

## Setup

### Run as full-stack project

After cloning this repository, build docker image with ``docker compose build`` from root of this project directory. This command will take a few minutes for the first build.

Then you need to add .env file in root directory and add ``MYSQL_DATABASE_PASSWORD_FOR_APP=<your database password for user named app>`` line in it, and .env files to frontend/api/db directories with required constants defined in each README.md at the root of each directory. Now you can run this image on the first terminal with ``docker compose up`` command.

## Run on kubernetes on local

Run ``kompose convert --volumes hostPath`` to generate yaml files to apply to Kubernetes.
Then run ``docker compose build && docker compose up`` to generate images. Once images are generated, stop these images.
Edit image name from ``frontend`` to ``markdowneditor-frontend``(specifying local image) and add ``imagePullPolicy: IfNotPresent``(preferring local image than remote) on generated ``frontend-deployment.yaml`` and ``api`` to ``markdowneditor-api`` and add ``imagePullPolicy: IfNotPresent`` on generated ``api-deployment.yaml`` as well.
Then add ``type: LoadBalancer`` to every generated ``frontend-service.yaml`` and ``api-service.yaml`` files.
Then create [secret](https://kubernetes.io/docs/concepts/configuration/secret/) to store password by running

```sh
kubectl create secret generic db-user-pass-for-app \
  --from-literal=password='<your_password_for_app_to_communicate_database>' \
  --from-literal=rootPassword='<your_password_for_your_kubernetes_container_MySQL_server_root_user>'
```

and you can verify it by running ``kubectl get secrets``.
You can clean up by running ``kubectl delete secret db-user-pass-for-app`` afterwords.
Then you can use the password from container by adding lines below on env section of ``api-deployment.yaml``/``db-deployment.yaml``

```yaml
- name: MYSQL_DATABASE_PASSWORD_FOR_APP
  valueFrom:
    secretKeyRef:
      name: db-user-pass-for-app
      key: password
      optional: false
```

and below on ``db-deployment.yaml``.

```yaml
- name: MYSQL_ROOT_PASSWORD
  valueFrom:
    secretKeyRef:
      name: db-user-pass-for-app
      key: rootPassword
      optional: false
```

Now you can apply these files by running ``kubectl apply -f db-pv.yaml,api-service.yaml,db-service.yaml,frontend-service.yaml,api-deployment.yaml,db-deployment.yaml,frontend-deployment.yaml,frontend--env-configmap.yaml`` command.
If applied successfully, you can see these.

- ``kubectl get po`` command will show you ``frontend-<some_id>``/``api-<some_id>``/``db-<some_id>`` are running with ``READY 1/1`` and ``STATUS Running``. If not, you can inspect its problem with ``kubectl describe pod frontend-<some_id>``/``kubectl describe pod api-<some_id>````kubectl describe pod db-<some_id>`` command, which will show you what happened on ``Events`` section.
- ``kubectl get svc`` command will show you frontend/api/db with localhost as EXTERNAL-IP and you can see them running on ``http://<your_local_ip>:19002/``(Expo developer tools)/``http://localhost:19006/``(Web version frontend).
- By running ``kubectl run -it --rm --image=mysql:8.0.29 --restart=Never mysql-client -- mysql -h db -p<your_password_for_your_kubernetes_container_MySQL_server_root_user>`` command, you will be able to run query for the database(run ``exit`` command to exit).

Then you can stop them by running ``kubectl delete -f db-pv.yaml,api-service.yaml,db-service.yaml,frontend-service.yaml,api-deployment.yaml,db-deployment.yaml,frontend-deployment.yaml,frontend--env-configmap.yaml`` command.

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
