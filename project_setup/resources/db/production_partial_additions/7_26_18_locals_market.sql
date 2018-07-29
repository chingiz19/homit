use homit;

-- Catalog - Store Type
INSERT INTO `catalog_store_types`(id, name, display_name, image) VALUES(8,"locals-market", "Local's Market","locals-market_yyc.png");

-- Catalog - Store
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (337, "s_", "Local Market", "10 Brentwood Common Northwest, Calgary, AB", "51.087118", "-114.128275", "4033977020", "8");

-- Catalog - Store Hours
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (337, 1, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (337, 2, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (337, 3, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (337, 4, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (337, 5, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (337, 6, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (337, 7, "10:00:00", "780", "10:00:00", "780");

-- Catalog - Categories
INSERT INTO `catalog_categories` (id, name, display_name, image) VALUES(24, "dwarf-stars", "Dwarf Stars", "dwarf-stars.jpeg");
INSERT INTO `catalog_categories` (id, name, display_name, image) VALUES(25, "borderland-food-co", "Borderland Food Co.", "borderland-food-co.jpeg");

-- Catalog - Subcategories
INSERT INTO `catalog_subcategories` (id, name, category_id) VALUES(152, "Chocolates", "24");
INSERT INTO `catalog_subcategories` (id, name, category_id) VALUES(153, "Nutrition & Protein Bars", "24");
INSERT INTO `catalog_subcategories` (id, name, category_id) VALUES(154, "Bone Broth for People", "25");
INSERT INTO `catalog_subcategories` (id, name, category_id) VALUES(155, "Bone Broth for Pets", "25");

-- Catalog - Types
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(910, "Nut-free, gluten-free and vegan chocolate", "152");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(911, "Nut-free, gluten-free and vegan chocolate cups", "152");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(912, "Nut-free, gluten-free and vegan protein bar", "153");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(913, "Chicken broth for people", "154");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(914, "Bison bone broth for people", "154");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(915, "Beef bone broth for people", "154");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(916, "Chicken smoothie bath broth for people", "154");

-- Catalog Packaging - Containers
INSERT INTO `catalog_packaging_containers`(id, name) VALUES(19, "stand up pouch");

-- Catalog - Listing
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1349, "Dwarf Stars", "Originals", 910);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1350, "Dwarf Stars", "Pumpkin Seed Butter Cups", 911);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1351, "Dwarf Stars", "PumpKING Protein Balls", 912);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1352, "Borderland Food", "Free Range Chicken Broth", 913);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1353, "Borderland Food", "Grass-Fed Bison Bone Broth", 914);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1354, "Borderland Food", "Grass-Fed Beef Bone Broth", 915);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1355, "Borderland Food", "Free Range Chicken Smoothie Base Bone Broth", 916);

