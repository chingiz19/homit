/* Insert employee roles */
INSERT INTO `homit`.`employee_roles`(id, role) VALUES (2,'CSR');
INSERT INTO `homit`.`employee_roles`(id, role) VALUES (3,'Independent Contractors');

INSERT INTO `homit`.`users_employees`(user_email, first_name, last_name, password, role_id) VALUES ("csr1@homit.ca", "CSR", "CSR", "$2a$10$ID0LP8Tk7O1bhm/wzNOIdOx9pceiEtTsh/zUUkA.IbOaMT69ZITbC", 2);

INSERT INTO `homit`.`users_employees`(id, user_email, first_name, last_name, password, role_id) VALUES (2, "driver1@homit.ca", "Chingiz", "Bakhishov", "$2a$10$4BrlOxtvG9GH7IVvUI27OuVFxQkjj6jV1PsGBBEUpM/YjAxOiVYle", 3);
INSERT INTO `homit`.`drivers`(employee_id) VALUES (2);
INSERT INTO `homit`.`users_employees`(id, user_email, first_name, last_name, password, role_id) VALUES (3, "driver2@homit.ca", "Zaman", "Zamanli", "$2a$10$4BrlOxtvG9GH7IVvUI27OuVFxQkjj6jV1PsGBBEUpM/YjAxOiVYle", 3);
INSERT INTO `homit`.`drivers`(employee_id) VALUES (3);