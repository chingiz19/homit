/*
* This scripts creates tables for the database.
*/


use homit;


CREATE TABLE users_customers ( 
	id INT NOT NULL AUTO_INCREMENT,
	id_prefix VARCHAR(3) NOT NULL DEFAULT "u_", 
	user_email VARCHAR(225) NOT NULL, 
	first_name VARCHAR(225) NOT NULL, 
	last_name VARCHAR(225) NOT NULL, 
	password VARCHAR(225) NOT NULL, 
	phone_number VARCHAR(10),
	birth_date DATE,
	address1 VARCHAR(225),
	address2 VARCHAR(225),
	address3 VARCHAR(225),
	address1_name VARCHAR(225),
	address2_name VARCHAR(225),
	address3_name VARCHAR(225),
	
	PRIMARY KEY (id), 
	UNIQUE (user_email)
) ENGINE = InnoDB;


CREATE TABLE users_customers_history ( 
	id INT NOT NULL AUTO_INCREMENT,
	user_id INT NOT NULL, 
	user_email VARCHAR(225), 
	first_name VARCHAR(225), 
	last_name VARCHAR(225), 
	phone_number VARCHAR(10),
	birth_date DATE,
	address1 VARCHAR(225),
	address2 VARCHAR(225),
	address3 VARCHAR(225),
	address1_name VARCHAR(225),
	address2_name VARCHAR(225),
	address3_name VARCHAR(225),
	
	PRIMARY KEY (id),
	CONSTRAINT fk_users_customers_history_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE CASCADE ON UPDATE CASCADE	
) ENGINE = InnoDB;


CREATE TABLE users_customers_guest ( 
	id INT NOT NULL AUTO_INCREMENT, 
	id_prefix VARCHAR(3) NOT NULL DEFAULT "ug_", 
	user_email VARCHAR(225) NOT NULL, 
	first_name VARCHAR(225) NOT NULL, 
	last_name VARCHAR(225) NOT NULL, 
	phone_number VARCHAR(10) NOT NULL, 
	
	PRIMARY KEY (id), 
	UNIQUE (user_email)
) ENGINE = InnoDB;


CREATE TABLE employee_roles (
	id INT NOT NULL,
	role VARCHAR(225) NOT NULL,

	PRIMARY KEY (id),
	UNIQUE (role)
) ENGINE = InnoDB;


CREATE TABLE users_employees (
	id INT NOT NULL AUTO_INCREMENT, 
	user_email VARCHAR(225) NOT NULL, 
	first_name VARCHAR(225) NOT NULL, 
	last_name VARCHAR(225) NOT NULL, 
	password VARCHAR(225) NOT NULL,
	sin_number VARCHAR(9),
	role_id INT NOT NULL,
	
	PRIMARY KEY (id), 
	UNIQUE (user_email),
	CONSTRAINT fk_users_employees_role_id FOREIGN KEY (role_id) REFERENCES employee_roles(id) ON DELETE RESTRICT ON UPDATE CASCADE	
) ENGINE = InnoDB;


CREATE TABLE drivers (
	id INT NOT NULL AUTO_INCREMENT, 	
	id_prefix VARCHAR(3) NOT NULL DEFAULT "d_", 
	employee_id INT NOT NULL,

	PRIMARY KEY (id),
	UNIQUE (employee_id),
	CONSTRAINT fk_drivers_employee_id FOREIGN KEY (employee_id) REFERENCES users_employees(id) ON DELETE RESTRICT ON UPDATE CASCADE	
) ENGINE = InnoDB;


CREATE TABLE drivers_shift_history (
	id INT NOT NULL AUTO_INCREMENT,
	driver_id INT NOT NULL,
	shift_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	shift_end TIMESTAMP,

	PRIMARY KEY (id),
	CONSTRAINT fk_drivers_shift_history_driver_id FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT ON UPDATE CASCADE	
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
	CONSTRAINT fk_catalog_categories_super_category_id FOREIGN KEY (super_category_id) REFERENCES catalog_super_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE	
) ENGINE = InnoDB;


