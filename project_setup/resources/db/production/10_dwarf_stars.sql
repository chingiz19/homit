use homit;

/*Catalog - Store Type*/
INSERT INTO `catalog_store_types`(id, name, display_name, api_name, image) VALUES(7,"dwarf-stars", "Dwarf Stars", "dwarf-stars", "dwarf-stars_icon.png");

/*Catalog - Catalog Stores*/
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (336, "s_", "Dwarf Stars", "34 132 3rd Ave SE, Calgary AB", "51.050405", "-114.060812", "4039188836", "7");

/*Catalog - Store Hours*/
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 1, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 2, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 3, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 4, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 5, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 6, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 7, "09:00:00", "600", "09:00:00", "600");

/*Catalog - Catalog Category*/
INSERT INTO `catalog_categories` (id, name, display_name) VALUES(20, "chocolate-and-bar", "Chocolate and Bar");

/*Catalog - Catalog Subcategory*/
INSERT INTO `catalog_subcategories` (id, name, category_id) VALUES(142, "Chocolates", "20");
INSERT INTO `catalog_subcategories` (id, name, category_id) VALUES(143, "Nutrition & Protein Bars", "20");

/*Catalog - Catalog Type*/
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(871, "Vegan, Nut-free and Gluten-free Chocolate", "142");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(872, "Vegan, Nut-free and Gluten-free Vegan Chocolate Cups", "142");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(873, "Vegan, Nut-free and Gluten-free Vegan Protein Bar", "143");

/*Catalog - Catalog Listing*/
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1288, "Dwarf Stars", "Originals", 871);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1289, "Dwarf Stars", "Pumpkin Seed Butter Cups", 872);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1290, "Dwarf Stars", "PumpKING Protein Balls", 873);

/*Catalog - Listing Description*/
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1288, 6, "ht_ulht_liOrganic pumpkin seed butter, dry roasted chickpeas, vegan dark chocolate, icing sugar, cocoa butter, himalayan sea salt. butter extract, vanilla extractd_ht_liht_liht_bCONTAINS:d_ht_b Corn starchd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1288, 1, "ht_ulht_liDry roasted chickpeas covered in a rich pumpkin seed butter filling, white & dark vegan chocolate (Available in a plain finish or lustre dusted)d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1288, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1289, 6, "ht_ulht_liCocoa butter, dry roasted organic pumpkin seeds, icing sugar, dark chocolate, vanilla extract, himalayan sea saltd_ht_liht_liht_bCONTAINS:d_ht_b Corn starchd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1289, 1, "ht_ulht_liPumpkin seed butter filling covered in a vegan dark chocolate.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1289, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1290, 6, "ht_ulht_liOrganic pumpkin seed butter, organic pumpkin seed protein powder, gluten free rolled oats, organic maple syrup, shredded coconut, cocoa butter, organic whole brown flaxseeds, himalayan sea saltd_ht_liht_liht_bMAY CONTAIN:d_ht_b Corn starchd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1290, 1, "ht_ulht_liPumpkin seed protein powder energy balls that pack 10 grams of clean protein per ball.d_ht_lid_ht_ul" );

/*Catalog - Product*/
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7586, 1288, "bg_1288.jpeg", 13);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7587, 1289, "bg_1289.jpeg", 13);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7588, 1290, "bg_1290.jpeg", 13);

/*Catalog - Item*/
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11684, 7586, 9, 16);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11685, 7587, 9, 178);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11686, 7588, 9, 101);

/*Catalog - Depot*/
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (824, 11684, 7, 11.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (825, 11685, 7, 5, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (826, 11686, 7, 5.5, 1);

/*Catalog - Product Warehouse*/
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350000, 824, 336, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350001, 825, 336, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350002, 826, 336, 1000);

/*Catalog - Images*/
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7586, 1, "ntr_bg_1288.jpeg");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7587, 1, "ntr_bg_1289.jpeg");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7588, 1, "ntr_bg_1290.jpeg");