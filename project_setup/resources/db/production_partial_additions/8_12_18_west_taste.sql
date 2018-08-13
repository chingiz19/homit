use homit;

-- Catalog - Categories
INSERT INTO `catalog_categories` (id, name, display_name, image) VALUES(28, "westtaste", "WestTaste", "westtaste.jpeg");

-- Catalog - Subcategories
INSERT INTO `catalog_subcategories` (id, name, category_id) VALUES(158, "Jams & Spreads", "28");
INSERT INTO `catalog_subcategories` (id, name, category_id) VALUES(159, "Hot Sauce", "28");
INSERT INTO `catalog_subcategories` (id, name, category_id) VALUES(160, "Salad Dressing", "28");

-- Catalog - Types
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(930, "Honey and Beet Spread", "158");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(931, "Beet Spread", "158");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(932, "Mango Hot Sauce", "159");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(933, "Balsamic Salad Dressing", "160");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(934, "Chia Seed Salad Dressing", "160");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(935, "Fresh Carrot Spread", "158");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(936, "Jam Style Carrot Spread", "158");

-- Catalog - Listing
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1371, "WestTaste ", "Honey & Beet Spread", 930);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1372, "WestTaste ", "Jan Style Beet Spread", 931);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1373, "WestTaste ", "Tungo Mango Hot Sauce", 932);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1374, "WestTaste ", "Balsamic & Beet Salad Dressing", 933);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1375, "WestTaste ", "Chia Seed & Mint Salad Dressing", 934);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1376, "WestTaste ", "Honey & Carrot Spread", 935);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1377, "WestTaste ", "Jam Style Carrot Spread", 936);

-- Catalog - Listing Description
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1371, 6, "ht_ulht_liFresh Beetroot, Lemon Juice, Raw Honey, Vinegar, Pectin, Cornstarch, Natural Flevourd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1371, 7, "ht_ulht_liUse with cream chees and crackers, spread over toast with butter, cream or any nut butter like peanut butter, use with meats, egg and bacond_ht_liht_liUse as spread over salads with olive oil, mix with yogurtd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1371, 1, "ht_ulht_liLocal made in Calgary, Non GMO, No gelatin, No chemical adetives, All naturald_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1371, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1372, 6, "ht_ulht_liFresh Beetroot, Lemon Juice, Sugar, Vinegar, Pectin, Cornstarch, Natural Flevourd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1372, 7, "ht_ulht_liUse with cream chees and crackers, spread over toast with butter, cream or any nut butter like peanut butter, use with meats, egg and bacon d_ht_liht_liUse as spread over salads with olive oil, mix with yogurtd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1372, 1, "ht_ulht_liLocal made in Calgary, Non GMO, No gelatin, No chemical adetives, All naturald_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1372, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1373, 6, "ht_ulht_liMango, Hot Pepper, Sugar, White Vinegar, Carrot, Garlic, Cornstarch, Saltd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1373, 7, "ht_ulht_liUse with Spring Rools, Samosa, Chicken wing, any white meat like fish or chicken, pork, sandwichesd_ht_liht_liUse as a dip with snackesd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1373, 1, "ht_ulht_liLocal made in Calgary, Non GMO, No gelatin, No chemical adetives, All natural d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1373, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1374, 6, "ht_ulht_liVinegar (Balsamic , White), Maple Syrup, Cornstarch, Freh Beetroot, Water, Salt, Sugar d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1374, 7, "ht_ulht_liDress up your veggi or frouit salads with low calories and low sugar balsamic and beet salad dressingd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1374, 1, "ht_ulht_liLocal made in Calgary, Non GMO, No gelatin, No chemical adetives, All naturald_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1374, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1375, 6, "ht_ulht_liCucumber, Chia Seed, Sugar, Vinegar, Lemon Juice, Pectin, Mint, Natural Flavord_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1375, 7, "ht_ulht_liDress up your veggi salads with shia seed salad dressing!d_ht_liht_liYou can make a cooling drink with adding two spoon of salad dressing to a cup of soda or water and iced_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1375, 1, "ht_ulht_liLocal made in Calgary, Non GMO, No gelatin, No chemical adetives, All naturald_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1375, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1376, 6, "ht_ulht_liFresh Carrot, Honey, Vinegar, Pectin, Natural Flavor, Citric Acidd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1376, 7, "ht_ulht_liUse with cream chees and crackers, spread over toast with butter, cream or any nut butter like peanut butter, use with meats, egg and bacond_ht_liht_liUse as spread over salads with olive oil; mix with yogurtd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1376, 1, "ht_ulht_liLocal made in Calgary, Non GMO, No gelatin, No chemical adetives, All naturald_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1376, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1377, 6, "ht_ulht_liFresh Carrot, Vinegar, Pectin, Natural Flavor, Citric Acidd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1377, 7, "ht_ulht_liUse with cream chees and crackers, spread over toast with butter, cream or any nut butter like peanut butterd_ht_liht_liuse with meats, egg and bacon, use as spread over salads with olive oil, mix with yogurtd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1377, 1, "ht_ulht_liLocal made in Calgary, Non GMO, No gelatin, No chemical adetives, All naturald_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1377, 4, "Canada" );

-- Catalog - Product
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7669, 1371, "jr_7669.jpeg", 6);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7670, 1372, "jr_7670.jpeg", 6);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7671, 1373, "b_7671.jpeg", 2);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7672, 1374, "b_7672.jpeg", 2);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7673, 1375, "b_7673.jpeg", 2);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7674, 1376, "jr_7674.jpeg", 6);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7675, 1377, "jr_7675.jpeg", 6);

-- Catalog - Product Images
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7654, 1, "ntr_b_7671.jpeg");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7655, 1, "ntr_b_7672.jpeg");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7656, 1, "ntr_b_7673.jpeg");

-- Catalog - Item
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11784, 7669, 9, 38);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11785, 7670, 9, 38);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11786, 7671, 9, 165);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11787, 7672, 9, 165);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11788, 7673, 9, 165);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11789, 7674, 9, 38);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11790, 7675, 9, 38);

-- Catalog - Depot
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (924, 11784, 8, 7.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (925, 11785, 8, 5.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (926, 11786, 8, 6.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (927, 11787, 8, 6.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (928, 11788, 8, 6.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (929, 11789, 8, 7.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (930, 11790, 8, 5.99, 1);

-- Catalog - Warehouse
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350100, 924, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350101, 925, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350102, 926, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350103, 927, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350104, 928, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350105, 929, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350106, 930, 337, 1000);

-- Catalog Store Types - Category Covers
INSERT INTO `catalog_store_types_category_covers`(id, store_type_id, category_id, cover_image) VALUES (29, 8, 28, "8_westtaste.jpg");