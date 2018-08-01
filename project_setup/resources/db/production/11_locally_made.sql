use homit;

-- Catalog - Store Type
INSERT INTO `catalog_store_types`(id, name, display_name, image) VALUES(8,"locally-made", "Locally Made","locally-made.png");

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
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (903, 11763, 8, 9.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (904, 11764, 8, 9.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (905, 11765, 8, 9.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (906, 11766, 8, 14.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (907, 11767, 8, 27.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (908, 11768, 8, 14.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (909, 11769, 8, 27.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (910, 11770, 8, 19.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (911, 11771, 8, 4.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (912, 11772, 8, 11.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (913, 11773, 8, 4.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (914, 11774, 8, 11.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (915, 11775, 8, 8.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (916, 11776, 8, 8.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (917, 11777, 8, 9.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (918, 11778, 8, 14.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (919, 11779, 8, 9.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (920, 11780, 8, 14.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (921, 11781, 8, 13.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (922, 11782, 8, 17.99, 1);
INSERT INTO `catalog_depot`(id,item_id, store_type_id, price, tax) VALUES (923, 11783, 8, 15.99, 1);

-- Catalog - Warehouse
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350072, 896, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350073, 897, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350074, 898, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350075, 899, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350076, 900, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350077, 901, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350078, 902, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350079, 903, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350080, 904, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350081, 905, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350082, 906, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350083, 907, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350084, 908, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350085, 909, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350086, 910, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350087, 911, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350088, 912, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350089, 913, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350090, 914, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350091, 915, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350092, 916, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350093, 917, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350094, 918, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350095, 919, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350096, 920, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350097, 921, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350098, 922, 337, 1000);
INSERT INTO `catalog_warehouse` (id, depot_id, store_id, quantity) VALUES (350099, 923, 337, 1000);

-- Insert Catalog - Types Banners
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(8, "local-market_banner-1.jpg", 24, null, null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(8, "general_banner.jpg", 25, null, null);
INSERT INTO `catalog_store_types_banners` (store_type_id, image, category_id, subcategory_id, product_id) VALUES(8, "local-market_banner-3.jpg", 25, null, null);

-- Catalog Store Types - Category Covers
INSERT INTO `catalog_store_types_category_covers`(id, store_type_id, category_id, cover_image) VALUES (25, 8, 24, "8_dwarf-stars.jpg");
INSERT INTO `catalog_store_types_category_covers`(id, store_type_id, category_id, cover_image) VALUES (26, 8, 25, "8_borderland-food-co.jpg");
INSERT INTO `catalog_store_types_category_covers`(id, store_type_id, category_id, cover_image) VALUES (27, 8, 26, "8_pure-foods-fresh.jpg");
INSERT INTO `catalog_store_types_category_covers`(id, store_type_id, category_id, cover_image) VALUES (28, 8, 27, "8_honey-and-bloom.jpg");