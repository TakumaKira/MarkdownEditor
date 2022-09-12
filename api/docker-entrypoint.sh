#!/bin/sh

echo "Waiting for DB to start..."
./wait-for db:3306

echo "Building..."
yarn build

echo "Creating the user..."
yarn create-user

echo "Starting the server..."
yarn start