# Markdown Editor frontend

This directory is frontend for [Markdown Editor](../README.md).

## Table of contents

- [Markdown Editor frontend](#markdown-editor-frontend)
  - [Table of contents](#table-of-contents)
  - [What will be explained here](#what-will-be-explained-here)
    - [Requirements](#requirements)
  - [Run app](#run-app)
    - [Run Storybook UI](#run-storybook-ui)
    - [With Storybook and Expo dev tools](#with-storybook-and-expo-dev-tools)
    - [With Storybook and without Expo dev tools](#with-storybook-and-without-expo-dev-tools)
    - [Without Storybook and with Expo dev tools](#without-storybook-and-with-expo-dev-tools)
    - [Without Storybook and Expo dev tools](#without-storybook-and-expo-dev-tools)
  - [Run unit test](#run-unit-test)

## What will be explained here

If you just want to see how this project works as a full stack project and don't want to change any code, [running everything on kubernetes](/README.md#run-everything-on-kubernetes) or [running everything on docker](/README.md#run-everything-on-docker) is way easier, so please check respective links.
I'll go through how to run and test frontend mainly for development.

### Requirements

This frontend app needs `node 16`. Plese switch your environment, using [nvm](https://github.com/nvm-sh/nvm).

## Run app

You have several options to run frontend as development mode. You need to move this directory to run any of the following commands.
*When you run this for the first time, you need to run ``yarn install`` first to install dependencies.*

### Run Storybook UI

If you want to check stories with [Storybook](https://storybook.js.org/), run ``yarn storybook`` first. Then Storybook UI will showup at `http://0.0.0.0:7007`(or `http://<your-local-ip-address>:7007` if you set `STORYBOOK_UI_HOST_IP=<your-local-ip-address>` as an environment variable for running **both** storybook UI **and** app itself). *Storybook UI won't show you any stories until you start app.*

Once storybook UI shows up, you can select a story on it and web/ios/android simulator will show the selected story.

### With Storybook and Expo dev tools

Run following command:

```sh
REACT_NATIVE_PACKAGER_HOSTNAME=<your-local-ip-address> \
EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
API_DOMAIN=<your-local-ip-address> \
API_PORT=3000 \
WS_PORT=3001 \
WEB_VERSION_URL=http://<your-local-ip-address>:19006 \
yarn start:storybook
```

This will start expo dev tools at `http://<your-local-ip-address>:19002` and you can start app on iOS/Android/Web from expo dev tools UI by clicking "Run in/on ~~" buttons on sidebar(You need to setup and get iOS/Android simulator ready to run app on it). You can access the app by accessing `http://<your-local-ip-address>:19006/`(web) or installing and starting Expo go app(iOS/Android). After starting app, storybook UI will show you stories.

### With Storybook and without Expo dev tools

If you don't need to start app on iOS/Android, then expo dev tools might only be too much. If so, you can run only app on web by the following command without touching expo dev tools UI.

```sh
API_DOMAIN=<your-local-ip-address> \
API_PORT=3000 \
WS_PORT=3001 \
yarn web:storybook
```

### Without Storybook and with Expo dev tools

```sh
REACT_NATIVE_PACKAGER_HOSTNAME=<your-local-ip-address> \
EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
API_DOMAIN=<your-local-ip-address> \
API_PORT=3000 \
WS_PORT=3001 \
yarn start
```

### Without Storybook and Expo dev tools

```sh
API_DOMAIN=<your-local-ip-address> \
API_PORT=3000 \
WS_PORT=3001 \
yarn web
```

```sh
API_DOMAIN=<your-local-ip-address> \
API_PORT=3000 \
WS_PORT=3001 \
WEB_VERSION_URL=http://<your-local-ip-address>:19006 \
yarn ios
```

## Run unit test

Run ``yarn test``.
