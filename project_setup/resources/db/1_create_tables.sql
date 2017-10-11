/*
* This scripts creates tables for the database.
*/

use delivery_db;

CREATE TABLE users_customers ( 
	id INT NOT NULL AUTO_INCREMENT, 
	user_email VARCHAR(225) NOT NULL, 
	first_name VARCHAR(225) NOT NULL, 
	last_name VARCHAR(225) NOT NULL, 
	password VARCHAR(225) NOT NULL, 
	phone_number VARCHAR(10),
	birth_date DATE NOT NULL,
	address1 VARCHAR(225),
	address2 VARCHAR(225),
	address3 VARCHAR(225),
	
	PRIMARY KEY (id), 
	UNIQUE (user_email)
) ENGINE = InnoDB;

CREATE TABLE users_customers_guest ( 
	id INT NOT NULL AUTO_INCREMENT, 
	user_email VARCHAR(225) NOT NULL, 
	first_name VARCHAR(225) NOT NULL, 
	last_name VARCHAR(225) NOT NULL, 
	phone_number VARCHAR(10) NOT NULL, 
	
	PRIMARY KEY (id), 
	UNIQUE (user_email)
) ENGINE = InnoDB;

CREATE TABLE catalog_super_categories ( 
	id INT NOT NULL, 
	name VARCHAR(225) NOT NULL, 
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE catalog_categories ( 
	id INT NOT NULL, 
	name VARCHAR(225) NOT NULL,
	super_category_id INT NOT NULL,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_categories_super_category_id FOREIGN KEY (super_category_id) REFERENCES catalog_super_categories(id) ON DELETE CASCADE ON UPDATE CASCADE	
) ENGINE = InnoDB;

CREATE TABLE catalog_subcategories ( 
	id INT NOT NULL, 
	name VARCHAR(225) NOT NULL, 
	category_id INT NOT NULL, 
	
	PRIMARY KEY (id), 
	CONSTRAINT fk_subcategories_category_id FOREIGN KEY (category_id) REFERENCES catalog_categories(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE catalog_types ( 
	id INT NOT NULL, 
	name VARCHAR(225) NOT NULL, 
	subcategory_id INT NOT NULL, 
	
	PRIMARY KEY (id), 
	CONSTRAINT k_types_subcategory_id FOREIGN KEY (subcategory_id) REFERENCES catalog_subcategories(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE catalog_containers (
	id INT NOT NULL,
	name VARCHAR(225) NOT NULL ,
	
	PRIMARY KEY (id)
	) ENGINE = InnoDB;

CREATE TABLE catalog_packaging_volumes (
	id INT NOT NULL,
	volume_name VARCHAR(225) NOT NULL ,
	
	PRIMARY KEY (id)
	) ENGINE = InnoDB;

CREATE TABLE catalog_packagings ( 
	id INT NOT NULL, 
	name VARCHAR(225) NOT NULL, 
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;

CREATE TABLE catalog_listings ( 
	id INT NOT NULL AUTO_INCREMENT, 
	product_brand VARCHAR(225), 
	product_name VARCHAR(225), 
	product_description VARCHAR(225),
	product_country VARCHAR(225),
	type_id INT NOT NULL, 
	
	PRIMARY KEY (id), 
	CONSTRAINT fk_products_type_id FOREIGN KEY (type_id) REFERENCES catalog_types(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE catalog_products ( 
	id INT NOT NULL AUTO_INCREMENT, 
	listing_id INT NOT NULL, 
	container_id INT NOT NULL, 
	product_image VARCHAR(225),
	
	PRIMARY KEY (id),
	CONSTRAINT fk_product_listing_id FOREIGN KEY (listing_id) REFERENCES catalog_listings(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_product_container_id FOREIGN KEY (container_id) REFERENCES catalog_containers(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE catalog_depot ( 
	id INT NOT NULL AUTO_INCREMENT, 
	product_id INT NOT NULL, 
	packaging_id INT NOT NULL, 
	packaging_volume_id INT NOT NULL,
	price DECIMAL(6,2) NOT NULL, 
	quantity INT NOT NULL, 
	
	PRIMARY KEY (id), 
	CONSTRAINT fk_depot_product_id FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_depot_packaging_id FOREIGN KEY (packaging_id) REFERENCES catalog_packagings(id) ON DELETE CASCADE ON UPDATE CASCADE, 
	CONSTRAINT fk_depot_packaging_volume_id FOREIGN KEY (packaging_volume_id) REFERENCES catalog_packaging_volumes(id) ON DELETE CASCADE ON UPDATE CASCADE	
) ENGINE = InnoDB;


CREATE TABLE user_cart_info ( 
	id INT NOT NULL AUTO_INCREMENT, 
	user_id INT NOT NULL, 
	depot_id INT NOT NULL, 
	quantity INT NOT NULL,
	
	PRIMARY KEY (id), 
	UNIQUE (user_id, depot_id), 
	CONSTRAINT fk_cart_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE orders_info (
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT,
	guest_id INT,
	date_received TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_delivered TIMESTAMP,
	delivery_address VARCHAR(225) NOT NULL,
	store_address VARCHAR(225),
	order_status VARCHAR(225) NOT NULL,
	driver_id INT,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_orders_info_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_orders_info_guest_id FOREIGN KEY (guest_id) REFERENCES users_customers_guest(id) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE orders_cart_info ( 
	id INT NOT NULL AUTO_INCREMENT, 
	depot_id VARCHAR(225) NOT NULL, 
	quantity VARCHAR(225) NOT NULL,
	order_id INT NOT NULL,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_orders_cart_info_order_id FOREIGN KEY (order_id) REFERENCES orders_info(id) ON DELETE CASCADE ON UPDATE CASCADE	
) ENGINE = InnoDB;