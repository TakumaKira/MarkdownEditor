# Initialize database locally

After making sure MySQL server is up and running, run `MYSQL_ROOT_PASSWORD=<your_password_for_your_local_MySQL_server_root_user> MYSQL_DATABASE_PASSWORD_FOR_APP=<password_you_want_to_use_for_app_to_communicate_to_database> ./init-locally.sh`, and the local database is ready to be accessed by API at localhost:3306 with username: markdown_editor_app/password: <password_you_want_to_use_for_app_to_communicate_to_database>.
