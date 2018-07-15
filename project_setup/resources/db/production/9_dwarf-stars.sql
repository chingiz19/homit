use homit;

/*Insert Catalog - Store Type*/
INSERT INTO `catalog_store_types`(id, name, display_name, image, image_cover) VALUES(7,"dwarf-stars", "Dwarf Stars", "dwarf-stars_icon.png", "dwarf-stars_cover.jpeg");

/*Insert Catalog - Stores*/
INSERT INTO `catalog_stores` (id, id_prefix, name, address, address_latitude, address_longitude, phone_number, store_type) VALUES (336, "s_", "Dwarf Stars", "34 132 3rd Ave SE, Calgary AB", "51.050405", "-114.060812", "4039188836", "7");

/*Insert Catalog - Store Hours*/
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 1, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 2, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 3, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 4, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 5, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 6, "09:00:00", "600", "09:00:00", "600");
INSERT INTO `stores_hours` (store_id, day, open_time, open_duration, open_time_scheduled, open_duration_scheduled) VALUES (336, 7, "09:00:00", "600", "09:00:00", "600");

/*Insert Catalog - Store Depot*/
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (824, 11684, 7, 11.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (825, 11685, 7, 5, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (826, 11686, 7, 5.5, 1);

/*Insert Catalog - Store Warehouse*/
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350000, 824, 336, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350001, 825, 336, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350002, 826, 336, 1000);

/*Insert Catalog - Types Banner*/
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(7, "dwarf-stars_banner-1.jpg", 20, 142, null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(7, "general_banner.jpg", 20, null, null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(7, "dwarf-stars_banner-3.jpg", 20, 143, null);