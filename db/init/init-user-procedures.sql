USE markdown_editor;

DROP PROCEDURE IF EXISTS create_user;
DELIMITER $$
CREATE PROCEDURE create_user (
	p_email VARCHAR(50),
	p_password CHAR(60)
)
BEGIN
	INSERT INTO users (
		email,
		password
	)
	VALUES (
		p_email,
		p_password
	);
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS activate_user;
DELIMITER $$
CREATE PROCEDURE activate_user (
	p_email INT
)
BEGIN
	IF (
		SELECT id
        FROM users
        WHERE email = p_email
    ) IS NULL THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "User does not exist.";
	ELSEIF (
		SELECT is_activated
        FROM users
        WHERE email = p_email
    ) IS TRUE THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "User already activated.";
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
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = "User does not exist.";
	ELSE
		DELETE FROM users
		WHERE id = p_id;
	END IF;
END $$
DELIMITER ;