CREATE TABLE catalog_subcategories ( 
	id INT NOT NULL, 
	name VARCHAR(225) NOT NULL, 
	category_id INT NOT NULL, 
	
	PRIMARY KEY (id), 
	CONSTRAINT fk_catalog_subcategories_category_id FOREIGN KEY (category_id) REFERENCES catalog_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE catalog_types ( 
	id INT NOT NULL, 
	name VARCHAR(225) NOT NULL, 
	subcategory_id INT NOT NULL, 
	
	PRIMARY KEY (id), 
	CONSTRAINT fk_catalog_types_subcategory_id FOREIGN KEY (subcategory_id) REFERENCES catalog_subcategories(id) ON DELETE RESTRICT ON UPDATE CASCADE
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
	id INT NOT NULL, 
	product_brand VARCHAR(225), 
	product_name VARCHAR(225), 
	product_description VARCHAR(225),
	product_country VARCHAR(225),
	type_id INT NOT NULL, 
	
	PRIMARY KEY (id), 
	CONSTRAINT fk_catalog_listings_type_id FOREIGN KEY (type_id) REFERENCES catalog_types(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE catalog_products ( 
	id INT NOT NULL, 
	listing_id INT NOT NULL, 
	container_id INT NOT NULL, 
	product_image VARCHAR(225),
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_products_listing_id FOREIGN KEY (listing_id) REFERENCES catalog_listings(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_catalog_products_container_id FOREIGN KEY (container_id) REFERENCES catalog_containers(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE catalog_depot ( 
	id INT NOT NULL, 
	product_id INT NOT NULL, 
	packaging_id INT NOT NULL, 
	packaging_volume_id INT NOT NULL,
	price DECIMAL(6,2) NOT NULL, 
	quantity INT NOT NULL, 
	
	PRIMARY KEY (id), 
	CONSTRAINT fk_catalog_depot_product_id FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_catalog_depot_packaging_id FOREIGN KEY (packaging_id) REFERENCES catalog_packagings(id) ON DELETE RESTRICT ON UPDATE CASCADE, 
	CONSTRAINT fk_catalog_depot_packaging_volume_id FOREIGN KEY (packaging_volume_id) REFERENCES catalog_packaging_volumes(id) ON DELETE RESTRICT ON UPDATE CASCADE	
) ENGINE = InnoDB;


CREATE TABLE stores (
	id INT NOT NULL AUTO_INCREMENT,
	id_prefix VARCHAR(3) NOT NULL DEFAULT "s_", 
	name VARCHAR(225) NOT NULL,
	address VARCHAR(225) NOT NULL,
	store_type INT NOT NULL,

	PRIMARY KEY (id),
	CONSTRAINT fk_stores_store_type FOREIGN KEY (store_type) REFERENCES catalog_super_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE		
 ) ENGINE = InnoDB;


CREATE TABLE user_cart_info ( 
	id INT NOT NULL AUTO_INCREMENT, 
	user_id INT NOT NULL, 
	depot_id INT NOT NULL, 
	quantity INT NOT NULL,
	
	PRIMARY KEY (id), 
	UNIQUE (user_id, depot_id), 
	CONSTRAINT fk_user_cart_info_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_user_cart_info_depot_id FOREIGN KEY (depot_id) REFERENCES catalog_depot(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE orders_history (
	id INT NOT NULL AUTO_INCREMENT,
	id_prefix VARCHAR(3) NOT NULL DEFAULT "o_", 
	user_id INT,
	guest_id INT,
	date_placed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_assigned TIMESTAMP,
	date_picked TIMESTAMP,
	date_delivered TIMESTAMP,
	delivery_address VARCHAR(225) NOT NULL,
	store_id INT,
	driver_id INT,
	order_received_name VARCHAR(225),
	order_received_age INT,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_orders_history_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT fk_orders_history_guest_id FOREIGN KEY (guest_id) REFERENCES users_customers_guest(id) ON DELETE SET NULL ON UPDATE CASCADE,	
	CONSTRAINT fk_orders_history_store_id FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_orders_history_driver_id FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT ON UPDATE CASCADE
	
) ENGINE = InnoDB;


CREATE TABLE orders_cart_info ( 
	id INT NOT NULL AUTO_INCREMENT,
	order_id INT NOT NULL,	 
	depot_id INT NOT NULL, 
	quantity VARCHAR(225) NOT NULL,
	price_sold DECIMAL(6,2) NOT NULL,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_orders_cart_info_order_id FOREIGN KEY (order_id) REFERENCES orders_history(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_orders_cart_info_depot_id FOREIGN KEY (depot_id) REFERENCES catalog_depot(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;
