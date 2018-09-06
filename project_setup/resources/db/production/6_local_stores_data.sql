use homit;

-- Catalog - Store Unions
INSERT INTO `catalog_store_unions` (id, name, display_name, image, description_text) VALUES(1, "locally-made", "Local Market", "locally-made.png", "Just like farmers' market! All your favorite local stores in one place and all year round. Enjoy our quick home delivery service for one of the lowest delivery prices in the city.");

-- Catalog - Store Type
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, del_fee_secondary, union_id, rate_id) VALUES(7,"dwarf-stars", "Dwarf Stars", "dwarf-stars.jpg", TRUE, 4.99, 2.99, 1, 4);
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, del_fee_secondary, union_id, rate_id) VALUES(9,"pure-foods-fresh", "Pure Foods Fresh", "pure-foods-fresh.jpg", TRUE, 4.99, 2.99, 1, 4);
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, del_fee_secondary, union_id, rate_id) VALUES(10,"borderland-food-co", "Borderland Food Co.","borderland-food-co.jpg", TRUE, 4.99, 2.99, 1, 4);
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, del_fee_secondary, union_id, rate_id) VALUES(11,"honey-and-bloom", "Honey & Bloom","honey-and-bloom.jpg", TRUE, 4.99, 2.99, 1, 4);
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, del_fee_secondary, union_id, rate_id) VALUES(12,"westtaste", "WestTaste","westtaste.jpg", TRUE, 4.99, 2.99, 1, 4);
-- 09/05/2018 Added
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, del_fee_secondary, union_id, rate_id) VALUES(13,"kakow", "Kakow","kakow.jpg", TRUE, 4.99, 2.99, 1, 4);

-- Catalog - Store
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (336, "s_", "Dwarf Stars", "10 Brentwood Common Northwest, Calgary, AB", "51.087118", "-114.128275", "4039188836", "7");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (338, "s_", "Pure Foods Fresh", "10 Brentwood Common Northwest, Calgary, AB", "51.087118", "-114.128275", "4033977020", "9");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (339, "s_", "Borderland Food Co.", "10 Brentwood Common Northwest, Calgary, AB", "51.087118", "-114.128275", "4033977020", "10");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (340, "s_", "Honey & Bloom", "10 Brentwood Common Northwest, Calgary, AB", "51.087118", "-114.128275", "4033977020", "11");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (341, "s_", "WestTaste", "10 Brentwood Common Northwest, Calgary, AB", "51.087118", "-114.128275", "4033977020", "12");
-- 09/05/2018 Added
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (342, "s_", "Kakow", "69 Springborough Crt SW Calgary, AB T3H 5V7", "51.034836", "-114.189919", "5879682052", "13");

-- Catalog - Store Hours
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 1, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 2, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 3, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 4, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 5, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 6, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 7, "09:00:00", "600", "09:00:00", "600");

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

-- 09/05/2018 Added
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (342, 1, "00:00:00", "540", "00:00:00", "540");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (342, 2, "08:00:00", "540", "08:00:00", "540");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (342, 3, "08:00:00", "540", "08:00:00", "540");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (342, 4, "08:00:00", "540", "08:00:00", "540");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (342, 5, "08:00:00", "540", "08:00:00", "540");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (342, 6, "08:00:00", "540", "08:00:00", "540");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (342, 7, "00:00:00", "540", "00:00:00", "540");