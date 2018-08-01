use homit;

-- Catalog - Categories
INSERT INTO `catalog_categories` (id, name, display_name, image) VALUES(27, "honey-and-bloom", "Honey & Bloom", "honey-and-bloom.jpg");

-- Catalog - Subcategories
INSERT INTO `catalog_subcategories` (id, name, category_id) VALUES(157, "Health & Body", "27");

-- Catalog - Types
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(918, "Lemongrass patchouli deodorant", "157");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(919, "Floral deodorant", "157");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(920, "Stinky gypsy body wash", "157");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(921, "Peppermint eucalyptus lip balm", "157");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(922, "Spearmint lavender lip balm", "157");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(923, "Bug repellent ", "157");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(924, "Yoga mat cleanser", "157");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(925, "Broken down bath salts", "157");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(926, "Bath salts", "157");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(927, "Soothing balm", "157");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(928, "Face mask charcoal", "157");
INSERT INTO `catalog_types` (id, name, subcategory_id) VALUES(929, "Body scrub coconut", "157");

-- Catalog Packaging - Containers
INSERT INTO `catalog_packaging_containers`(id, name) VALUES(20, "deodorant tube");
INSERT INTO `catalog_packaging_containers`(id, name) VALUES(21, "lip balm tube");
INSERT INTO `catalog_packaging_containers`(id, name) VALUES(22, "spray bottle");
INSERT INTO `catalog_packaging_containers`(id, name) VALUES(23, "ointment container");

-- Catalog Packaging - Packaging
INSERT INTO `catalog_packaging_packagings`(id, name) VALUES(22, "3");

-- Catalog Packaging - Volumes
INSERT INTO `catalog_packaging_volumes`(id, name) VALUES(215, "2.65oz");
INSERT INTO `catalog_packaging_volumes`(id, name) VALUES(216, "16oz");
INSERT INTO `catalog_packaging_volumes`(id, name) VALUES(217, "0.15oz");
INSERT INTO `catalog_packaging_volumes`(id, name) VALUES(218, "4oz");
INSERT INTO `catalog_packaging_volumes`(id, name) VALUES(219, "8oz");
INSERT INTO `catalog_packaging_volumes`(id, name) VALUES(220, "4oz");

-- Catalog - Listing
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1359, "Honey & Bloom", "Dirty Hippy Deodorant - Lemongrass Patchouli", 918);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1360, "Honey & Bloom", "Dirty Hippy Deodorant - Floral", 919);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1361, "Honey & Bloom", "Stinky Gypsy Body Wash", 920);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1362, "Honey & Bloom", "Lip Balm - Peppermint Eucalyptus", 921);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1363, "Honey & Bloom", "Lip Balm - Spearmint Lavender", 922);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1364, "Honey & Bloom", "Buzz Off - Bug Repellent ", 923);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1365, "Honey & Bloom", "Kriya - Yoga Mat (All-purpose) Cleanser", 924);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1366, "Honey & Bloom", "Bath Salts - Bleeding Love", 925);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1367, "Honey & Bloom", "Bath Salts - Wo(man)ly", 926);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1368, "Honey & Bloom", "Soothing Balm", 927);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1369, "Honey & Bloom", "Charcoal Face Mask", 928);
INSERT INTO `catalog_listings`(id, brand, name, type_id) VALUES (1370, "Honey & Bloom", "Coconut Lavender Body Scrub", 929);

