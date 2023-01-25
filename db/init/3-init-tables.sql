-- You must sync scripts here manually with /k8s-manifests/db-init-configmap.yaml

USE markdown_editor;

CREATE TABLE users (
	id INT NOT NULL auto_increment PRIMARY KEY,
	email VARCHAR(50) NOT NULL unique,
	password CHAR(60) BINARY NOT NULL,
	is_activated BOOL NOT NULL DEFAULT FALSE
);

CREATE TABLE documents (
	id CHAR(36) CHARACTER SET ascii NOT NULL PRIMARY KEY,
	user_id INT NOT NULL,
	name VARCHAR(50),
	content VARCHAR(20000) CHARACTER SET UTF8MB3,
	created_at DATETIME NOT NULL,
	updated_at DATETIME NOT NULL,
	is_deleted BOOL NOT NULL DEFAULT FALSE,
	FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);
