/* Inserts dummy data into tables */
INSERT INTO `delivery_db`.`catalog_categories` (`id`, `name`) VALUES ('1', 'Beers'), ('2', 'Wines'), ('3', 'Spirits'), ('4', 'Others');
INSERT INTO `delivery_db`.`catalog_subcategories` (`id`, `name`, `category_id`) VALUES (NULL, 'Beer', '1'), (NULL, 'Red', '2'), (NULL, 'White', '2'), (NULL, 'Brandy', '3'), (NULL, 'Rum', '4');
INSERT INTO `delivery_db`.`catalog_types` (`id`, `name`, `subcategory_id`) VALUES (NULL, 'Ales', '1'), (NULL, 'Lagers', '1'), (NULL, 'Stouts & Porters', '1'), (NULL, 'Malts', '1');
INSERT INTO `delivery_db`.`catalog_packagings` (`id`, `name`, `category_id`) VALUES (NULL, '6 pack', '1'), (NULL, '12 pack', '1'), (NULL, '24 pack', '1'), (NULL, '48 pack', '1');
INSERT INTO `delivery_db`.`catalog_products` (`id`, `product_brand`, `product_name`, `product_description`, `product_image`, `type_id`) VALUES (NULL, 'Canadian', NULL, 'This beer is good.', 'image', '1'), (NULL, 'Miller', 'Pive', 'This beer is good as well.', 'image', '2');
INSERT INTO `delivery_db`.`catalog_warehouse` (`id`, `packaging_id`, `price`, `product_id`, `quantity`) VALUES (NULL, '1', '32.12', '1' , '43'), (NULL, '3', '12.23', '2', '44');