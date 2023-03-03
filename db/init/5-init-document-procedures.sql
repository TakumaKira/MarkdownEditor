-- You must sync scripts here manually with /k8s-manifests/db-init-configmap.yaml

-- User errors
-- SIGNAL SQLSTATE '45011' SET MESSAGE_TEXT = "User does not exist.";
-- SIGNAL SQLSTATE '45012' SET MESSAGE_TEXT = "Activated user with given email already exists.";
-- SIGNAL SQLSTATE '45013' SET MESSAGE_TEXT = "User already activated.";
-- Document errors
-- SIGNAL SQLSTATE '45021' SET MESSAGE_TEXT = "Another user's document is using the same id.";
-- SIGNAL SQLSTATE '45022' SET MESSAGE_TEXT = "Another document of this user is using the same id.";

USE markdown_editor;

DROP PROCEDURE IF EXISTS get_document;
DELIMITER $$
CREATE PROCEDURE get_document (
	p_id CHAR(36) CHARACTER SET ascii
)
BEGIN
	SET time_zone = '+00:00';
	SELECT
		*,
		UNIX_TIMESTAMP(created_at) AS created_at,
		UNIX_TIMESTAMP(updated_at) AS updated_at,
		UNIX_TIMESTAMP(saved_on_db_at) AS saved_on_db_at
	FROM documents
	WHERE id = p_id;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS get_user_documents;
DELIMITER $$
CREATE PROCEDURE get_user_documents (
	p_user_id INT
)
BEGIN
	SET time_zone = '+00:00';
	SELECT
		*,
		UNIX_TIMESTAMP(created_at) AS created_at,
		UNIX_TIMESTAMP(updated_at) AS updated_at,
		UNIX_TIMESTAMP(saved_on_db_at) AS saved_on_db_at
	FROM documents
	WHERE user_id = p_user_id
	ORDER BY updated_at DESC, saved_on_db_at DESC, created_at DESC;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS update_document;
DELIMITER $$
CREATE PROCEDURE update_document (
	p_id CHAR(36) CHARACTER SET ascii,
	p_user_id INT,
	p_name VARCHAR(50),
	p_content VARCHAR(20000) CHARACTER SET UTF8MB3,
	p_created_at DATETIME,
	p_updated_at DATETIME,
	p_saved_on_db_at DATETIME,
	p_is_deleted BOOL
)
BEGIN
	IF (
		NOT EXISTS (
			SELECT TRUE
				FROM users
				WHERE id = p_user_id
		)
	) THEN
		SIGNAL SQLSTATE '45011' SET MESSAGE_TEXT = "User does not exist.";
	ELSEIF (
		SELECT user_id
			FROM documents
			WHERE id = p_id
	) != p_user_id THEN
		SIGNAL SQLSTATE '45021' SET MESSAGE_TEXT = "Another user's document is using the same id.";
	ELSEIF (
		SELECT created_at
			FROM documents
			WHERE id = p_id
	) != p_created_at THEN
		SIGNAL SQLSTATE '45022' SET MESSAGE_TEXT = "Another document of this user is using the same id.";
	ELSE
		INSERT INTO documents (
			id,
			user_id,
			name,
			content,
			created_at,
			updated_at,
			saved_on_db_at,
			is_deleted
		)
		VALUES (
			p_id,
			p_user_id,
			p_name,
			p_content,
			p_created_at,
			p_updated_at,
			p_saved_on_db_at,
			p_is_deleted
		) AS new_document
		ON DUPLICATE KEY UPDATE
			name = IF(new_document.is_deleted = FALSE, new_document.name, NULL),
			content = IF(new_document.is_deleted = FALSE, new_document.content, NULL),
			updated_at = new_document.updated_at,
			saved_on_db_at = new_document.saved_on_db_at,
			is_deleted = new_document.is_deleted;
	END IF;
END $$
DELIMITER ;
