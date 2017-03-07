/*
* This scripts creates tables for the database.
*/
CREATE TABLE `delivery_db`.`product_types` ( `id` INT NOT NULL AUTO_INCREMENT , `name` VARCHAR(225) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
CREATE TABLE `delivery_db`.`product_list` ( `id` INT NOT NULL AUTO_INCREMENT , `product_type` INT NOT NULL , `product_name` VARCHAR(225) NOT NULL , `product_description` VARCHAR(225) NOT NULL , `product_price` DECIMAL(10, 2) NOT NULL , `product_image` VARCHAR(225) NOT NULL , PRIMARY KEY (`id`) , CONSTRAINT `fk_product_type` FOREIGN KEY (`product_type`) REFERENCES `product_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE = InnoDB;
CREATE TABLE `delivery_db`.`product_warehouse` ( `id` INT NOT NULL AUTO_INCREMENT , `product_id` INT NOT NULL , `quantity` INT NOT NULL , PRIMARY KEY (`id`) , CONSTRAINT `fk_product_id` FOREIGN KEY (`product_id`) REFERENCES `product_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE = InnoDB;
CREATE TABLE `delivery_db`.`users_customers` ( `id` INT NOT NULL AUTO_INCREMENT , `user_email` VARCHAR(225) NOT NULL , `first_name` VARCHAR(225) NOT NULL , `last_name` VARCHAR(225) NOT NULL , `password` VARCHAR(225) NOT NULL , `phone_number` VARCHAR(10) NOT NULL , PRIMARY KEY (`id`), UNIQUE (`user_email`)) ENGINE = InnoDB;