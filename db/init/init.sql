USE markdown_editor;

CREATE TABLE users (
	id INT NOT NULL auto_increment PRIMARY KEY,
    name VARCHAR(50) NOT NULL unique,
    password CHAR(60) BINARY NOT NULL
);

CREATE TABLE documents (
	id CHAR(36) CHARACTER SET ascii NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50),
    content VARCHAR(20000) CHARACTER SET UTF8MB3,
    created_at DATETIME,
    updated_at DATETIME NOT NULL,
    is_deleted BOOL NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

DROP PROCEDURE IF EXISTS get_user;
DELIMITER $$
CREATE PROCEDURE get_user (
	p_name VARCHAR(50)
)
BEGIN
	SELECT *
    FROM users
    WHERE name = p_name;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS create_user;
DELIMITER $$
CREATE PROCEDURE create_user (
	p_name VARCHAR(50),
    p_password CHAR(60)
)
BEGIN
	INSERT INTO users (
		id,
        name,
        password
    )
    VALUES (
		DEFAULT,
        p_name,
        p_password
    );
END $$
DELIMITER ;

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
		) AS new_documents
		ON DUPLICATE KEY UPDATE
		name = IF(new_documents.is_deleted = FALSE, new_documents.name, NULL),
		content = IF(new_documents.is_deleted = FALSE, new_documents.content, NULL),
		created_at = IF(new_documents.is_deleted = FALSE, documents.created_at, NULL),
		updated_at = new_documents.updated_at,
		is_deleted = new_documents.is_deleted;
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

-- TODO: Delete test calls below

-- CALL get_documents (
-- 	1,
--     NULL
-- );

-- CALL get_documents (
-- 	1,
--     "2022-07-23 09:38:06"
-- );

-- CALL update_document (
-- 	'1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
--     1,
--     'test title',
--     'test content',
--     '2022-07-23 09:38:06',
--     false
-- );

-- CALL get_latest_update_time (1);
