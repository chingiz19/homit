/* Insert super categories */
INSERT INTO `test_homit`.`catalog_super_categories` (id, name) VALUES (1, 'liquor');
INSERT INTO `test_homit`.`catalog_super_categories` (id, name) VALUES (2, 'safeway');

/* Insert super categories */
INSERT INTO `test_homit`.`catalog_stores` (id, name, address, address_latitude, address_longitude, store_type, open_time, close_time, open_time_next, close_time_next)
 VALUES (1, 'Liquor Depot Brentwood', '3630 Brentwood Rd NW, Calgary, AB', '51.085766', '-114.126483', '1', '11:00:00', '23:59:59', '00:00:00', '02:00:00');
INSERT INTO `test_homit`.`catalog_stores` (id, name, address, address_latitude, address_longitude, store_type, open_time, close_time, open_time_next, close_time_next)
 VALUES (2, 'Liquor Depot Dalhouise', '5005 Dalhousie Dr NW, Calgary, AB', '51.104592', '-114.161657', '1', '11:00:00', '23:59:59', '00:00:00', '02:00:00');
INSERT INTO `test_homit`.`catalog_stores` (id, name, address, address_latitude, address_longitude, store_type, open_time, close_time, open_time_next, close_time_next)
 VALUES (3, 'Liquor Depot 14 Ave', '1810 14 Ave NW, Calgary, AB', '51.066177', '-114.102329', '1', '11:00:00', '23:59:59', '00:00:00', '02:00:00');
INSERT INTO `test_homit`.`catalog_stores` (id, name, address, address_latitude, address_longitude, store_type, open_time, close_time, open_time_next, close_time_next)
 VALUES (4, 'Liquor Depot Edmonton Trail', '831 Edmonton Trail NE, Calgary, AB', '51.059619', '-114.054751', '1', '11:00:00', '23:59:59', '00:00:00', '02:00:00');
INSERT INTO `test_homit`.`catalog_stores` (id, name, address, address_latitude, address_longitude, store_type, open_time, close_time, open_time_next, close_time_next)
 VALUES (5, 'Safeway Brentwood', '3636 Brentwood Rd NW, Calgary, AB', '51.085175', '-114.124385', '2', '07:00:00', '23:00:00', '00:00:00', '00:00:00');
INSERT INTO `test_homit`.`catalog_stores` (id, name, address, address_latitude, address_longitude, store_type, open_time, close_time, open_time_next, close_time_next)
 VALUES (6, 'Safeway Dalhouise', '5005 Dalhousie Drive NW, Calgary, AB', '51.104760', '-114.161526', '2', '07:00:00', '23:00:00', '00:00:00', '00:00:00');
INSERT INTO `test_homit`.`catalog_stores` (id, name, address, address_latitude, address_longitude, store_type, open_time, close_time, open_time_next, close_time_next)
 VALUES (7, 'Safeway 4 St', '5607 4 St NW, Calgary, AB', '51.101820', '-114.072876', '2', '07:00:00', '23:00:00', '00:00:00', '00:00:00');
INSERT INTO `test_homit`.`catalog_stores` (id, name, address, address_latitude, address_longitude, store_type, open_time, close_time, open_time_next, close_time_next)
 VALUES (8, 'Safeway 10 St', '410 10 St NW, Calgary, AB', '51.056185', '-114.085160', '2', '07:00:00', '23:00:00', '00:00:00', '00:00:00');

/* Insert categories */
INSERT INTO `test_homit`.`catalog_categories` (id,name,super_category_id) VALUES (1,'beer', 1);
INSERT INTO `test_homit`.`catalog_categories` (id,name,super_category_id) VALUES (2,'wine', 1);
INSERT INTO `test_homit`.`catalog_categories` (id,name,super_category_id) VALUES (3,'spirit', 1);
INSERT INTO `test_homit`.`catalog_categories` (id,name,super_category_id) VALUES (4,'all', 2);


/* Insert subcategories*/
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (1,'Ale',1);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (2,'White Wine',2);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (3,'Red Wine',2);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (4,'Sparkling Wine',2);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (5,'Fortified Wine',2);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (6,'Whiskey',3);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (7,'Vodka',3);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (8,'Brandy',3);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (9,'Gin',3);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (10,'Rum',3);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (11,'Tequila',3);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (12,'Liquers',3);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (13,'Ice tea',4);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (14,'Pop',4);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (15,'Infused Wine',2);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (16,'Juices',4);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (17,'Miscellaneous',2);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (18,'Miscellaneous',4);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (19,'Miscellaneous',1);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (20,'Miscellaneous',3);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (21,'Snack Mix',4);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (22,'Meat Mix',4);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (23,'Nut Mix',4);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (24,'Belgian',1);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (25,'Cider',1);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (26,'Fruit Beer',1);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (27,'IPA',1);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (28,'Lager',1);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (29,'Pilsner',1);
INSERT INTO `test_homit`.`catalog_subcategories`(id,name,category_id) VALUES (30,'Wheat Beer',1);


