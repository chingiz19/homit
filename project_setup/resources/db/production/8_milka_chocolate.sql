use homit;

/*Catalog - Types*/
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(780, "Hzelnut and Raisin Chocolate Bar", "130");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(781, "Milk and White Chocolate Bar", "130");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(782, "Cherry and Cream Chocolate Bar", "130");

/* Insert Product List */
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (11862, "Milka", "Hazelnut & Raisin", 780);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (11863, "Milka", "Milk & White Chocolate", 781);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (11864, "Milka", "Cherry Cream", 782);

/* Insert Catalog Products */
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 11862, 4, "Switzerland");
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 11862, 6, "ht_ulht_liSugar, raisins, cocoa butter, cocoa mass, whole milk powder, hazelnuts, lactose, skimmed milk powder, butterfat, emulsifier (lecithins (soy)), Bourbon vanilla extract.d_ht_lid_ht_ul");
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 11863, 4, "Switzerland");
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 11863, 6, "ht_ulht_liSugar, cocoa butter, skim milk, whey, milk fat, soy lecithin, artificial flavor. ht_bContains:d_ht_b milk and soy.d_ht_lid_ht_ul");
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 11864, 4, "Switzerland");
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 11863, 6, "ht_ulht_liSugar, jelly cherry (glucose-fructose syrup, sugar, glucose syrup, mashed cherries (9%), coloring (CONCENTRATED black carrot juice, puree chokeberry), humectant (sorbitol), acidity regulators (citric acid, tartaric acid), flavors, a stabilizer (pectin)), vegetable oil, cocoa butter, skimmed milk powder, whey powder, cocoa mass, dehidratirana mlechna maznina cream powder (1.5%), emulsifier (soy lecithin , E 476), hazelnut paste, spices, at least 30% cocoa mass. ht_bContains:d_ht_b milk, hazelnuts, soy components.d_ht_lid_ht_ul");

/*Catalog - Product*/
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7362, 11862, "br_11862.jpeg", 4);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7363, 11863, "br_11863.jpeg", 4);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7364, 11864, "br_11864.jpeg", 4);

/*Catalog - Item*/
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11387, 7362, 9, 15);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11388, 7363, 9, 15);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11389, 7364, 9, 15);

/*Catalog - Depot*/
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (15905, 11387, 6, 3.99, 1 );
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (15906, 11388, 6, 3.99, 1 );
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (15907, 11389, 6, 3.99, 1 );

/*Catalog - Warehouse*/
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (320882, 15905, 335, 1000 );
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (320883, 15906, 335, 1000 );
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (320884, 15907, 335, 1000 );

/*Catalog - Product Images*/
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7362, 2, "br_11862.jpeg");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7363, 2, "br_11863.jpeg");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7364, 2, "br_11864.jpeg");