-- Catalog - Listing Description
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1359, 6, "ht_ulht_liCoconut Oil, Beeswax, Grapeseed Oil, Shea Butter, Cocoa Butter, Arrowroot Powder, Baking Soda, Kaolin Clay, Bentonite Clay, Witch Hazel, Essential Oilsd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1359, 7, "ht_ulht_liSpread a thin layer of deodorant on underarms after shower. Reapply when needed. d_ht_liht_liFor best results, store product in fridge.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1359, 1, "ht_ulht_liThis all-natural deodorant is created to combat smell. Switching from conventional deodorant to natural includes a small detox phase where your body will get rid of the toxins it has absorbed from regular deodorant. d_ht_liht_liWe have included many detoxifying ingredients to help with that process, such as arrowroot powder and bentonite clay. d_ht_liht_liAs we don't use aluminum, this deodorant won't stop you from sweating, however following the detox phase, your sweat will smell less. The two scents are lemongrass patchouli, and floral.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1359, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1360, 6, "ht_ulht_liCoconut Oil, Beeswax, Grapeseed Oil, Shea Butter, Cocoa Butter, Arrowroot Powder, Baking Soda, Kaolin Clay, Bentonite Clay, Witch Hazel, Essential Oilsd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1360, 7, "ht_ulht_liSpread a thin layer of deodorant on underarms after shower. Reapply when needed. d_ht_liht_liFor best results, store product in fridge.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1360, 1, "ht_ulht_liThis all-natural deodorant is created to combat smell. Switching from conventional deodorant to natural includes a small detox phase where your body will get rid of the toxins it has absorbed from regular deodorant. d_ht_liht_liWe have included many detoxifying ingredients to help with that process, such as arrowroot powder and bentonite clay.d_ht_liht_liAs we don't use aluminum, this deodorant won't stop you from sweating, however following the detox phase, your sweat will smell less. The two scents are lemongrass patchouli, and floral.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1360, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1361, 6, "ht_ulht_liHemp Oil, Neem Leaf, Safflower Oil, Sunflower Oil, Castor Oil, Castile Soap, Glycerin, Vitamin E, Kaolin Clay, Essential Oilsd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1361, 7, "ht_ulht_liLather Stinky Gypsy Body Wash onto body. Rinse well and enjoy the fresh scent.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1361, 1, "ht_ulht_liThis all-natural body wash is safe for bathing in a lake! It is made with moisturizing, skin beneficial oils such as hemp oil, sunflower oil, safflower oil and castor oil, and is extremely moisturizing.d_ht_liht_liThe scent is grapefruit, saje and eucalyptus.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1361, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1362, 6, "ht_ulht_liCoconut Oil, Beeswax, Shea Butter, Grapeseed Oil, Lanolin, Vitamin E, Essential Oilsd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1362, 7, "ht_ulht_liApply generously to lips & kiss your honey to share the love.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1362, 1, "ht_ulht_liThis was created without any artificial waxes or oils, so it won't just cover-up the problem. d_ht_liht_liMade with vitamin E, grapeseed oil, and beeswax, it was designed to actually promote healing on your lips and protect them from further damage.d_ht_lid_ht_ul");
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1362, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1363, 6, "ht_ulht_liCoconut Oil, Beeswax, Shea Butter, Grapeseed Oil, Lanolin, Vitamin E, Essential Oilsd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1363, 7, "ht_ulht_liApply generously to lips & kiss your honey to share the love.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1363, 1, "ht_ulht_liThis was created without any artificial waxes or oils, so it won't just cover-up the problem. d_ht_liht_liMade with vitamin E, grapeseed oil, and beeswax, it was designed to actually promote healing on your lips and protect them from further damage.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1363, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1364, 6, "ht_ulht_liWitch Hazel, Vinegar, Distilled Water, Essential Oilsd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1364, 7, "ht_ulht_liSpray on your body and surrounding area to keep the critters away.d_ht_liht_liShake well before use - separation is normal.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1364, 1, "ht_ulht_liBuzz Off is an all-natural bug repellent crafted with essential oils that are effective against bugs such as ticks and mosquitoes.d_ht_liht_liIt is crafted without chemicals - no DEET involved!d_ht_liht_liThis is the kind of bug repellent you can spray and still go to dinner after.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1364, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1365, 6, "ht_ulht_liDistilled Water, Vinegar, Essential Oilsd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1365, 7, "ht_ulht_liApply a generous amount to your mat after your practice. Wipe clean with a cloth.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1365, 1, "ht_ulht_liMade without chemicals, this all-natural cleaner can be used anywhere from your yoga mat to your kitchen counter.d_ht_liht_liThe essential oils are grapefruit, tea trea, lavender, and lemongrass.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1365, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1366, 6, "ht_ulht_liBaking Soda, Arrowroot Powder, Almond Oil, Lavender Flower Buds, Coconut Milk Powder, Epsom Salts, Sea Salt, Citric Acid, Essential Oils (Saje and Lavender)d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1366, 7, "ht_ulht_liTurn on your tuens and light a candle. After filling your bathtub with water at your perfect temperature, pour a generous amount of salts into your bathwater.d_ht_liht_liEnter your happy place and relax!d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1366, 1, "ht_ulht_liEssentially a broken down bath bomb, so you don't have to break it down yourself! It's created the same way as a bath bomb, so it will still fizz in your tub, however I added sea salt and epsom salts to get extra relaxation benefits.d_ht_liht_liIt's made with almond oil, to leave you feeling super moisturized when leaving the tub.d_ht_liht_liThe two scents are Wo(man)ly - Cedarwood and Lemongrass with Calendula flowers in it, and Bleeding Love - Saje and Lavender with Lavender buds in it.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1366, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1367, 6, "ht_ulht_liBaking Soda, Arrowroot Powder, Almond Oil, Calendula Flower Buds, Coconut Milk Powder, Epsom Salts, Sea Salt, Citric Acid, Essential Oils (Lemongrass and Cedarwood)d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1367, 7, "ht_ulht_liTurn on your tuens and light a candle. After filling your bathtub with water at your perfect temperature, pour a generous amount of salts into your bathwater.d_ht_liht_liEnter your happy place and relax!d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1367, 1, "ht_ulht_liEssentially a broken down bath bomb, so you don't have to break it down yourself! It's created the same way as a bath bomb, so it will still fizz in your tub, however I added sea salt and epsom salts to get extra relaxation benefits.d_ht_liht_liIt's made with almond oil, to leave you feeling super moisturized when leaving the tub.d_ht_liht_liThe two scents are Wo(man)ly - Cedarwood and Lemongrass with Calendula flowers in it, and Bleeding Love - Saje and Lavender with Lavender buds in it.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1367, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1368, 6, "ht_ulht_liCastor Oil, Olive Oil, Avocado Oil, Calendula Flower Oil, Vitamin E, Beeswax, Lanolin, Shea Butter, Sunflower Oil, Tea Tree Essential Oil, Lavender Essential Oild_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1368, 7, "ht_ulht_liApply topically to any areas of irritation. Beneficial for use on cuts, scrapes, burns, bug bites, eczema, dry skin and acne.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1368, 1, "ht_ulht_liMade with the calendula flower, this balm has many healing properties.d_ht_liht_liIt's designed for spot treatment on cuts, burns, scrapes, eczema, acne, etc.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1368, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1369, 6, "ht_ulht_liArrowroot Powder, Bentonite Clay, Grapeseed Oil, Charcoal, Honey, Coconut Milk Powder, Orange Peel, Witch Hazel, Essential Oilsd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1369, 7, "ht_ulht_liDab a thin layer of our Charcoal Mask all over your face & leave for 15-20 minutes. Rinse mask off & wash-up with your favourite cleanser. Complete with your go-to moisturizer.d_ht_liht_liFeel the toxins being drawn to the surface of your skin & appear fresh and renewed. This detoxifying face mask is a helping hand to acne prone & blemished skin.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1369, 1, "ht_ulht_liThis mask was designed to detox and heal. Made with charcoal, arrowroot powder, and bentonite clay, this mask will pull toxins from your skin, and heal what's underneath with honey and grapeseed oil.d_ht_liht_liIt was designed for trouble skin, however is suitable for all skin types.d_ht_liht_liIt's very soft and cleansing - it won't peel though, so you won't end up on youtube!d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1369, 4, "Canada" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1370, 6, "ht_ulht_liCoconut, Sea Salt, Epsom Salt, Coconut Milk Powder, Lavender Buds, Coconut Oil, Sunflower Oil, Shea Butter, Ground Almondsd_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1370, 7, "ht_ulht_liApply a generous amount onto legs and body to maximize exfoliating and moisturizing benefits Rinse off after 3-5 minutes using circular motions and enjoy your soft skin.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1370, 1, "ht_ulht_liThis body scrub is designed to exfoliate your skin and moisturize it with sunflower oil, coconut oil, and shea butter. d_ht_liht_liIt doesn't have any essential oils in it, however I left the lavender buds in full to help exfoliate, and break down during the motion, releasing lavender oil straight from the source! Other than that, it smells like cookies.d_ht_lid_ht_ul" );
INSERT INTO `catalog_listings_descriptions` (listing_id, description_key, description) VALUES ( 1370, 4, "Canada" );

