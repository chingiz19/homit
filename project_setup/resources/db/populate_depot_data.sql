/* Insert categories */
INSERT INTO `delivery_db`.`catalog_categories` (id,name) VALUES (1,'Beers');
INSERT INTO `delivery_db`.`catalog_categories` (id,name) VALUES (2,'Wines');
INSERT INTO `delivery_db`.`catalog_categories` (id,name) VALUES (3,'Spirits');
INSERT INTO `delivery_db`.`catalog_categories` (id,name) VALUES (4,'Others');

/* Insert subcategories*/
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (1,'Beers',1);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (2,'White',2);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (3,'Red',2);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (4,'Sparkling wine',2);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (5,'Fortified wine',2);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (6,'Whiskey',3);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (7,'Vodka',3);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (8,'Brandy',3);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (9,'Gin',3);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (10,'Rum',3);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (11,'Tequila',3);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (12,'Liquers',4);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (13,'Ice tea',4);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (14,'Pop',4);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (15,'Infused wine',4);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (16,'Juices',4);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (17,'None',2);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (18,'Others',4);


/* Insert types */
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (1,'Ale',1);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (2,'Lager',1);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (3,'Belgian',1);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (4,'Pilsner',1);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (5,'IPA',1);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (6,'Cider',1);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (7,'Fruit beer',1);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (8,'Moscato',2);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (9,'Sauvignon blanc',2);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (10,'Riesling',2);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (11,'Pinot Grigio',2);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (12,'Chardonnay',2);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (13,'Cabernet Sauvignon',3);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (14,'Malbec',3);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (15,'Merlot',3);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (16,'Pinot noir',3);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (17,'Shiraz',3);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (18,'Zinfandel',3);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (19,'Prosecco',4);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (20,'Rose',4);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (21,'Champagne',4);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (22,'Port wine',5);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (23,'Sherry',5);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (24,'Vermouth',5);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (25,'Palomino',5);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (26,'Bourbon',6);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (27,'Scotch',6);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (28,'Single malt',6);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (29,'Blended',6);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (30,'Irish',6);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (31,'Rye',6);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (32,'Canadian',6);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (33,'Vodka',7);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (34,'Brandy',8);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (35,'Cognac',8);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (36,'Gin',9);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (37,'Rum',10);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (38,'Tequila',11);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (39,'Ice tea',13);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (40,'Pop',14);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (41,'Infused wine',15);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (42,'Juices',16);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (43,'Tia Maria',12);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (44,'Irish cream',12);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (45,'Tequila Rose',12);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (46,'Cream Liquors',12);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (47,'Fruit Liquors',12);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (48,'Herbal Liquors',12);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (49,'Nut Flavored liquor',12);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (50,'Wheat beer',1);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (51,'Syrah',2);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (52,'Chianti',3);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (53,'None',17);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (54,'Water',18);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (55,'Energy Drinks',18);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (56,'Extras',18);


/* Insert packaging types */
INSERT INTO `delivery_db`.`catalog_containers` (id, type_name) VALUES (1,'Bottle');
INSERT INTO `delivery_db`.`catalog_containers` (id, type_name) VALUES (2,'Can');
INSERT INTO `delivery_db`.`catalog_containers` (id, type_name) VALUES (3,'Keg');

/* Insert packaging volumes */
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (1,'250 ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (2,'330 ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (3,'355 ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (4,'375 ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (5,'473 ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (6,'500 ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (7,'750 ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (8,'1 L');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (9,'1.5 L');

/* Insert packagings */
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (1,'Single');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (2,'4 Pack');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (3,'6 Pack');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (4,'8 Pack');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (5,'12 Pack');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (6,'18 Pack');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (7,'24 Pack');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (8,'30 Pack');