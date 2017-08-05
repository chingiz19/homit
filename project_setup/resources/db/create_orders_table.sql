use delivery_db;

DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
	id int PRIMARY KEY,
	user_info int,
	tmp_user_info int,
	card_info int NOT NULL,
	driver_info int,
	date_received timestamp NOT NULL,
	date_delivered timestamp,
	status varchar(255) NOT NULL,
	delivery_address varchar(255) NOT NULL,
	store_address varchar(255) NOT NULL,
	
	FOREIGN KEY (user_info) REFERENCES users_customers(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (tmp_user_info) REFERENCES tmp_users(id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (card_info) REFERENCES order_cart_info(id) ON DELETE CASCADE ON UPDATE CASCADE
);