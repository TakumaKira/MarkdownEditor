#!/bin/bash

docker exec -i mysql-test sh -c 'exec mysql' <<< "ALTER USER 'root'@'%' IDENTIFIED BY 'root-password'; FLUSH PRIVILEGES;"
docker exec -i mysql-test sh -c 'exec mysql -uroot -proot-password' < ../init/1-init-database.sql
docker exec -e MYSQL_ROOT_PASSWORD=root-password -e MYSQL_PASSWORD=password -i mysql-test /bin/sh < ../init/2-init-user.sh
docker exec -i mysql-test sh -c 'exec mysql -uroot -proot-password' < ../init/3-init-tables.sql
docker exec -i mysql-test sh -c 'exec mysql -uroot -proot-password' < ../init/4-init-user-procedures.sql
docker exec -i mysql-test sh -c 'exec mysql -uroot -proot-password' < ../init/5-init-document-procedures.sql
