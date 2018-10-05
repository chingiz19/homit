use homit;

-- Insert Catalog - Store Type 
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, union_id, rate_id, notice_period) VALUES(16,"three-arrows-body-co", "Three Arrows Body Co.", "three-arrows-body-co.jpeg", 1, 4.99, 1, 6, 1);

-- Insert Catalog - Stores
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (345, "s_", "Three Arrows Body Co.", "14st NW 202 Calgary AB T2N1Z8 Canada", "51.053246", "-114.094353", "4034649564", "16");

--  Insert Catalog - Store Hours
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (345, 1, "00:00:00", "0", "00:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (345, 2, "00:00:00", "0", "09:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (345, 3, "00:00:00", "0", "09:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (345, 4, "00:00:00", "0", "09:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (345, 5, "00:00:00", "0", "09:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (345, 6, "00:00:00", "0", "09:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (345, 7, "00:00:00", "0", "00:00:00", "840");

-- Insert Catalog - Types Banner
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(16, "three-arrows-body-co-1.jpg", "health-and-beauty", null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(16, "three-arrows-body-co-2.jpg", "health-and-beauty", null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(16, "three-arrows-body-co-3.jpg", "health-and-beauty", null);
