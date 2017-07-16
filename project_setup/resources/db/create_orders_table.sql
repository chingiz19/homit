use delivery_db;

DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
	id int PRIMARY KEY,
	user_info int NOT NULL,
	card_info int NOT NULL,
	driver_info int NOT NULL,
	date_received timestamp NOT NULL,
	date_delivered timestamp NOT NULL,
	status varchar(255) NOT NULL,
	address varchar(255) NOT NULL,
	store_address varchar(255) NOT NULL,
	
	FOREIGN KEY (user_info) REFERENCES users_customers(id) ON DELETE CASCADE,
	FOREIGN KEY (card_info) REFERENCES user_cart_info(id) ON DELETE CASCADE
);