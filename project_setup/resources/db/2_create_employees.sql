/* Insert employee roles */
INSERT INTO `homit`.`employee_roles`(id, role) VALUES (2,'CSR');
INSERT INTO `homit`.`employee_roles`(id, role) VALUES (3,'Independent Contractors');

INSERT INTO `homit`.`users_employees`(user_email, first_name, password, role_id) VALUES ("csr1@homit.ca", "CSR", "$2a$10$ID0LP8Tk7O1bhm/wzNOIdOx9pceiEtTsh/zUUkA.IbOaMT69ZITbC", 2);

INSERT INTO `homit`.`users_employees`(id, user_email, first_name, password, role_id) VALUES (2, "driver1@homit.ca", "Driver", "$2a$10$ID0LP8Tk7O1bhm/wzNOIdOx9pceiEtTsh/zUUkA.IbOaMT69ZITbC", 3);
INSERT INTO `homit`.`drivers`(employee_id) VALUES (2);