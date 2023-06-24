# You must sync scripts here manually with /k8s-manifests/db-init-configmap.yaml

#!/bin/bash

mysql -uroot -p$MYSQL_ROOT_PASSWORD << EOF
DROP USER IF EXISTS markdown_api;
CREATE USER markdown_api IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE
  ON markdown_db.*
  TO markdown_api;
EOF
