use homit;

-- Insert Catalog - Store Type 
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, union_id, rate_id, notice_period) VALUES(18,"perogy-guy", "Perogy Guy", "perogy-guy.jpeg", 1, 4.99, 1, 8, 1);

-- Insert Catalog - Stores
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (347, "s_", "Perogy Guy", "10 Brentwood Common NW, Calgary, AB T2L 2L6", "51.030455", "-114.035080", "4034649564", "18");

--  Insert Catalog - Store Hours
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (347, 1, "00:00:00", "0", "10:00:00", "840");        
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (347, 2, "00:00:00", "0", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (347, 3, "00:00:00", "0", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (347, 4, "00:00:00", "0", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (347, 5, "00:00:00", "0", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (347, 6, "00:00:00", "0", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (347, 7, "00:00:00", "0", "10:00:00", "840");

-- Insert Catalog - Types Banner
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(18, "farmers-market-1.jpg", "farm-fresh", null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(18, "farmers-market-2.jpg", "farm-fresh", null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(18, "farmers-market-3.jpg", "farm-fresh", null);