-- Catalog - Product
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7657, 1359, "ddt_1359.jpeg", 20);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7658, 1360, "ddt_1360.jpeg", 20);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7659, 1361, "b_1361.jpeg", 2);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7660, 1362, "lbt_1362.jpeg", 21);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7661, 1363, "lbt_1363.jpeg", 21);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7662, 1364, "spb_1364.jpeg", 22);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7663, 1365, "spb_1365.jpeg", 22);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7664, 1366, "bg_1366.jpeg", 13);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7665, 1367, "bg_1367.jpeg", 13);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7666, 1368, "onc_1368.jpeg", 23);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7667, 1369, "jr_1369.jpeg", 6);
INSERT INTO `catalog_products`(id,listing_id, image, container_id) VALUES (7668, 1370, "jr_1370.jpeg", 6);

-- Catalog - Item
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11766, 7657, 9, 215);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11767, 7657, 10, 215);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11768, 7658, 9, 215);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11769, 7658, 10, 215);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11770, 7659, 9, 216);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11771, 7660, 9, 217);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11772, 7660, 22, 217);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11773, 7661, 9, 217);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11774, 7661, 22, 217);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11775, 7662, 9, 218);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11776, 7663, 9, 219);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11777, 7664, 9, 18);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11778, 7664, 10, 18);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11779, 7665, 9, 18);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11780, 7665, 10, 18);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11781, 7666, 9, 99);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11782, 7667, 9, 218);
INSERT INTO `catalog_items` (id, product_id, packaging_id, volume_id) VALUES (11783, 7668, 9, 219);

-- Catalog - Depot
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

-- Catalog Store Types - Category Covers
INSERT INTO `catalog_store_types_category_covers`(id, store_type_id, category_id, cover_image) VALUES (28, 8, 27, "8_honey-and-bloom.jpg");