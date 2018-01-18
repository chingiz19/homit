/* Insert employee roles */
INSERT INTO `homit_dev`.`employee_roles`(id, role) VALUES (2,'CSR');

INSERT INTO `homit_dev`.`users_employees`(user_email, first_name, last_name, password, role_id) VALUES ("csr1@homit.ca", "CSR", "CSR", "$2a$10$ID0LP8Tk7O1bhm/wzNOIdOx9pceiEtTsh/zUUkA.IbOaMT69ZITbC", 2);

INSERT INTO `homit_dev`.`drivers`(id, user_email, first_name, last_name, password) VALUES (2, "driver1@homit.ca", "Chingiz", "Bakhishov", "$2a$10$4BrlOxtvG9GH7IVvUI27OuVFxQkjj6jV1PsGBBEUpM/YjAxOiVYle");
INSERT INTO `homit_dev`.`drivers`(id, user_email, first_name, last_name, password) VALUES (3, "driver2@homit.ca", "Zaman", "Zamanli", "$2a$10$4BrlOxtvG9GH7IVvUI27OuVFxQkjj6jV1PsGBBEUpM/YjAxOiVYle");