-- Catalog - Listing Description
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1349, 6, "ht_ulht_liOrganic pumpkin seed butter, dry roasted chickpeas, vegan dark chocolate, icing sugar, cocoa butter, himalayan sea salt. butter extract, vanilla extractd_ht_liht_liht_bCONTAINS:d_ht_b Corn starchd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1349, 1, "ht_ulht_liDry roasted chickpeas covered in a rich pumpkin seed butter filling, white & dark vegan chocolate (Available in a plain finish or lustre dusted)d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1349, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1350, 6, "ht_ulht_liCocoa butter, dry roasted organic pumpkin seeds, icing sugar, dark chocolate, vanilla extract, himalayan sea saltd_ht_liht_liht_bCONTAINS:d_ht_b Corn starchd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1350, 1, "ht_ulht_liPumpkin seed butter filling covered in a vegan dark chocolate.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1350, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1351, 6, "ht_ulht_liOrganic pumpkin seed butter, organic pumpkin seed protein powder, gluten free rolled oats, organic maple syrup, shredded coconut, cocoa butter, organic whole brown flaxseeds, himalayan sea saltd_ht_liht_liht_bMAY CONTAIN:d_ht_b Corn starchd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1351, 1, "ht_ulht_liPumpkin seed protein powder energy balls that pack 10 grams of clean protein per ball.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1351, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1352, 6, "ht_ulht_liFree-range chicken bones (backs, necks, feet + wings), organic carrots, organic celery, organic onions, apple cider vinegar, pink himalayan sea salt, organic peppercorns, organic parsley, organic rosemary, organic bay leavesd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1352, 1, "ht_ulht_liFor individuals looking to incorporate bone broth into their daily diet, our broths are made with the highest quality ingredients and slow-cooked for over 24 hours to ensure maximum nutrient extraction and flavour.d_ht_liht_liPerfect for sipping or adding to your favourite recipes.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1352, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1352, 7, "ht_ulht_liDrink on it's own, or use as a substitute for stock in your recipes.d_ht_liht_li Bone broth is a healthy alternative to shelf-bought soup stock and is also a superfood rich with minerals and collagen to improve your gut health, joint health, and much, much  more.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1353, 6, "ht_ulht_liGrass-fed bison bones (knuckles, marrow, shins + meaty bones), organic carrots, organic celery, organic onions, organic apple cider vinegar, pink himalayan sea salt, organic peppercorns, organic parsley, organic rosemary, organic bay leaves.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1353, 1, "ht_ulht_liFor individuals looking to incorporate bone broth into their daily diet, our broths are made with the highest quality ingredients and slow-cooked for over 24 hours to ensure maximum nutrient extraction and flavour.d_ht_liht_liPerfect for sipping or adding to your favourite recipes.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1353, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1353, 7, "ht_ulht_liDrink on it's own, or use as a substitute for stock in your recipes.d_ht_liht_liBone broth is a healthy alternative to shelf-bought soup stock and is also a superfood rich with minerals and collagen to improve your gut health, joint health, and much, much  more.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1354, 6, "ht_ulht_liGrass-fed beef bones (knuckles, marrow, shins + meaty bones), organic carrots, organic celery, organic onions, organic apple cider vinegar, pink himalayan sea salt, organic peppercorns, organic parsley, organic rosemary, organic bay leavesd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1354, 1, "ht_ulht_liFor individuals looking to incorporate bone broth into their daily diet, our broths are made with the highest quality ingredients and slow-cooked for over 24 hours to ensure maximum nutrient extraction and flavour.d_ht_liht_liPerfect for sipping or adding to your favourite recipes.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1354, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1354, 7, "ht_ulht_liDrink on it's own, or use as a substitute for stock in your recipes.d_ht_liht_liBone broth is a healthy alternative to shelf-bought soup stock and is also a superfood rich with minerals and collagen to improve your gut health, joint health, and much, much  more.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1355, 6, "ht_ulht_liFree-range chicken bones (backs, necks, feet + wings), organic coconut water, organic apple cider vinegar.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1355, 1, "ht_ulht_liFor individuals looking to incorporate bone broth into their daily diet, our broths are made with the highest quality ingredients and slow-cooked for over 24 hours to ensure maximum nutrient extraction and flavour.d_ht_liht_liPerfect for sipping or adding to your favourite recipes.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1355, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1355, 7, "ht_ulht_liPerfect for sneaking into kid's smoothie's, or perfect for adding a boost to your daily smoothie!d_ht_liht_liGet all of the health benefits of bone broth on those hot summer days.d_ht_liht_liAdd 1/4 cup to your usual smoothie recipe for added collagen and protein!d_ht_lid_ht_ul" );

-- Insert Catalog - Types Banners
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(8, "local-market_banner-1.jpg", 24, null, null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(8, "general_banner.jpg", 25, null, null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(8, "local-market_banner-3.jpg", 25, null, null);

-- Catalog - Product
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7647, 1349, "sup_1349.jpeg", 19);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7648, 1350, "bg_1350.jpeg", 13);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7649, 1351, "bg_1351.jpeg", 13);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7650, 1352, "sup_1352.jpeg", 19);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7651, 1353, "sup_1353.jpeg", 19);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7652, 1354, "sup_1354.jpeg", 19);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7653, 1355, "sup_1355.jpeg", 19);

-- Catalog - Product Images
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7647, 1, "ntr_sup_1349.jpeg");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7648, 1, "ntr_bg_1350.jpeg");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7649, 1, "ntr_bg_1351.jpeg");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7650, 1, "ntr_sup_1352.png");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7651, 1, "ntr_sup_1353.png");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7652, 1, "ntr_sup_1354.png");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7653, 1, "ntr_sup_1355.png");

-- Catalog - Item
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11756, 7647, 9, 16);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11757, 7648, 9, 178);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11758, 7649, 9, 101);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11759, 7650, 9, 157);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11760, 7651, 9, 157);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11761, 7652, 9, 157);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11762, 7653, 9, 157);

-- Catalog - Depot
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (896, 11756, 8, 11.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (897, 11757, 8, 4.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (898, 11758, 8, 5.49, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (899, 11759, 8, 8.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (900, 11760, 8, 8.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (901, 11761, 8, 8.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (902, 11762, 8, 8.99, 1);

-- Catalog - Warehouse
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350072, 896, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350073, 897, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350074, 898, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350075, 899, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350076, 900, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350077, 901, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350078, 902, 337, 1000);