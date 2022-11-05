#!/bin/bash

mysql -u root -p$MYSQL_ROOT_PASSWORD << EOF
CREATE USER $MYSQL_DATABASE_USERNAME_FOR_APP IDENTIFIED BY '$MYSQL_DATABASE_PASSWORD_FOR_APP';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE
ON $MYSQL_DATABASE.*
TO $MYSQL_DATABASE_USERNAME_FOR_APP;
EOF