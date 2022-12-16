#!/bin/bash

docker exec -e MYSQL_PASSWORD=$MYSQL_PASSWORD -i $MYSQL_CONTAINER_NAME sh -c 'exec mysql -uroot -p$MYSQL_ROOT_PASSWORD' < ./init/1-init-database.sql
docker exec -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD -e MYSQL_PASSWORD=$MYSQL_PASSWORD -i $MYSQL_CONTAINER_NAME /bin/sh < ./init/2-init-user.sh
docker exec -e MYSQL_PASSWORD=$MYSQL_PASSWORD -i $MYSQL_CONTAINER_NAME sh -c 'exec mysql -uroot -p$MYSQL_ROOT_PASSWORD' < ./init/3-init-tables.sql
docker exec -e MYSQL_PASSWORD=$MYSQL_PASSWORD -i $MYSQL_CONTAINER_NAME sh -c 'exec mysql -uroot -p$MYSQL_ROOT_PASSWORD' < ./init/4-init-user-procedures.sql
docker exec -e MYSQL_PASSWORD=$MYSQL_PASSWORD -i $MYSQL_CONTAINER_NAME sh -c 'exec mysql -uroot -p$MYSQL_ROOT_PASSWORD' < ./init/5-init-document-procedures.sql
