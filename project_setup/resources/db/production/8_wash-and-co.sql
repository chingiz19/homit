use homit;

-- Insert Catalog - Store Type
INSERT INTO `catalog_store_types`(id, name, display_name, image) VALUES(15,"wash-and-co", "Wash & Co", "wash-and-co.jpeg");

-- Insert Catalog - Stores
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (344, "s_", "Wash & Co", "9 Morningside Court, Airdrie, AB", "51.267057", "-114.012664", "4032779166", "15");

--  Insert Catalog - Store Hours
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (344, 1, "00:00:00", "0", "00:00:00", "0");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (344, 2, "00:00:00", "0", "09:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (344, 3, "00:00:00", "0", "09:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (344, 4, "00:00:00", "0", "09:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (344, 5, "00:00:00", "0", "09:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (344, 6, "00:00:00", "0", "09:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (344, 7, "00:00:00", "0", "00:00:00", "0");

-- Insert Catalog - Types Banner
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(15, "wash-and-co-1.jpg", "health-and-beauty", null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(15, "general_banner.jpg", "confectionery", null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(15, "wash-and-co-3.jpg", "health-and-beauty", null);
