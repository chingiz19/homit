use homit;

-- Catalog - Store Type
INSERT INTO `catalog_store_types`(id, name, display_name, image) VALUES(8,"local-market", "Local Market","local-market_yyc.png");

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

-- Insert Catalog - Types Banners
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(7, "local-market_banner-1.jpg", 24, null, null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(7, "general_banner.jpg", 25, null, null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(7, "local-market_banner-3.jpg", 25, null, null);