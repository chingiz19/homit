use delivery_db;

DROP TABLE IF EXISTS esl_users;

CREATE TABLE esl_users ( 
	id INT NOT NULL AUTO_INCREMENT, 
	user_email VARCHAR(225) NOT NULL, 
	first_name VARCHAR(225) NOT NULL, 
	last_name VARCHAR(225) NOT NULL, 
	password VARCHAR(225) NOT NULL, 
	
	PRIMARY KEY (id), 
	UNIQUE (user_email)
) ENGINE = InnoDB;

INSERT INTO esl_users(id, user_email, first_name, last_name, password) 
	VALUES (NULL, 'findiq@qoz.com', 'Findiq', 'Qoz', '$2a$10$l0s0OoG8WEginiBF4hryxOI51mX2pSjotdYxuiaPLbJSkxbjU6rBm');