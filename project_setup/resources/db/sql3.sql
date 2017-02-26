/* Inserts dummy data into tables */
INSERT INTO `product_types` (`id`, `name`) VALUES (NULL, 'Wine'), (NULL, 'Beer');
INSERT INTO `product_list` (`id`, `product_type`, `product_name`, `product_description`, `product_price`, `product_image`) VALUES (NULL, '1', 'Canadian 6 pack', 'This beer is good.', '35.10', '/image/location'), (NULL, '2', 'Merlot', 'This wine is a good wine.', '34.10', '/image/location');
INSERT INTO `product_warehouse` (`id`, `product_id`, `quantity`) VALUES (NULL, '1', '35'), (NULL, '2', '12');