use homit;

/*Insert Catalog - Store Type*/
INSERT INTO `catalog_store_types`(id, name, display_name, image) VALUES(1,"liquor-station", "Liquor Station", "liquor-station_icon.png");

/*Insert Catalog - Stores*/
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (101, "s_", "Solo Liquor Crowfoot", "818 Crowfoot Crescent NW, Calgary, AB T3G 4S3", "51.127318", "-114.206648", "5873525478", "1");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (102, "s_", "Solo Liquor North Haven", "4404 14 Street NW, Calgary, AB T2K 1J5, Canada", "51.091382", "-114.094263", "5873525478", "1");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (103, "s_", "Solo Liquor Panorama", "12 Panatella Blvd NW, Calgary, AB T3K 6K7, Canada", "51.165218", "-114.070912", "4035671110", "1");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (104, "s_", "Solo Liquor Tuscany", "5029 NOSE HILL DR NW, CALGARY, AB T3L 0A2, Canada", "51.107685", "-114.240467", "4033742060", "1");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (105, "s_", "Solo Liquor Mayfair", "6707 Elbow Dr SW, Calgary, AB T2W, Canada", "50.993963", "-114.084024", "5873563746", "1");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (106, "s_", "Solo Liquor Westbrook", "3308 17 Ave SW, Calgary, AB T3E 0B4, Canada", "51.038293", "-114.134276", "4037277565", "1");
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (107, "s_", "Solo Liquor Bonaventure", "8 9250 Macleod Trail SE, Calgary, AB T2J 0P5, Canada", "50.970542", "-114.070728", "4032528377", "1");

/*Insert Catalog - Store Hours*/
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (101, 1, "10:00:00", "960", "10:00:00", "960");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (101, 2, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (101, 3, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (101, 4, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (101, 5, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (101, 6, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (101, 7, "10:00:00", "960", "10:00:00", "960");

INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (102, 1, "10:00:00", "840", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (102, 2, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (102, 3, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (102, 4, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (102, 5, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (102, 6, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (102, 7, "10:00:00", "840", "10:00:00", "840");

INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (103, 1, "10:00:00", "960", "10:00:00", "960");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (103, 2, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (103, 3, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (103, 4, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (103, 5, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (103, 6, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (103, 7, "10:00:00", "960", "10:00:00", "960");

INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (104, 1, "10:00:00", "840", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (104, 2, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (104, 3, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (104, 4, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (104, 5, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (104, 6, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (104, 7, "10:00:00", "840", "10:00:00", "840");

INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (105, 1, "10:00:00", "840", "10:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (105, 2, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (105, 3, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (105, 4, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (105, 5, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (105, 6, "17:00:00", "420", "12:00:00", "720");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (105, 7, "10:00:00", "840", "10:00:00", "840");

INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (106, 1, "10:00:00", "960", "10:00:00", "960");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (106, 2, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (106, 3, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (106, 4, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (106, 5, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (106, 6, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (106, 7, "10:00:00", "960", "10:00:00", "960");

INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (107, 1, "10:00:00", "960", "10:00:00", "960");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (107, 2, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (107, 3, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (107, 4, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (107, 5, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (107, 6, "17:00:00", "540", "12:00:00", "840");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (107, 7, "10:00:00", "960", "10:00:00", "960");

-- Insert Catalog - Types Banner
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(1, "liquor-station_banner-1.jpg", "cider-and-cooler", null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(1, "general_banner.jpg", "beer", "Flavored Beer");
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(1, "liquor-station_banner-3.jpg", "wine", "Red Wine");
