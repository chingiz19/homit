/*
* This scripts creates tables for the database.
*/
CREATE TABLE `delivery_db`.`users_customers` ( `id` INT NOT NULL AUTO_INCREMENT , `user_email` VARCHAR(225) NOT NULL , `first_name` VARCHAR(225) NOT NULL , `last_name` VARCHAR(225) NOT NULL , `password` VARCHAR(225) NOT NULL , `phone_number` VARCHAR(10) NOT NULL , PRIMARY KEY (`id`), UNIQUE (`user_email`)) ENGINE = InnoDB;

CREATE TABLE `delivery_db`.`catalog_categories` ( `id` INT NOT NULL AUTO_INCREMENT , `name` VARCHAR(225) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
CREATE TABLE `delivery_db`.`catalog_subcategories` ( `id` INT NOT NULL AUTO_INCREMENT , `name` VARCHAR(225) NOT NULL , `category_id` INT NOT NULL , PRIMARY KEY (`id`) , CONSTRAINT `fk_subcategories_category_id` FOREIGN KEY (`category_id`) REFERENCES `catalog_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE = InnoDB;
CREATE TABLE `delivery_db`.`catalog_types` ( `id` INT NOT NULL AUTO_INCREMENT , `name` VARCHAR(225) NOT NULL , `subcategory_id` INT NOT NULL , PRIMARY KEY (`id`) , CONSTRAINT `fk_types_subcategory_id` FOREIGN KEY (`subcategory_id`) REFERENCES `catalog_subcategories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE = InnoDB;
CREATE TABLE `delivery_db`.`catalog_packagings` ( `id` INT NOT NULL AUTO_INCREMENT , `name` VARCHAR(225) NOT NULL , `category_id` INT NOT NULL , PRIMARY KEY (`id`) , UNIQUE ( `name`, `category_id`) , CONSTRAINT `fk_packagings_category_id` FOREIGN KEY (`category_id`) REFERENCES `catalog_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADe) ENGINE = InnoDB;
CREATE TABLE `delivery_db`.`catalog_products` ( `id` INT NOT NULL AUTO_INCREMENT , `product_brand` VARCHAR(225) NOT NULL , `product_name` VARCHAR(225) NULL , `product_description` VARCHAR(225) NOT NULL , `product_image` VARCHAR(225) NOT NULL , `type_id` INT NOT NULL , PRIMARY KEY (`id`) , CONSTRAINT `fk_products_type_id` FOREIGN KEY (`type_id`) REFERENCES `catalog_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE = InnoDB;
CREATE TABLE `delivery_db`.`catalog_warehouse` ( `id` INT NOT NULL AUTO_INCREMENT , `packaging_id` INT NOT NULL , `price` DECIMAL(6,2) NOT NULL , `product_id` INT NOT NULL , `quantity` INT NOT NULL , PRIMARY KEY (`id`) , CONSTRAINT `fk_warehouse_packaging_id` FOREIGN KEY (`packaging_id`) REFERENCES `catalog_packagings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE , CONSTRAINT `fk_warehouse_product_id` FOREIGN KEY (`product_id`) REFERENCES `catalog_products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE = InnoDB;