-- You must sync scripts here manually with /k8s-manifests/db-init-configmap.yaml

-- User errors
-- SIGNAL SQLSTATE '45011' SET MESSAGE_TEXT = "User does not exist.";
-- SIGNAL SQLSTATE '45012' SET MESSAGE_TEXT = "Activated user with given email already exists.";
-- SIGNAL SQLSTATE '45013' SET MESSAGE_TEXT = "User already activated.";
-- Document errors
-- SIGNAL SQLSTATE '45021' SET MESSAGE_TEXT = "Another user's document is using the same id.";
-- SIGNAL SQLSTATE '45022' SET MESSAGE_TEXT = "Another document of this user is using the same id.";

USE markdown_editor;

DROP PROCEDURE IF EXISTS create_user;
DELIMITER $$
CREATE PROCEDURE create_user (
	p_email VARCHAR(50),
	p_password CHAR(60)
)
BEGIN
	IF (
		SELECT is_activated
			FROM users
			WHERE email = p_email
	) IS TRUE THEN
		SIGNAL SQLSTATE '45012' SET MESSAGE_TEXT = "Activated user with given email already exists.";
	ELSE
		INSERT INTO users (
			email,
			password
		)
		VALUES (
			p_email,
			p_password
		)
    ON DUPLICATE KEY UPDATE password = p_password;
	END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS activate_user;
DELIMITER $$
CREATE PROCEDURE activate_user (
	p_email VARCHAR(50)
)
BEGIN
	IF (
		SELECT id
			FROM users
			WHERE email = p_email
	) IS NULL THEN
		SIGNAL SQLSTATE '45011' SET MESSAGE_TEXT = "User does not exist.";
	ELSEIF (
		SELECT is_activated
			FROM users
			WHERE email = p_email
	) IS TRUE THEN
		SIGNAL SQLSTATE '45013' SET MESSAGE_TEXT = "User already activated.";
	ELSE
		UPDATE users
			SET is_activated = TRUE
			WHERE email = p_email;
		SELECT id, is_activated
			FROM users
			WHERE email = p_email;
	END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS get_user;
DELIMITER $$
CREATE PROCEDURE get_user (
	p_email VARCHAR(50)
)
BEGIN
	SELECT *
		FROM users
		WHERE email = p_email;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS update_user;
DELIMITER $$
CREATE PROCEDURE update_user (
	p_id INT,
	p_email VARCHAR(50),
	p_password CHAR(60)
)
BEGIN
	IF p_email IS NOT NULL THEN
		UPDATE users
			SET email = p_email
			WHERE id = p_id;
	END IF;
	IF p_password IS NOT NULL THEN
		UPDATE users
			SET password = p_password
			WHERE id = p_id;
	END IF;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS delete_user;
DELIMITER $$
CREATE PROCEDURE delete_user (
	p_id INT
)
BEGIN
	IF (
		SELECT id
			FROM users
			WHERE id = p_id
	) IS NULL THEN
		SIGNAL SQLSTATE '45011' SET MESSAGE_TEXT = "User does not exist.";
	ELSE
		DELETE
			FROM users
			WHERE id = p_id;
	END IF;
END $$
DELIMITER ;
