#!/bin/bash

mysql -uroot -p$MYSQL_ROOT_PASSWORD << EOF
DROP USER IF EXISTS markdown_editor_app;
CREATE USER markdown_editor_app IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE
  ON markdown_editor.*
  TO markdown_editor_app;
EOF
