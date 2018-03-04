/*
* This scripts creates tables for the database.
*/


use homit;


CREATE TABLE catalog_store_types ( 
	id INT UNSIGNED NOT NULL, 
	name VARCHAR(225) NOT NULL,
	display_name VARCHAR(225) NOT NULL,	
	image VARCHAR(225),  
	api_name VARCHAR(225) NOT NULL,		
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;


CREATE TABLE catalog_stores (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	id_prefix VARCHAR(3) NOT NULL DEFAULT "s_", 
	name VARCHAR(225) NOT NULL,
	address VARCHAR(225) NOT NULL,
	address_latitude DOUBLE NOT NULL,
	address_longitude DOUBLE NOT NULL,
	phone_number VARCHAR(10),	
	store_type INT UNSIGNED NOT NULL,
	open_time TIME,
	close_time TIME,
	open_time_next TIME,
	close_time_next TIME,

	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_stores_store_type FOREIGN KEY (store_type) REFERENCES catalog_store_types(id) ON DELETE RESTRICT ON UPDATE CASCADE		
 ) ENGINE = InnoDB; 


CREATE TABLE catalog_packaging_containers (
	id INT UNSIGNED NOT NULL,
	name VARCHAR(225) NOT NULL,
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;


CREATE TABLE catalog_packaging_volumes (
	id INT UNSIGNED NOT NULL,
	name VARCHAR(225) NOT NULL,
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;


CREATE TABLE catalog_packaging_packagings (
	id INT UNSIGNED NOT NULL,
	name VARCHAR(225) NOT NULL,
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;


CREATE TABLE catalog_description_names (
	id INT UNSIGNED NOT NULL,
	name VARCHAR(225),
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;


CREATE TABLE catalog_categories (
	id INT UNSIGNED NOT NULL,
	name VARCHAR(225) NOT NULL,
	display_name VARCHAR(225) NOT NULL,
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;


CREATE TABLE catalog_subcategories (
	id INT UNSIGNED NOT NULL,
	name VARCHAR(225) NOT NULL,
	category_id INT UNSIGNED NOT NULL,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_subcategories_category_id FOREIGN KEY (category_id) REFERENCES catalog_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE catalog_types (
	id INT UNSIGNED NOT NULL,
	name VARCHAR(225) NOT NULL,
	subcategory_id INT UNSIGNED NOT NULL,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_types_subcategory_id FOREIGN KEY (subcategory_id) REFERENCES catalog_subcategories(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE catalog_listings (
	id INT UNSIGNED NOT NULL,
	brand VARCHAR(225),
	name VARCHAR(225),
	type_id INT UNSIGNED NOT NULL,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_listings_type_id FOREIGN KEY (type_id) REFERENCES catalog_types(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE catalog_listings_descriptions (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	listing_id INT UNSIGNED NOT NULL,
	description_key INT UNSIGNED NOT NULL,
	description VARCHAR(225),
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_listings_descriptions_listing_id FOREIGN KEY (listing_id) REFERENCES catalog_listings(id) ON DELETE RESTRICT ON UPDATE CASCADE,	
	CONSTRAINT fk_catalog_listings_descriptions_key FOREIGN KEY (description_key) REFERENCES catalog_description_names(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE catalog_products (
	id INT UNSIGNED NOT NULL,
	listing_id INT UNSIGNED NOT NULL,
	image VARCHAR(225),
	container_id INT UNSIGNED NOT NULL,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_products_listing_id FOREIGN KEY (listing_id) REFERENCES catalog_listings(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_catalog_products_container_id FOREIGN KEY (container_id) REFERENCES catalog_packaging_containers(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE catalog_items (
	id INT UNSIGNED NOT NULL,
	product_id INT UNSIGNED NOT NULL,
	packaging_id INT UNSIGNED NOT NULL,
	volume_id INT UNSIGNED NOT NULL,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_items_product_id FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_catalog_items_packaging_id FOREIGN KEY (packaging_id) REFERENCES catalog_packaging_packagings(id) ON DELETE RESTRICT ON UPDATE CASCADE, 
	CONSTRAINT fk_catalog_items_volume_id FOREIGN KEY (volume_id) REFERENCES catalog_packaging_volumes(id) ON DELETE RESTRICT ON UPDATE CASCADE	
) ENGINE = InnoDB;


CREATE TABLE catalog_depot (
	id INT UNSIGNED NOT NULL,
	item_id INT UNSIGNED NOT NULL,
	store_type_id INT UNSIGNED NOT NULL,
	price DECIMAL(6,2) NOT NULL,
	tax BOOLEAN DEFAULT TRUE,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_depot_item_id FOREIGN KEY (item_id) REFERENCES catalog_items(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_catalog_depot_store_type_id FOREIGN KEY (store_type_id) REFERENCES catalog_store_types(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE catalog_warehouse (
	id INT UNSIGNED NOT NULL,
	depot_id INT UNSIGNED NOT NULL,
	store_id INT UNSIGNED NOT NULL,
	quantity INT NOT NULL,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_warehouse_depot_id FOREIGN KEY (depot_id) REFERENCES catalog_depot(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_catalog_warehouse_store_id FOREIGN KEY (store_id) REFERENCES catalog_stores(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE users_customers (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	id_prefix VARCHAR(3) NOT NULL DEFAULT "u_",
	user_email VARCHAR(225) NOT NULL,
	first_name VARCHAR(225) NOT NULL,
	last_name VARCHAR(225) NOT NULL,
	password VARCHAR(225) NOT NULL,
	phone_number VARCHAR(10),
	birth_date DATE NULL,
	address1 VARCHAR(225),
	address1_name VARCHAR(225),
	address1_latitude DOUBLE,
	address1_longitude DOUBLE,
	card_token VARCHAR(225) NULL,
	card_type VARCHAR(225) NULL,
	card_digits VARCHAR(4) NULL,
	
	PRIMARY KEY (id),
	UNIQUE (user_email)
) ENGINE = InnoDB;


CREATE TABLE users_customers_history (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	user_id INT UNSIGNED NOT NULL,
	user_email VARCHAR(225),
	first_name VARCHAR(225),
	last_name VARCHAR(225),
	phone_number VARCHAR(10),
	birth_date DATE NULL,
	address1 VARCHAR(225),
	address1_name VARCHAR(225),
	address1_latitude DOUBLE,
	address1_longitude DOUBLE,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_users_customers_history_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE users_customers_guest (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	id_prefix VARCHAR(3) NOT NULL DEFAULT "g_",
	user_email VARCHAR(225) NOT NULL,
	first_name VARCHAR(225) NOT NULL,
	last_name VARCHAR(225) NOT NULL,
	phone_number VARCHAR(10) NOT NULL,
	birth_date DATE NULL,
	
	PRIMARY KEY (id),
	UNIQUE (user_email)
) ENGINE = InnoDB;


CREATE TABLE employee_roles (
	id INT UNSIGNED NOT NULL,
	role VARCHAR(225) NOT NULL,

	PRIMARY KEY (id),
	UNIQUE (role)
) ENGINE = InnoDB;


CREATE TABLE users_employees (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT, 
	user_email VARCHAR(225) NOT NULL, 
	first_name VARCHAR(225) NOT NULL, 
	last_name VARCHAR(225) NOT NULL, 
	password VARCHAR(225) NOT NULL,
	sin_number VARCHAR(9),
	phone_number VARCHAR(10),
	role_id INT UNSIGNED NOT NULL,
	
	PRIMARY KEY (id), 
	UNIQUE (user_email),
	CONSTRAINT fk_users_employees_role_id FOREIGN KEY (role_id) REFERENCES employee_roles(id) ON DELETE RESTRICT ON UPDATE CASCADE	
) ENGINE = InnoDB;


CREATE TABLE drivers (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT, 	
	id_prefix VARCHAR(3) NOT NULL DEFAULT "d_", 
	user_email VARCHAR(225) NOT NULL, 
	first_name VARCHAR(225) NOT NULL, 
	last_name VARCHAR(225) NOT NULL, 
	password VARCHAR(225) NOT NULL,
	sin_number VARCHAR(9),
	phone_number VARCHAR(10),

	PRIMARY KEY (id),
	UNIQUE (user_email)
) ENGINE = InnoDB;


CREATE TABLE drivers_shift_history (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	driver_id INT UNSIGNED NOT NULL,
	shift_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	shift_end TIMESTAMP NULL,

	PRIMARY KEY (id),
	CONSTRAINT fk_drivers_shift_history_driver_id FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT ON UPDATE CASCADE	
) ENGINE = InnoDB;


CREATE TABLE drivers_status (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	driver_id INT UNSIGNED NOT NULL,
	socket_id VARCHAR(225),
	latitude DOUBLE,
	longitude DOUBLE,
	online BOOLEAN DEFAULT FALSE,
	connected BOOLEAN DEFAULT TRUE,

	PRIMARY KEY(id),
	UNIQUE(driver_id),
	UNIQUE(socket_id)
) ENGINE = Memory;


CREATE TABLE user_cart_items ( 
	id INT UNSIGNED NOT NULL AUTO_INCREMENT, 
	user_id INT UNSIGNED NOT NULL, 
	depot_id INT UNSIGNED NOT NULL, 
	quantity INT NOT NULL,
	
	PRIMARY KEY (id), 
	UNIQUE (user_id, depot_id), 
	CONSTRAINT fk_user_cart_items_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_user_cart_items_depot_id FOREIGN KEY (depot_id) REFERENCES catalog_depot(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE orders_transactions_history (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	id_prefix VARCHAR(3) NOT NULL DEFAULT "t_", 
	user_id INT UNSIGNED,
	guest_id INT UNSIGNED,
	charge_id VARCHAR(225) NOT NULL,
	card_digits VARCHAR(4) NOT NULL,
	total_price DECIMAL(6,2) NOT NULL,
	total_amount DECIMAL(6,2) NOT NULL,
	delivery_fee DECIMAL(6,2) NOT NULL,
	total_tax DECIMAL(6,2) NOT NULL,
	date_placed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	delivery_address VARCHAR(225) NOT NULL,
	delivery_latitude DOUBLE NOT NULL,
	delivery_longitude DOUBLE NOT NULL,
	driver_instruction VARCHAR(225),
	
	PRIMARY KEY (id),
	UNIQUE (charge_id),
	CONSTRAINT fk_orders_transactions_history_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT fk_orders_transactions_history_guest_id FOREIGN KEY (guest_id) REFERENCES users_customers_guest(id) ON DELETE SET NULL ON UPDATE CASCADE

) ENGINE = InnoDB;


CREATE TABLE orders_history (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	id_prefix VARCHAR(3) NOT NULL DEFAULT "o_", 
	order_transaction_id INT UNSIGNED NOT NULL,
	date_assigned TIMESTAMP NULL,
	date_arrived_store TIMESTAMP NULL,
	date_picked TIMESTAMP NULL,
	date_arrived_customer TIMESTAMP NULL,	
	date_delivered TIMESTAMP NULL,
	store_type INT UNSIGNED NOT NULL,
	store_id INT UNSIGNED,
	driver_id INT UNSIGNED,
	refused BOOLEAN,
	receiver_name VARCHAR(225),
	receiver_age INT,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_orders_history_store_type FOREIGN KEY (store_type) REFERENCES catalog_store_types(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_orders_history_store_id FOREIGN KEY (store_id) REFERENCES catalog_stores(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_orders_history_driver_id FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_orders_history_order_transaction_id FOREIGN KEY (order_transaction_id) REFERENCES orders_transactions_history(id) ON DELETE RESTRICT ON UPDATE CASCADE
	
) ENGINE = InnoDB;


CREATE TABLE orders_cart_items ( 
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	order_id INT UNSIGNED NOT NULL,	 
	depot_id INT UNSIGNED NOT NULL, 
	quantity VARCHAR(225) NOT NULL,
	price_sold DECIMAL(6,2) NOT NULL,
	modified_quantity INT NULL,
	tax BOOLEAN NOT NULL,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_orders_cart_items_order_id FOREIGN KEY (order_id) REFERENCES orders_history(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_orders_cart_items_depot_id FOREIGN KEY (depot_id) REFERENCES catalog_depot(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE drivers_routes (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	driver_id INT UNSIGNED NOT NULL,
	store_id INT UNSIGNED,
	order_id INT UNSIGNED,
	position INT NOT NULL,

	PRIMARY KEY(id)
) ENGINE = Memory;


CREATE TABLE drivers_request (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	driver_id INT UNSIGNED NOT NULL,
	order_info JSON NOT NULL,

	PRIMARY KEY(id)
) ENGINE = InnoDB;


CREATE TABLE orders_emails (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	transaction_id INT UNSIGNED NOT NULL,
	email JSON NOT NULL,

	PRIMARY KEY(id)
) ENGINE = InnoDB;


CREATE TABLE csr_actions (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	csr_id INT UNSIGNED NOT NULL,
	note VARCHAR(225),

	PRIMARY KEY(id),
	CONSTRAINT fk_csr_actions_csr_id FOREIGN KEY (csr_id) REFERENCES users_employees(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE orders_history_refund (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	order_id INT UNSIGNED NOT NULL,
	csr_action_id INT UNSIGNED NOT NULL,
	transaction_id INT,
	refund_amount DECIMAL(6,2),
	date_placed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_picked TIMESTAMP NULL,
	date_refunded TIMESTAMP NULL,
	driver_id INT UNSIGNED,
	date_scheduled TIMESTAMP NULL,
	date_scheduled_note VARCHAR(225),	
	
	PRIMARY KEY (id),
	CONSTRAINT fk_orders_history_refund_order_id FOREIGN KEY (order_id) REFERENCES orders_history(id) ON DELETE RESTRICT ON UPDATE CASCADE,	
	CONSTRAINT fk_orders_history_refund_driver_id FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_orders_history_refund_csr_action_id FOREIGN KEY (csr_action_id) REFERENCES csr_actions(id) ON DELETE RESTRICT ON UPDATE CASCADE	
) ENGINE = InnoDB;


CREATE TABLE orders_history_cancel (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	order_id INT UNSIGNED NOT NULL,
	csr_action_id INT UNSIGNED NOT NULL,
	transaction_id INT,
	refund_amount DECIMAL(6,2),	
	date_placed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	date_refunded TIMESTAMP NULL,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_orders_history_cancel_order_id FOREIGN KEY (order_id) REFERENCES orders_history(id) ON DELETE RESTRICT ON UPDATE CASCADE,	
	CONSTRAINT fk_orders_history_cancel_csr_action_id FOREIGN KEY (csr_action_id) REFERENCES csr_actions(id) ON DELETE RESTRICT ON UPDATE CASCADE	
) ENGINE = InnoDB;


CREATE TABLE orders_history_add (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	order_id INT UNSIGNED NOT NULL,
	csr_action_id INT UNSIGNED NOT NULL,
	charge_amount DECIMAL(6,2),
	
	PRIMARY KEY (id),
	CONSTRAINT fk_orders_history_add_order_id FOREIGN KEY (order_id) REFERENCES orders_history(id) ON DELETE RESTRICT ON UPDATE CASCADE,	
	CONSTRAINT fk_orders_history_add_csr_action_id FOREIGN KEY (csr_action_id) REFERENCES csr_actions(id) ON DELETE RESTRICT ON UPDATE CASCADE	
) ENGINE = InnoDB;