# Markdown Editor database

This directory is database for [Markdown Editor](../README.md).

## Table of contents

- [Markdown Editor database](#markdown-editor-database)
  - [Table of contents](#table-of-contents)
  - [What will be explained here](#what-will-be-explained-here)
  - [Run database with initialization](#run-database-with-initialization)
    - [Troubleshooting for the initialization](#troubleshooting-for-the-initialization)
  - [Run initialization scripts tests](#run-initialization-scripts-tests)

## What will be explained here

If you just want to see how this project works as a full stack project and don't want to change any code, [running everything on kubernetes](/README.md#run-everything-on-kubernetes) or [running everything on docker](/README.md#run-everything-on-docker) is way easier, so please check respective links.
I'll go through how to run and test database mainly for development.

## Run database with initialization

You can choose from running docker container from [mysql official docker image](https://hub.docker.com/_/mysql) or standalone [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) inside `/db` directory,

To run it on docker:

```sh
MYSQL_ROOT_PASSWORD=<mysql-server-root-password> \
MYSQL_PASSWORD=<password-for-api-as-a-database-user> \
docker compose -p markdown-dev-db up
```

(using docker compose/docker-compose.yaml contains initialization)

or

```sh
docker run --name db-dev -e MYSQL_ROOT_PASSWORD=<mysql-server-root-password> -d -p 3306:3306 mysql:8.0.31
```

Then initialize it:

```sh
MYSQL_CONTAINER_NAME=db-dev \
MYSQL_ROOT_PASSWORD=<mysql-server-root-password> \
MYSQL_PASSWORD=<password-for-api-as-a-database-user> \
./init-docker.sh
```

(without docker compose)

These commands will start a container with setting up database for this project.

To use MySQL Community Server, start your mysql local server, and to set up database, run:

```sh
MYSQL_ROOT_PASSWORD=<your-local-mysql-server-root-password> \
MYSQL_PASSWORD=<password-for-api-as-a-database-user> \
./init.sh
```

After running one of these commands, you can access the database using [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) with `Hostname: localhost` / `Port: 3306` / `Username: root` + `Password: <mysql-server-root-password>` or `Username: markdown_api` + `Password: <password-for-api-as-a-database-user>`.

*If you want to use mysql command to the database running inside container, you need to run the command **inside** the container.*

### Troubleshooting for the initialization

- If you got 'permission denied: ./some-shell-script.sh' message, you need to run `chmod +x ./some-shell-script.sh` to give the script the permission to run.
- If you got 'mysql: command not found' message, you need to install [mysql](https://dev.mysql.com/downloads/mysql/) or export path(on Mac, the command would be like `export PATH=${PATH}:/usr/local/mysql/bin`).
- If you got 'You are not allowed to create a user with GRANT' message, give your MySQL root user schema privileges at least 'CREATE' and 'GRANT OPTION'.

## Run initialization scripts tests

You should pass initialization scripts tests every time you make changes.
To run test, from `/db/test/` directory, run:

```sh
yarn test
```

*When you run this for the first time, you need to run ``yarn install`` first to install dependencies.*

If you just want to check testing MySQL server with migrated database, run:

```sh
yarn mysql-test start
```

Then stop with the following command:

```sh
yarn mysql-test stop
```

This command uses [Docker](https://docs.docker.com/) and [MySQL Shell](https://dev.mysql.com/downloads/shell/), so make you install and get ready to run them beforehand.
