use homit;

-- Catalog - Store Unions
INSERT INTO `catalog_store_unions` (id, name, display_name, image, description_text) VALUES(1, "locally-made", "Local Market", "locally-made.png", "Just like farmers' market! All your favorite local stores in one place and all year round. Enjoy our quick home delivery service for one of the lowest delivery prices in the city.");

-- Catalog - Store Type
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, del_fee_secondary, union_id, rate_id) VALUES(9,"pure-foods-fresh", "Pure Foods Fresh", "pure-foods-fresh.jpg", TRUE, 4.99, 2.99, 1, 4);
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, del_fee_secondary, union_id, rate_id) VALUES(10,"borderland-food-co", "Borderland Food Co.","border-land-co.jpg", TRUE, 4.99, 2.99, 1, 4);
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, del_fee_secondary, union_id, rate_id) VALUES(11,"honey-and-bloom", "Honey & Bloom","honey-and-bloom.jpg", TRUE, 4.99, 2.99, 1, 4);
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, del_fee_secondary, union_id, rate_id) VALUES(12,"westtaste", "WestTaste","westtaste.jpg", TRUE, 4.99, 2.99, 1, 4);

-- Catalog - Store
-- !!! Update Dwarf Stars location in DB
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (338, "s_", "Pure Foods Fresh", "10 Brentwood Common Northwest, Calgary, AB", "51.087118", "-114.128275", "4033977020", "9");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (339, "s_", "Borderland Food Co.", "10 Brentwood Common Northwest, Calgary, AB", "51.087118", "-114.128275", "4033977020", "10");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (340, "s_", "Honey & Bloom", "10 Brentwood Common Northwest, Calgary, AB", "51.087118", "-114.128275", "4033977020", "11");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (341, "s_", "WestTaste", "10 Brentwood Common Northwest, Calgary, AB", "51.087118", "-114.128275", "4033977020", "12");

-- Catalog - Store Hours
-- !!! Update Dwarf Stars store hours in DB
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (338, 1, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (338, 2, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (338, 3, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (338, 4, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (338, 5, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (338, 6, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (338, 7, "10:00:00", "780", "10:00:00", "780");

INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (339, 1, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (339, 2, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (339, 3, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (339, 4, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (339, 5, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (339, 6, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (339, 7, "10:00:00", "780", "10:00:00", "780");

INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (340, 1, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (340, 2, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (340, 3, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (340, 4, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (340, 5, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (340, 6, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (340, 7, "10:00:00", "780", "10:00:00", "780");

INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (341, 1, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (341, 2, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (341, 3, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (341, 4, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (341, 5, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (341, 6, "10:00:00", "780", "10:00:00", "780");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (341, 7, "10:00:00", "780", "10:00:00", "780");