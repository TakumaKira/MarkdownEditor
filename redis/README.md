# Markdown Editor Session Storage using Redis

This directory is for preparing session storage using [Redis](https://redis.io/) for [Markdown Editor](../README.md).

## Table of contents

- [Markdown Editor Session Storage using Redis](#markdown-editor-session-storage-using-redis)
  - [Table of contents](#table-of-contents)
  - [What will be explained here](#what-will-be-explained-here)
  - [Installations](#installations)
    - [Install and start Redis locally](#install-and-start-redis-locally)
    - [Install RedisInsight(optional, but recommended for Redis learners)](#install-redisinsightoptional-but-recommended-for-redis-learners)
    - [Access the Redis server](#access-the-redis-server)
    - [Add a user for api](#add-a-user-for-api)

## What will be explained here

This directory contains a few files `docker-entrypoint.sh` and `Dockerfile`. These are used when you run this entire project using Docker Compose or Skaffold to create a user for api to access Redis without giving administrative authorizations.
If you run this entire project by running each part by hand, you also need to setup Redis locally and add the user manually. I will explain how here.

## Installations

### Install and start Redis locally

Just follow the instructions [here](https://redis.io/docs/getting-started/).

### Install RedisInsight(optional, but recommended for Redis learners)

RedisInsight is a great company for developing Redis app. You can inspect with GUI what data Redis currently has.
To install it, follow the instructions [here](https://redis.io/docs/ui/insight/).

### Access the Redis server

Once start a Redis server, it will listen on port `6379` as `default` user with no password by default.
You can access it using `redis-cli` command(without any option) which would also be installed through the installation above or `RedisInsight`.

### Add a user for api

To access from api more safely by not having administrative authorizations, api should access this as a user only with read/write permissions. So setup a user for api.

From another terminal(while running a server in a terminal), start a redis client by following command: `redis-cli`. This will show a prompt like: `127.0.0.1:6379>` until you exit the client.

If you input `ACL LIST` to the prompt, it will return a line like:

```terminal
1) "user default on nopass ~* &* +@all"
```

which means the server have only one user `default` with no password, and the user can access all keys(indicated by `~*`) and with all permissions(indicated by `+@all`).

Add a user named `markdown_api` with password `password-for-api`(as an example. definitely you should chose more secure one on production) and only with read/write permissions on every keys by following command:
`ACL SETUSER markdown_api ON >password-for-api +@all -@dangerous ~*`

If you input `ACL LIST` again, you will get like below:

```terminal
1) "user default on nopass ~* &* +@all"
2) "user markdown_api on #dd0b2100faf2778c41dc91d96c1ed1732546f4c2454434591f629769a28ec44f ~* &* +@all -@dangerous"
```

And you can access as the user with the following command:
`redis-cli -u redis://markdown_api:password-for-api@127.0.0.1:6379`

*Note: you cannot access as this user using RedisInsight properly as it needs administrative authorizations.*
