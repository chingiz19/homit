use homit;

/*Insert Catalog - Store Type*/
INSERT INTO `catalog_store_types`(id, name, display_name, image) VALUES(6,"linas-italian-market", "Lina's Italian Market", "linas-italian-store_icon.png");

/*Insert Catalog - Stores*/
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (335, "s_", "Lina's Italian Market", "2202 Centre St NE, Calgary, AB T2E 2T5", "51.071908", "-114.062205", "4032779166", "6");

/*Insert Catalog - Store Hours*/
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (335, 1, "08:00:00", "660", "08:00:00", "660");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (335, 2, "08:00:00", "660", "08:00:00", "660");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (335, 3, "08:00:00", "660", "08:00:00", "660");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (335, 4, "08:00:00", "660", "08:00:00", "660");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (335, 5, "08:00:00", "660", "08:00:00", "660");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (335, 6, "08:00:00", "660", "08:00:00", "660");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (335, 7, "08:00:00", "600", "08:00:00", "660");

-- Insert Catalog - Types Banner
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(6, "linas-italian-market_banner-1.jpg", "pasta-and-baking", "Pizza Station");
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(6, "general_banner.jpg", "confectionery", null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_name, subcategory_name) VALUES(6, "linas-italian-market_banner-3.jpg", "pasta-and-baking", "Pizza Station");
