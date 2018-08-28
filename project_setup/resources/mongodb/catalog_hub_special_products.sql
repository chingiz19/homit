use homit;

DROP TABLE IF EXISTS catalog_hub_special_products;

CREATE TABLE catalog_hub_special_products (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	store_type_id INT UNSIGNED NOT NULL,
	product_id VARCHAR(225) NOT NULL,
	special_type_id INT UNSIGNED NOT NULL,
	active BOOLEAN DEFAULT TRUE,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_hub_special_products_store_type_id FOREIGN KEY (store_type_id) REFERENCES catalog_store_types(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_catalog_hub_special_products_special_type_id FOREIGN KEY (special_type_id) REFERENCES catalog_hub_special_types(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


-- Catalog Hub - Special Products
-- !!! Drop the table and run with product_id column changed to varchar
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-805", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(9, "9-1", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(7, "7-2", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(10, "10-3", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-543", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(1, "1-625", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(1, "1-17", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-463", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(11, "11-3", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(3, "3-24", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-518", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-299", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(3, "3-54", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(1, "1-120", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-534", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(1, "1-26", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(3, "3-61", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-697", 2);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-515", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(3, "3-30", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(7, "7-1", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(9, "9-2", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-13", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(1, "1-474", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(1, "1-151", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-531", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(11, "11-8", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(3, "3-20", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(11, "11-6", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-219", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(3, "3-37", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(1, "1-12", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-445", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(10, "10-2", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(3, "3-44", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-9", 1);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-517", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(3, "3-42", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(7, "7-3", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-323", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-3", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(1, "1-114", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(1, "1-193", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-533", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(1, "1-202", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(3, "3-32", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-820", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-410", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(3, "3-50", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(11, "11-11", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(10, "10-1", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(1, "1-394", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(9, "9-3", 3);
INSERT INTO `catalog_hub_special_products` (store_type_id, product_id, special_type_id) VALUES(6, "6-475", 3);