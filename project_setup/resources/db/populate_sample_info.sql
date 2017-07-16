/* Inserts dummy data into tables */
INSERT INTO `delivery_db`.`catalog_categories` (`id`, `name`) VALUES ('1', 'Beers'), ('2', 'Wines'), ('3', 'Spirits'), ('4', 'Others');
INSERT INTO `delivery_db`.`catalog_subcategories` (`id`, `name`, `category_id`) VALUES (NULL, 'Beer', '1');
INSERT INTO `delivery_db`.`catalog_types` (`id`, `name`, `subcategory_id`) VALUES (NULL, 'Ales', '1'), (NULL, 'Lagers', '1'), (NULL, 'Stouts & Porters', '1'), (NULL, 'Malts', '1');
INSERT INTO `delivery_db`.`catalog_packagings` (`id`, `name`, `category_id`) VALUES (NULL, '6 pack', '1'), (NULL, '12 pack', '1'), (NULL, '24 pack', '1'), (NULL, '48 pack', '1');
INSERT INTO `delivery_db`.`catalog_products` (`id`, `product_brand`, `product_name`, `product_description`, `product_image`, `type_id`) VALUES (NULL, 'Molson', 'Canadian', 'Beer Description 1', 'resources\\images\\products\\beers\\ci_512.jpg', '2'), (NULL, 'Stella', 'Artois', 'Beer Description 2', 'resources\\images\\products\\beers\\ci_4868.jpg', '2'), (NULL, 'Coors', 'Light', 'Beer description 3', 'resources\\images\\products\\beers\\ci_2801.jpg', '2'), (NULL, 'Bud', 'Light', 'This is Bud light. It is an ale.', 'resources\\images\\products\\beers\\ci_2252.jpg', '1'), (NULL, 'Budweiser', 'Budweiser', 'This is Budweiser. It is Stout.', 'resources\\images\\products\\beers\\ci_2256.jpg', '3'), (NULL, 'Corona', 'Extra', 'This is corona. it is Malt.', 'resources\\images\\products\\beers\\ci_2822.jpg', '4'), (NULL, 'Victoria', 'Victoria', 'This is ale.', 'resources\\images\\products\\beers\\ci_512.jpg', '1'), (NULL, 'Guinness', 'Draught', 'This is guinness. it is Stout.', 'resources\\images\\products\\beers\\ci_4919.jpg', '3');
INSERT INTO `delivery_db`.`catalog_warehouse` (`id`, `packaging_id`, `price`, `product_id`, `quantity`) VALUES (NULL, '1', '24.87', '1', '123'), (NULL, '2', '32', '1', '11'), (NULL, '3', '46', '1', '54'), (NULL, '1', '23', '2', '12'), (NULL, '3', '45', '2', '23'), (NULL, '3', '56', '3', '345'), (NULL, '4', '87', '3', '56'), (NULL, '1', '24', '4', '87'), (NULL, '3', '54', '4', '87'), (NULL, '1', '18', '5', '23'), (NULL, '2', '45', '5', '45'), (NULL, '3', '36', '6', '0'), (NULL, '4', '68', '6', '20'), (NULL, '1', '12', '7', '11'), (NULL, '2', '20', '7', '34'), (NULL, '2', '34', '8', '23'), (NULL, '3', '49', '8', '43');

/* Dummy wines */
INSERT INTO `delivery_db`.`catalog_subcategories` (`id`, `name`, `category_id`) VALUES (NULL, 'White', '2'), (NULL, 'Red', '2'), (NULL, 'Champagne', '2');
INSERT INTO `delivery_db`.`catalog_packagings` (`id`, `name`, `category_id`) VALUES (NULL, '375 ml', '2'), (NULL, '750 ml', '2'), (NULL, '1.5 l', '2');
INSERT INTO `delivery_db`.`catalog_types` (`id`, `name`, `subcategory_id`) VALUES (NULL, 'Sweet', '2'), (NULL, 'Semi Sweet', '2'), (NULL, 'Dry', '2');
INSERT INTO `delivery_db`.`catalog_products` (`id`, `product_brand`, `product_name`, `product_description`, `product_image`, `type_id`) VALUES (NULL, 'The Pinot Project', 'Pinot Noir', 'This wine is good wine', 'resources\\images\\products\\wines\\ci_235.jpg', '5'), (NULL, 'Alamos', 'Malbec', 'This wine is good wine.', 'resources\\images\\products\\wines\\ci_601.jpg', '6'), (NULL, 'Apothic', 'Red', 'Very tasty wine', 'resources\\images\\products\\wines\\ci_720.jpg', '5'), (NULL, 'Josh Cellars', 'Cabernet Sauvignon', 'Good wine.', 'resources\\images\\products\\wines\\ci_20877.jpg', '7');

INSERT INTO `delivery_db`.`catalog_types` (`id`, `name`, `subcategory_id`) VALUES (NULL, 'Sweet', '3'), (NULL, 'Semi Sweet', '3'), (NULL, 'Dry', '3');
INSERT INTO `delivery_db`.`catalog_products` (`id`, `product_brand`, `product_name`, `product_description`, `product_image`, `type_id`) VALUES (NULL, 'Oyster Bay', 'Sauvignon Blanc', 'This wine is good wine', 'resources\\images\\products\\wines\\ci_3756.jpg', '8'), (NULL, 'Barefoot', 'Pinot Grigio', 'This wine is good wine.', 'resources\\images\\products\\wines\\ci_1838.jpg', '9'), (NULL, 'Starborough', 'Sauvignon Blanc', 'Very tasty wine', 'resources\\images\\products\\wines\\ci_720.jpg', '10'), (NULL, 'White Haven', 'Sauvignon Blanc', 'Good wine.', 'resources\\images\\products\\wines\\ci_2098.jpg', '8');

INSERT INTO `delivery_db`.`catalog_types` (`id`, `name`, `subcategory_id`) VALUES (NULL, 'Sweet', '4'), (NULL, 'Semi Sweet', '4'), (NULL, 'Dry', '4');
INSERT INTO `delivery_db`.`catalog_products` (`id`, `product_brand`, `product_name`, `product_description`, `product_image`, `type_id`) VALUES (NULL, 'La Marca', 'Prosecco', 'This wine is good wine', 'resources\\images\\products\\wines\\ci_1354.jpg', '11'), (NULL, 'Veuve Clicquot', 'Yellow Label', 'This wine is good wine.', 'resources\\images\\products\\wines\\ci_496.jpg', '12'), (NULL, 'Barefoot', 'Moscato', 'Very tasty wine', 'resources\\images\\products\\wines\\ci_1836.jpg', '12'), (NULL, 'Barefoot', 'Pink Moscato', 'Good wine.', 'resources\\images\\products\\wines\\ci_1837.jpg', '13');

INSERT INTO `delivery_db`.`catalog_warehouse` (`id`, `packaging_id`, `price`, `product_id`, `quantity`) VALUES (NULL, '5', '24.87', '9', '123'), (NULL, '6', '32', '10', '11'), (NULL, '7', '46', '11', '54'), (NULL, '5', '23', '12', '12'), (NULL, '6', '45', '13', '23'), (NULL, '7', '56', '14', '345'), (NULL, '7', '87', '15', '56'), (NULL, '6', '24', '16', '87'), (NULL, '5', '54', '17', '87'), (NULL, '6', '18', '18', '23'), (NULL, '7', '45', '19', '45'), (NULL, '5', '36', '20', '12');