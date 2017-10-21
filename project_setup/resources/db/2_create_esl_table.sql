use delivery_db;

DROP TABLE IF EXISTS esl_users;

CREATE TABLE esl_users ( 
	id INT NOT NULL AUTO_INCREMENT, 
	user_email VARCHAR(225) NOT NULL, 
	first_name VARCHAR(225) NOT NULL, 
	last_name VARCHAR(225) NOT NULL, 
	password VARCHAR(225) NOT NULL, 
	role VARCHAR(225) NOT NULL,
	
	PRIMARY KEY (id), 
	UNIQUE (user_email)
) ENGINE = InnoDB;

INSERT INTO `delivery_db`.`esl_users` (user_email,first_name,last_name,password, role) VALUES ('sifarish@homit.ca', 'Order', 'Manager', '$2a$10$W7etBBDQJgjHZW4nEjkvyOVuPOWQiKsXDr1LEilcd996U3QxG.3Q2', 'esl');