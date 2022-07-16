USE markdown_editor;

CREATE TABLE users (
	id INT NOT NULL auto_increment PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE documents (
	id CHAR(36) CHARACTER SET ascii NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    content VARCHAR(20000) CHARACTER SET UTF8MB3,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    updated_at DATETIME NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

DELIMITER $$
CREATE PROCEDURE create_user (
	p_name VARCHAR(50)
)
BEGIN
	INSERT INTO users (
		id,
        name
    )
    VALUES (
		DEFAULT,
        p_name
    );
END
$$

DELIMITER $$
CREATE PROCEDURE create_document (
	p_id CHAR(36) CHARACTER SET ascii,
	p_user_id INT,
	p_name VARCHAR(50),
    p_content VARCHAR(20000) CHARACTER SET UTF8MB3
)
BEGIN
	INSERT INTO documents (
		id,
        user_id,
        name,
        content,
        created_at,
        updated_at
    )
    VALUES (
		p_id,
        p_user_id,
        p_name,
        p_content,
        DEFAULT,
        DEFAULT
    );
END
$$

DELIMITER $$
CREATE PROCEDURE update_document (
	p_id CHAR(36) CHARACTER SET ascii,
    p_user_id INT,
	p_name VARCHAR(50),
    p_content VARCHAR(20000) CHARACTER SET UTF8MB3
)
BEGIN
	UPDATE documents
    SET
		name = p_name,
        content = p_content,
        updated_at = NOW()
	WHERE id = p_id AND user_id = p_user_id;
END
$$

DELIMITER $$
CREATE PROCEDURE delete_document (
	p_id CHAR(36) CHARACTER SET ascii,
    p_user_id INT
)
BEGIN
	DELETE FROM documents
    WHERE id = p_id AND user_id = p_user_id;
END
$$

CALL create_user('John Doe');
CALL create_user('Jane Doe');

-- CALL create_document (
-- 	'1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
--     1,
--     'test title',
--     'test content'
-- );

-- CALL update_document (
-- 	'1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
--     1,
--     'test title2',
--     'test content2'
-- );

-- CALL delete_document (
-- 	'1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
--     1
-- );