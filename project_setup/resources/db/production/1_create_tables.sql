/*
* This scripts creates tables for the database.
*/

use homit;

CREATE TABLE catalog_store_types ( 
	id INT UNSIGNED NOT NULL, 
	name VARCHAR(225) NOT NULL,
	display_name VARCHAR(225) NOT NULL,	
	image VARCHAR(225),  
	available BOOLEAN DEFAULT TRUE,
	union_id INT UNSIGNED, 
	del_fee_primary DOUBLE DEFAULT 4.99,
	rate_id INT UNSIGNED,
	
	PRIMARY KEY (id),
	UNIQUE(name),
	UNIQUE(display_name)
) ENGINE = InnoDB;

CREATE TABLE catalog_store_unions ( 
	id INT UNSIGNED NOT NULL, 
	name VARCHAR(225) NOT NULL,
	display_name VARCHAR(225) NOT NULL,	
	image VARCHAR(225),
	description_text TEXT NOT NULL,  
	
	PRIMARY KEY (id),
	UNIQUE(name),
	UNIQUE(display_name)
) ENGINE = InnoDB;

CREATE TABLE catalog_coupons (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	total_percentage_off DECIMAL(6,2),
	total_price_off DECIMAL(6,2),
	if_total_more DECIMAL(6,2),
	store_type_id INT UNSIGNED,
	code VARCHAR(225) NOT NULL,
	message_invoice VARCHAR(225) NOT NULL,
	message VARCHAR(225) NOT NULL,
	privacy_type INT NOT NULL,
	date_expiry TIMESTAMP NOT NULL,

	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_coupons_store_type_id FOREIGN KEY (store_type_id) REFERENCES catalog_store_types(id) ON DELETE RESTRICT ON UPDATE CASCADE
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
	display_name VARCHAR(225),
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;


CREATE TABLE catalog_image_names (
	id INT UNSIGNED NOT NULL,
	name VARCHAR(225),
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;


CREATE TABLE catalog_categories (
	id INT UNSIGNED NOT NULL,
	name VARCHAR(225) NOT NULL,
	display_name VARCHAR(225) NOT NULL,
	image VARCHAR(225) NOT NULL,
	
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
	description VARCHAR(1500),
	
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


CREATE TABLE catalog_products_images (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	product_id INT UNSIGNED NOT NULL,
	image_key INT UNSIGNED NOT NULL,
	image VARCHAR(225),
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_products_images_product_id FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE RESTRICT ON UPDATE CASCADE,	
	CONSTRAINT fk_catalog_products_images_image_key FOREIGN KEY (image_key) REFERENCES catalog_image_names(id) ON DELETE RESTRICT ON UPDATE CASCADE
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
	available BOOLEAN DEFAULT TRUE,
	
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
	stripe_customer_id VARCHAR(225) NOT NULL,
	address VARCHAR(225),
	address_latitude DOUBLE NULL,
	address_longitude DOUBLE NULL,
	address_unit_number VARCHAR(225),
	date_signedup TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	email_verified BOOLEAN DEFAULT FALSE,

	PRIMARY KEY (id),
	UNIQUE (user_email),
	UNIQUE (stripe_customer_id)
) ENGINE = InnoDB;


CREATE TABLE users_customers_history (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	user_id INT UNSIGNED NOT NULL,
	user_email VARCHAR(225),
	first_name VARCHAR(225),
	last_name VARCHAR(225),
	phone_number VARCHAR(10),
	birth_date DATE NULL,
	address VARCHAR(225),
	address_unit_number VARCHAR(225),	
	updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,	
	
	PRIMARY KEY (id),
	CONSTRAINT fk_users_customers_history_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE users_customers_guest (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	id_prefix VARCHAR(3) NOT NULL DEFAULT "g_",
	user_email VARCHAR(225) NOT NULL,
	first_name VARCHAR(225) NOT NULL,
	last_name VARCHAR(225) NOT NULL,
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
	driver_id INT UNSIGNED NOT NULL,
	token VARCHAR(225),
	latitude DOUBLE,
	longitude DOUBLE,
	online BOOLEAN DEFAULT FALSE,

	UNIQUE(driver_id),
	UNIQUE(token)
) ENGINE = Memory;


CREATE TABLE user_cart_items ( 
	id INT UNSIGNED NOT NULL AUTO_INCREMENT, 
	user_id INT UNSIGNED NOT NULL, 
	depot_id VARCHAR(225) NOT NULL,
	quantity INT NOT NULL,
	
	PRIMARY KEY (id), 
	UNIQUE (user_id, depot_id), 
	CONSTRAINT fk_user_cart_items_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE CASCADE ON UPDATE CASCADE
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
	original_price DECIMAL(6,2) NOT NULL,
	coupon_applied INT UNSIGNED,
	total_tax DECIMAL(6,2) NOT NULL,
	date_placed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	delivery_address VARCHAR(225) NOT NULL,
	delivery_latitude DOUBLE NOT NULL,
	delivery_longitude DOUBLE NOT NULL,
	driver_instruction VARCHAR(225),
	unit_number VARCHAR(225),
	phone_number VARCHAR(10),
	
	PRIMARY KEY (id),
	UNIQUE (charge_id),
	CONSTRAINT fk_orders_transactions_history_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT fk_orders_transactions_history_guest_id FOREIGN KEY (guest_id) REFERENCES users_customers_guest(id) ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT fk_orders_transactions_history_coupon_applied FOREIGN KEY (coupon_applied) REFERENCES catalog_coupons(id) ON DELETE SET NULL ON UPDATE CASCADE 

) ENGINE = InnoDB;


CREATE TABLE orders_history (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	id_prefix VARCHAR(3) NOT NULL DEFAULT "o_", 
	order_transaction_id INT UNSIGNED NOT NULL,
	total_price DECIMAL(6,2) NOT NULL,
	total_amount DECIMAL(6,2) NOT NULL,
	delivery_fee DECIMAL(6,2) NOT NULL,
	original_price DECIMAL(6,2) NOT NULL,
	coupon_applied INT UNSIGNED,
	total_tax DECIMAL(6,2) NOT NULL,
	date_scheduled TIMESTAMP NULL,	
	date_assigned TIMESTAMP NULL,
	date_store_ready TIMESTAMP NULL,
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
	CONSTRAINT fk_orders_history_order_transaction_id FOREIGN KEY (order_transaction_id) REFERENCES orders_transactions_history(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_orders_history_coupon_applied FOREIGN KEY (coupon_applied) REFERENCES catalog_coupons(id) ON DELETE SET NULL ON UPDATE CASCADE 
	
) ENGINE = InnoDB;


CREATE TABLE orders_cart_items ( 
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	order_id INT UNSIGNED NOT NULL,	 
	depot_id VARCHAR(225) NOT NULL, 
	quantity VARCHAR(225) NOT NULL,
	price_sold DECIMAL(6,2) NOT NULL,
	modified_quantity INT NULL,
	tax BOOLEAN NOT NULL,
	store_ready BOOLEAN DEFAULT FALSE,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_orders_cart_items_order_id FOREIGN KEY (order_id) REFERENCES orders_history(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE drivers_routes (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	driver_id INT UNSIGNED NOT NULL,
	store_id INT UNSIGNED,
	order_id INT UNSIGNED,
	position INT NOT NULL,
	is_api_order TINYINT NOT NULL,
	is_custom_location TINYINT NOT NULL,

	PRIMARY KEY(id)
) ENGINE = Memory;

CREATE TABLE orders_emails (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	transaction_id INT UNSIGNED NOT NULL,
	email JSON NOT NULL,

	PRIMARY KEY(id)
) ENGINE = InnoDB;


CREATE TABLE stores_hours (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	store_id INT UNSIGNED NOT NULL,
	day TINYINT NOT NULL,
	open_time TIME,
	open_duration INT,
	open_time_scheduled TIME,
	open_duration_scheduled INT,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_stores_hours_store_id FOREIGN KEY (store_id) REFERENCES catalog_stores(id) ON DELETE RESTRICT ON UPDATE CASCADE
 ) ENGINE = InnoDB;


CREATE TABLE stores_authentication (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	store_id INT UNSIGNED NOT NULL,
	user_name VARCHAR(225) NOT NULL,
	password VARCHAR(225) NOT NULL,
	auth_token VARCHAR(225),	
	
	PRIMARY KEY (id),
	UNIQUE (user_name),
	CONSTRAINT fk_stores_authentication_store_id FOREIGN KEY (store_id) REFERENCES catalog_stores(id) ON DELETE RESTRICT ON UPDATE CASCADE
 ) ENGINE = InnoDB;


CREATE TABLE catalog_store_types_banners (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	store_type_id INT UNSIGNED NOT NULL,
	image VARCHAR(225) NOT NULL,
	category_name VARCHAR(225),
	subcategory_name VARCHAR(225),
	active BOOLEAN DEFAULT TRUE,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_store_types_banners_store_type_id FOREIGN KEY (store_type_id) REFERENCES catalog_store_types(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE catalog_store_types_special_types (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	api_name VARCHAR(225) NOT NULL,
	display_name VARCHAR(225) NOT NULL,
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;


CREATE TABLE catalog_store_types_special_products (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	store_type_id INT UNSIGNED NOT NULL,
	product_id INT UNSIGNED NOT NULL,
	special_type_id INT UNSIGNED NOT NULL,
	active BOOLEAN DEFAULT TRUE,
	
	PRIMARY KEY (id),
	CONSTRAINT fk_catalog_store_types_special_products_store_type_id FOREIGN KEY (store_type_id) REFERENCES catalog_store_types(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_catalog_store_types_special_products_product_id FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT fk_catalog_store_types_special_products_special_type_id FOREIGN KEY (special_type_id) REFERENCES catalog_store_types_special_types(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE catalog_hub_special_types (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	api_name VARCHAR(225) NOT NULL,
	display_name VARCHAR(225) NOT NULL,
	
	PRIMARY KEY (id)
) ENGINE = InnoDB;


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

CREATE TABLE user_coupons (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	user_id INT UNSIGNED NOT NULL,
	coupon_id INT UNSIGNED NOT NULL,
	trials_limit INT NOT NULL,
	applied BOOLEAN DEFAULT FALSE,

	PRIMARY KEY (id),
	CONSTRAINT fk_user_coupons_user_id FOREIGN KEY (user_id) REFERENCES users_customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_user_coupons_coupon_id FOREIGN KEY (coupon_id) REFERENCES catalog_coupons(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;


CREATE TABLE catalog_store_types_category_covers ( 
	id INT UNSIGNED NOT NULL AUTO_INCREMENT, 
	store_type_id INT UNSIGNED NOT NULL,
	category_id INT UNSIGNED NOT NULL,
	cover_image VARCHAR(225) NOT NULL,

	PRIMARY KEY (id),
	UNIQUE (store_type_id, category_id),
	CONSTRAINT fk_catalog_store_types_category_covers_store_type_id FOREIGN KEY (store_type_id) REFERENCES catalog_store_types(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_catalog_store_types_category_covers_category_id FOREIGN KEY (category_id) REFERENCES catalog_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE api_orders_history (
	id INT UNSIGNED NOT NULL AUTO_INCREMENT,
	client_id VARCHAR(225) NOT NULL,
	id_prefix VARCHAR(3) NOT NULL DEFAULT "a_", 
	first_name VARCHAR(225) NOT NULL,
	last_name VARCHAR(225) NOT NULL,
	phone_number VARCHAR(10),
	address VARCHAR(225),
	address_latitude DOUBLE NULL,
	address_longitude DOUBLE NULL,
	driver_instruction VARCHAR(225),
	date_assigned TIMESTAMP NULL,
	date_arrived_store TIMESTAMP NULL,
	date_picked TIMESTAMP NULL,
	date_arrived_customer TIMESTAMP NULL,	
	store_type INT UNSIGNED NOT NULL,
	pickup_location_id INT UNSIGNED,
	driver_id INT UNSIGNED,

	PRIMARY KEY (id)
) ENGINE = InnoDB;