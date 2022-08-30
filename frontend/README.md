# Frontend Mentor - In-browser markdown editor solution

This is a solution to the [In-browser markdown editor challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/inbrowser-markdown-editor-r16TrrQX9). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Frontend Mentor - In-browser markdown editor solution](#frontend-mentor---in-browser-markdown-editor-solution)
  - [Table of contents](#table-of-contents)
  - [Setup](#setup)
    - [Run as docker container(re-build needed to run updated code)](#run-as-docker-containerre-build-needed-to-run-updated-code)
    - [Run as node project(hot reload enabled)](#run-as-node-projecthot-reload-enabled)
      - [Run simulators](#run-simulators)
      - [Run Storybook](#run-storybook)
      - [Run unit test](#run-unit-test)
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

### Run as docker container(re-build needed to run updated code)

After cloning this repository, build docker image with ``docker build -t markdown-editor .`` from root of this frontend directory. This command will take a few minutes for the first build.

Then you need to add .env file in root directory and add ``REACT_NATIVE_PACKAGER_HOSTNAME=<your local IP>`` line in it. Now you can run this image on the first terminal with ``docker run -p 7007:7007 -p 19000:19000 -p 19002:19002 -p 19006:19006 --env-file=.env -it markdown-editor sh`` command, and add more terminals for the running container with ``docker exec -it <running container ID for markdown-editor image> sh``.

### Run as node project(hot reload enabled)

After cloning this repository, you can run any commands start with ``yarn`` as yarn will takes care of installing dependencies.

#### Run simulators

Run ``API_PORT=3000 WS_PORT=3001 yarn start``(If you run API at http://localhost:3000 and Websocket at http://localhost:3001) to start Expo developer tools(will be available on http://your_local_IP:19002/), then you can start web/iOS/Android by clicking "Run in/on ~~" buttons on sidebar(If you want to run this on iOS/Android, you need to setup and get simulator ready beforehand).
You can access the app by accessing http://localhost:19006/(web) or installing and starting Expo go app(iOS/Android).

#### Run Storybook

If you do not set ``LOCAL_IP`` variable on .env, storybook will start on your local IP ``0.0.0.0``. Or, you also can explicitly set your local IP address like ``LOCAL_IP=xxx.xxx.xx.x`` within .env file at your root directory.

Then run ``yarn storybook`` and you will see Storybook UI page on http://your_local_IP_or_0.0.0.0:7007/, but stories won't show up at this point.

Then run ``API_PORT=3000 WS_PORT=3001 yarn start:storybook``(If you run API at http://localhost:3000 and Websocket at http://localhost:3001) and access Expo developer tools on http://localhost:19002/(for as node project) or http://your_local_IP:19002/(for as docker container) then click "Run in web browser"/"Run on iOS simulator"/"Run on Android device/emulator"(You need to setup and get the simulator ready beforehand) on sidebar of Expo developer tools. You can access the rendered stories by accessing http://localhost:19006/(web) or installing and starting Expo go app(iOS/Android)(you might need to reload Storybook UI page) and should be able to select a story and web/ios/android simulator will show the selected story(You should be able to get logs on the main window).

#### Run unit test

Run ``yarn test``.

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
