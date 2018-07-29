use homit;

-- Catalog - Categories
INSERT INTO `catalog_categories` (id, name, display_name, image) VALUES(26, "pure-foods-fresh", "Pure Foods Fresh", "pure-foods-fresh.jpg");

-- Catalog - Subcategories
INSERT INTO `catalog_subcategories` (id, name, category_id) VALUES(156, "Sauce & Seasoning", "26");

-- Catalog - Types
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(917, "Gluten free, dairy free, nut free, vegan sauce", "156");

-- Catalog Packaging - Containers
INSERT INTO `catalog_packaging_volumes`(id, name) VALUES(214, "354ml");

-- Catalog - Listing
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1356, "Pure Foods Fresh", "Babu's BBQ Sauce", 917);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1357, "Pure Foods Fresh", "South Western Green Pepper Sauce", 917);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1358, "Pure Foods Fresh", "Trumato Sauce", 917);

-- Catalog - Listing Description
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1356, 6, "ht_ulht_liFresh tomato, tomato paste, fresh onion, fresh garlic, spices, olive oil, tamarind paste, cane sugar, organic apple cider vinegar, natural liquid smoke, non-GMO corn flour, water, black salt, saltd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1356, 1, "ht_ulht_liPure Foods Fresh Sauces are manufactured in Calgary with quality ingredients and fresh in taste made without any Chemicals, No Preservatives, No artificial Colour, 100% Natural, Suitable for Vegetarian, Gluten Free, Dairy Freed_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1356, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1357, 6, "ht_ulht_liFresh onion, fresh green pepper, fresh garlic, fresh coriander leaves, fresh ginger, olive oil, spices, tamarind paste, cane sugar, corn flour, water, saltd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1357, 1, "ht_ulht_liPure Foods Fresh Sauces are manufactured in Calgary with quality ingredients and fresh in taste made without any Chemicals, No Preservatives, No artificial Colour, 100% Natural, Suitable for Vegetarian, Gluten Free, Dairy Freed_ht_liht_liUsed as: pasta sauce and marinating meats like chicken, beef, pork, salmon, shrimp and also used as salad dressing, and dipping sauce for chips, tacos and nachos.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1357, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1357, 7, "ht_ulht_bEnchiladasd_ht_b Instructions (serves 4): ht_liHeat 2 tbls oil, add 1 lbs chicken diced and cook for 10 min, saeson with salt and pepper. Saute until chicken is cooked and add half bottle of South Western Green Pepper Sauce and remove from heatd_ht_liht_li To assemble Enchiladas - Lay out the Tortillas, add chicken mixtue and 1 ounce black bean and spread 1/3 cup cheese on top. Bake uncovered 20 min and garnished with cilantrod_ht_liht_liDelicious enchiladas ready to served_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1358, 6, "ht_ulht_liFresh onion, fresh tomato, fresh garlic, tomato paste, olive oil, tamarind paste, spices, cane sugar, corn flour, water, saltd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1358, 1, "ht_ulht_liPure Foods Fresh Sauces are manufactured in Calgary with quality ingredients and fresh in taste made without any Chemicals, No Preservatives, No artificial Colour, 100% Natural, Suitable for Vegetarian, Gluten Free, Dairy Freed_ht_liht_li Used as: pizza sauce, pasta sauce and marinating meats like Chicken, beef, pork, salmon, shrimp and also used as dipping sauce for chips, tacos and nachosd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1358, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1358, 7, "ht_ulht_bButter Chickend_ht_b instructions (serves 4): ht_liAdd 2 tablespoons butter in a pan with medium-heat, cook 2 lbs chicken breast for 10-15 minsd_ht_liht_liOnce chicken is cooked, add the whole bottle of Trumato (Mild/Hot) sauce, after 3 mins add 2 cup cream, and 1 cup water. You could use table cream, or sub 1 cup for milk or yogurtd_ht_liht_liStir in the 2 tbsp of butter, and season with salt and cilantro, to taste. Serve garnished with lime and cilantro, alongside rice and naand_ht_lid_ht_ulht_ulht_bChicken / Veg Kormad_ht_b instructions (serves 4): ht_liAdd 2 tbsp oil in a pan and add 2 lbs chicken and cook for 10 minsd_ht_liht_liOnce the chicken is cooked perfectly add Turmato (Mild/Hot) sauce, after 3 mins add 1 cup coconut milk or 1/4 cup desiccated coconutd_ht_liht_liSeason with salt and pepper if you need to spice up add the gravy and garnish with cilantro and lime, serve with rice or naand_ht_lid_ht_ul " );

-- Catalog - Product
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7654, 1356, "b_1356.jpeg", 2);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7655, 1357, "b_1357.jpeg", 2);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7656, 1358, "b_1358.jpeg", 2);

-- Catalog - Product Images
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7654, 1, "ntr_b_1356.jpeg");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7655, 1, "ntr_b_1357.jpeg");
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7656, 1, "ntr_b_1358.jpeg");

-- Catalog - Item
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11763, 7654, 9, 214);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11764, 7655, 9, 214);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11765, 7656, 9, 214);

-- Catalog - Depot
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (903, 11763, 8, 9.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (904, 11764, 8, 9.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (905, 11765, 8, 9.99, 1);

-- Catalog - Warehouse
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350079, 903, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350080, 904, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350081, 905, 337, 1000);

-- Catalog Store Types - Category Covers
INSERT INTO `catalog_store_types_category_covers`(id, store_type_id, category_id, cover_image) VALUES (27, 8, 26, "8_pure-foods-fresh.jpg");