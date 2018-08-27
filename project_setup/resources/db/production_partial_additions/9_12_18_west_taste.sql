use homit;


-- Catalog - Types
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(937, "Sipcy Hot Sauce", "159");

-- Catalog - Listing
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1378, "WestTaste ", "Sipcy Hot Sauce", 937);

-- Catalog - Listing Description
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1378, 6, "ht_ulht_liTomato Paste, Mustard, White Vinegar, Garlic Powder, Onion Powder, Roasted Habanero, Spice, Sugar, Saltd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1378, 7, "ht_ulht_liGood for BBQ and good for marinating meats.d_ht_liht_liFor marinating you need to dilute the sauce with olive oil or vegtable oil or lemon juice.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1378, 1, "ht_ulht_liLocal made in Calgary, Non GMO, No gelatin, No chemical adetives, All naturald_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1378, 4, "Canada" );

-- Catalog - Product
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7676, 1378, "b_7676.jpeg", 2);

-- Catalog - Product Images
INSERT INTO `catalog_products_images`(product_id, image_key, image) VALUES(7676, 1, "ntr_b_7676.jpg");

-- Catalog - Item
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11791, 7676, 9, 165);

-- Catalog - Depot
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (931, 11791, 8, 6.99, 1);

-- Catalog - Warehouse
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350107, 931, 337, 1000);
