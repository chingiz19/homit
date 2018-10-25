use homit;

-- Insert Catalog - Store Type 
INSERT INTO `catalog_store_types`(id, name, display_name, image, available, del_fee_primary, union_id, rate_id, notice_period) VALUES(19,"seasonal", "Seasonal", "seasonal.jpeg", 1, 4.99, null, 8, 1);

-- Insert Catalog - Stores
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (348, "s_", "Seasonal", "10 Brentwood Common NW, Calgary, AB", "51.086963", "-114.128321", "4039262501", "19");

--  Insert Catalog - Store Hours
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (348, 1, "10:00:00", "840", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (348, 2, "10:00:00", "840", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (348, 3, "10:00:00", "840", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (348, 4, "10:00:00", "840", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (348, 5, "10:00:00", "840", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (348, 6, "10:00:00", "840", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (348, 7, "10:00:00", "840", "10:00:00", "840");

-- Insert Catalog - Types Banner
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(19, "seasonal-1.jpg", "seasonal", null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(19, "seasonal-2.jpg", "seasonal", null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(19, "seasonal-3.jpg", "seasonal", null);