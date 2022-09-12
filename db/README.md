# Initialize database locally

After making sure MySQL server is up and running, run `MYSQL_ROOT_PASSWORD=<your_password_for_your_local_MySQL_server_root_user> MYSQL_DATABASE_PASSWORD_FOR_APP=<password_you_want_to_use_for_app_to_communicate_to_database> ./init-locally.sh` under /MarkdownEditor/db, and the local database is ready to be accessed by API at localhost:3306 with username: markdown_editor_app/password: <password_you_want_to_use_for_app_to_communicate_to_database>.

## Troubleshooting for the initialization

- If you got 'permission denied: ./init-locally.sh' message, you need to run `chmod +x ./init-locally.sh` to give the script the permission to run.
- If you got 'mysql: command not found' message, you need to export path(on Mac, the command would be like `export PATH=${PATH}:/usr/local/mysql/bin`).
- If you got 'You are not allowed to create a user with GRANT' message, give your MySQL root user schema privileges at least 'CREATE' and 'GRANT OPTION'.
