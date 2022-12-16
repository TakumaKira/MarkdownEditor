#!/bin/bash

mysql -uroot -p$MYSQL_ROOT_PASSWORD < ./init/1-init-database.sql
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD MYSQL_PASSWORD=$MYSQL_PASSWORD /bin/sh < ./init/2-init-user.sh
mysql -uroot -p$MYSQL_ROOT_PASSWORD < ./init/3-init-tables.sql
mysql -uroot -p$MYSQL_ROOT_PASSWORD < ./init/4-init-user-procedures.sql
mysql -uroot -p$MYSQL_ROOT_PASSWORD < ./init/5-init-document-procedures.sql
