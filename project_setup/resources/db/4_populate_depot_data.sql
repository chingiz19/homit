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
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (12,'Liquers',3);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (13,'Ice tea',4);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (14,'Pop',4);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (15,'Infused wine',3);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (16,'Juices',4);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (17,'Miscellaneous',2);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (18,'Others',4);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (19,'Others',1);
INSERT INTO `delivery_db`.`catalog_subcategories`(id,name,category_id) VALUES (20,'Miscellaneous',3);


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
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (53,'Miscellaneous',17);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (54,'Water',18);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (55,'Energy Drinks',18);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (56,'Extras',18);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (57,'Red Blend',3);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (58,'White Blend',2);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (59,'Sake',17);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (60,'Ice Wine',2);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (61,'Others',1);
INSERT INTO `delivery_db`.`catalog_types`(id,name,subcategory_id) VALUES (62,'Miscellaneous',20);


/* Insert packaging types */
INSERT INTO `delivery_db`.`catalog_containers` (id, name) VALUES (1,'Bottle');
INSERT INTO `delivery_db`.`catalog_containers` (id, name) VALUES (2,'Can');
INSERT INTO `delivery_db`.`catalog_containers` (id, name) VALUES (3,'Keg');
INSERT INTO `delivery_db`.`catalog_containers` (id, name) VALUES (4,'Box');

/* Insert packaging volumes */
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (1,'250ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (2,'330ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (3,'355ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (4,'375ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (5,'473ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (6,'500ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (7,'750ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (8,'1L');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (9,'1.5L');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (10,'None');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (11,'Regular');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (12,'Tall');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (13,'650ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (14,'450ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (15,'1.14L');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (16,'1.75L');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (17,'2L');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (18,'5L');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (19,'32oz');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (20,'8oz');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (21,'3L');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (22,'1.75L');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (23,'1.14L');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (24,'5.95lb');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (25,'7.5oz');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (26,'64oz');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (27,'20oz');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (28,'440ml');
INSERT INTO `delivery_db`.`catalog_packaging_volumes`(id,volume_name) VALUES (29,'341ml');


/* Insert packagings */
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (1,'1');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (2,'4');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (3,'6');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (4,'4 Tall');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (5,'6 Tall');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (6,'8');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (7,'12');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (8,'18');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (9,'24');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (10,'30');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (11,'15');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (12,'36');
INSERT INTO `delivery_db`.`catalog_packagings`(id,name) VALUES (13,'48');