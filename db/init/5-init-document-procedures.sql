-- You must sync scripts here manually with /k8s-manifests/db-init-configmap.yaml

USE markdown_editor;

DROP PROCEDURE IF EXISTS get_documents;
DELIMITER $$
CREATE PROCEDURE get_documents (
	p_user_id INT,
	p_after DATETIME
)
BEGIN
	IF p_after IS NULL THEN
		SELECT *
		FROM documents
		WHERE user_id = p_user_id;
	ELSE
		SELECT *
		FROM documents
		WHERE user_id = p_user_id AND updated_at > p_after;
	END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS update_document;
DELIMITER $$
CREATE PROCEDURE update_document (
	p_id CHAR(36) CHARACTER SET ascii,
	p_user_id INT,
	p_name VARCHAR(50),
	p_content VARCHAR(20000) CHARACTER SET UTF8MB3,
	p_created_at TIMESTAMP,
	p_updated_at TIMESTAMP,
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
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "User does not exist.";
	ELSEIF (
		SELECT user_id
		FROM documents
		WHERE id = p_id
	) != p_user_id THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "Another user's document is using the same id.";
			-- TODO: What if this happens?
	ELSE
		INSERT INTO documents (
			id,
			user_id,
			name,
			content,
			created_at,
			updated_at,
			is_deleted
		)
		VALUES (
			p_id,
			p_user_id,
			p_name,
			p_content,
			p_created_at,
			p_updated_at,
			p_is_deleted
		) AS new_document
		ON DUPLICATE KEY UPDATE
		name = IF(new_document.is_deleted = FALSE, new_document.name, NULL),
		content = IF(new_document.is_deleted = FALSE, new_document.content, NULL),
		created_at = IF(new_document.is_deleted = FALSE, new_document.created_at, NULL),
		updated_at = new_document.updated_at,
		is_deleted = new_document.is_deleted;
	END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS get_latest_update_time;
DELIMITER $$
CREATE PROCEDURE get_latest_update_time (
	p_user_id INT
)
BEGIN
	SELECT updated_at
	FROM documents
	WHERE user_id = p_user_id
	ORDER BY updated_at DESC
	LIMIT 1;
END $$
DELIMITER ;