/* Insert types */
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (1,'Ale',1);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (2,'Lager',28);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (3,'Belgian',24);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (4,'Pilsner',29);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (5,'IPA',27);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (6,'Cider',25);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (7,'Fruit Beer',26);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (8,'Moscato',2);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (9,'Sauvignon Blanc',2);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (10,'Riesling',2);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (11,'Pinot Grigio',2);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (12,'Chardonnay',2);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (13,'Cabernet Sauvignon',3);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (14,'Malbec',3);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (15,'Merlot',3);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (16,'Pinot Noir',3);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (17,'Shiraz',3);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (18,'Zinfandel',3);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (19,'Prosecco ',4);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (20,'Rose',4);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (21,'Champagne',4);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (22,'Port Wine ',5);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (23,'Sherry',5);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (24,'Vermouth',5);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (25,'Palomino',5);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (26,'Bourbon',6);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (27,'Scotch',6);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (28,'Single Malt',6);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (29,'Blended',6);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (30,'Irish',6);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (31,'Rye',6);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (32,'Canadian',6);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (33,'Vodka',7);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (34,'Brandy',8);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (35,'Cognac',8);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (36,'Gin',9);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (37,'Rum',10);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (38,'Tequila',11);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (39,'Ice Tea',13);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (40,'Pop',14);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (41,'Infused Wine',15);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (42,'Juices',16);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (43,'Tia Maria ',12);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (44,'Irish Cream',12);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (45,'Tequila Rose',12);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (46,'Cream Liquors',12);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (47,'Fruit Liquors',12);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (48,'Herbal Liquors',12);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (49,'Nut Flavored liquor',12);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (50,'Wheat Beer',30);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (51,'Syrah',2);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (52,'Chianti',3);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (53,'Miscellaneous',17);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (54,'Water',18);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (55,'Energy Drink',18);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (56,'Extras',18);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (57,'Red Blend',3);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (58,'White Blend',2);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (59,'Sake',17);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (60,'Ice Wine',2);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (61,'Miscellaneous',18);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (62,'Miscellaneous',20);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (63,'Chips',21);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (64,'Popcorn',21);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (65,'Cheese Mix',21);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (66,'Miscellaneous',19);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (67,'Meat Mix',22);
INSERT INTO `test_homit`.`catalog_types`(id,name,subcategory_id) VALUES (68,'Nut Mix',21);


/* Insert packaging types */
INSERT INTO `test_homit`.`catalog_containers` (id, name) VALUES (1,'Bottle');
INSERT INTO `test_homit`.`catalog_containers` (id, name) VALUES (2,'Can');
INSERT INTO `test_homit`.`catalog_containers` (id, name) VALUES (3,'Keg');
INSERT INTO `test_homit`.`catalog_containers` (id, name) VALUES (4,'Box');
INSERT INTO `test_homit`.`catalog_containers` (id, name) VALUES (5,'Pack');


/* Insert packaging volumes */
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (1,'250ml');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (2,'330ml');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (3,'355ml');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (4,'375ml');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (5,'473ml');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (6,'500ml');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (7,'750ml');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (8,'1L');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (9,'1.5L');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (10,'None');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (11,'Regular');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (12,'Tall');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (13,'650ml');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (14,'450ml');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (15,'1.14L');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (16,'1.75L');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (17,'2L');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (18,'5L');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (19,'32oz');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (20,'8oz');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (21,'3L');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (22,'1.75L');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (23,'1.14L');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (24,'5.95lb');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (25,'7.5oz');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (26,'64oz');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (27,'20oz');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (28,'440ml');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (29,'341ml');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (30,'156g');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (31,'310g');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (32,'255g');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (33,'300g');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (34,'180g');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (35,'200g');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (36,'80g');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (37,'75g');
INSERT INTO `test_homit`.`catalog_packaging_volumes`(id,volume_name) VALUES (38,'550g');


/* Insert packagings */
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (1,'1');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (2,'4');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (3,'6');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (4,'4 Tall');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (5,'6 Tall');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (6,'8');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (7,'12');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (8,'18');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (9,'24');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (10,'30');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (11,'15');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (12,'36');
INSERT INTO `test_homit`.`catalog_packagings`(id,name) VALUES (13,'48');
