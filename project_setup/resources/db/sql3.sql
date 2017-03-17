/* Inserts dummy data into tables */
INSERT INTO `delivery_db`.`catalog_categories` (`id`, `name`) VALUES (NULL, 'Beers'), (NULL, 'Wines'), (NULL, 'Spirits'), (NULL, 'Others');
INSERT INTO `delivery_db`.`catalog_subcategories` (`id`, `name`, `category_id`) VALUES (NULL, 'Red', '2'), (NULL, 'White', '2');
INSERT INTO `delivery_db`.`catalog_types` (`id`, `name`, `category_id`, `subcategory_id`) VALUES (NULL, 'Ales', '1', NULL), (NULL, 'Lagers', '1', NULL), (NULL, 'Stouts & Porters', '1', NULL), (NULL, 'Malts', '1', NULL);
INSERT INTO `delivery_db`.`catalog_packagings` (`id`, `name`, `category_id`) VALUES (NULL, '6 pack', '1'), (NULL, '12 pack', '1'), (NULL, '24 pack', '1'), (NULL, '48 pack', '1');
INSERT INTO `delivery_db`.`catalog_products` (`id`, `product_brand`, `product_name`, `product_description`, `product_image`, `type_id`) VALUES (NULL, 'Canadian', NULL, 'This beer is good.', 'image', '1'), (NULL, 'Miller', 'Pive', 'This beer is good as well.', 'image', '2')
INSERT INTO `delivery_db`.`catalog_listings` (`id`, `packaging_id`, `price`, `product_id`) VALUES (NULL, '1', '32.12', '1'), (NULL, '3', '12.23', '2');
INSERT INTO `delivery_db`.`catalog_warehouse` (`id`, `listing_id`, `quantity`) VALUES (NULL, '1', '122'), (NULL, '2', '432');