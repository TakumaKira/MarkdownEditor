# Frontend Mentor - In-browser markdown editor solution

This is a solution to the [In-browser markdown editor challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/inbrowser-markdown-editor-r16TrrQX9). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Frontend Mentor - In-browser markdown editor solution](#frontend-mentor---in-browser-markdown-editor-solution)
  - [Table of contents](#table-of-contents)
  - [Setup](#setup)
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

You need to set your local IP address like ``LOCAL_IP=xxx.xxx.xx.x`` within .env file at your root directory to run Storybook correctly.

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
