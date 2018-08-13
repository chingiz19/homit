let router = require("express").Router();
let _ = require("lodash");

let homit_tags = {
    "d_ht_em": "</em>",
    "ht_em": "<em>",
    "d_ht_b": "</b>",
    "ht_b": "<b>",
    "d_ht_ul": "</ul>",
    "ht_ul": "<ul>",
    "d_ht_li": "</li>",
    "ht_li": "<li>"
}

router.get("/product/:storeName/:productName/:productId", async function (req, res, next) {
    if (!req.query || Object.keys(req.query) > 0) {
        return res.redirect("/hub" + req.path);
    }else if (isNaN(req.params.productId)){
        return res.redirect("/notfound");
    }

    let product = await Catalog.getProductPageItemsByProductId(req.params.storeName, req.params.productId);
    let similarProducts = await Catalog.getSimilarProducts(req.params.productId);
    let validationUrl = "/product/" + product.store_type_name + "/" + _.toLower(clearProductUrl(_.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-"))) + "/" + product.product_id;

    if (!product || validationUrl != req.url) {
        return res.redirect("/notfound");
    }

    // Assign variables
    req.options.ejs.product_brand = product.brand;
    req.options.ejs.product_name = product.name;

    if (product.store_type_name == "linas-italian-market") {
        req.options.ejs.store_type_display_name = '<li><span class="bold">Sold By: </span><a href="' + "https://linasmarket.com/" + '" target="_blank" itemprop="additionalProperty">' + _.startCase(product.store_type_display_name, '-', ' ') + '</a></li>';
    } else {
        req.options.ejs.store_type_display_name = undefined;
    }

    if (product.details.country_of_origin) {
        req.options.ejs.country_of_origin = '<li><span class="bold">Country of Origin:</span><span itemprop="additionalProperty"> ' + product.details.country_of_origin + '</span></li>';
    } else {
        req.options.ejs.country_of_origin = "";
    }

    if (product.details.producer) {
        req.options.ejs.producer = '<li><span class="bold">Made by:</span><span itemprop="manufacturer"> ' + product.details.producer + '</span></li>';
    } else {
        req.options.ejs.producer = "";
    }

    if (product.details.alcohol_content) {
        req.options.ejs.alcohol_content = '<li><span class="bold">Alcohol/Vol:</span><span itemprop="additionalProperty"> ' + product.details.alcohol_content + '</span></li>';
    } else {
        req.options.ejs.alcohol_content = "";
    }

    if (product.type) {
        req.options.ejs.product_type = '<li><span class="bold">Type:</span><span itemprop="additionalType"> ' + product.type + '</span></li>';
    } else {
        req.options.ejs.product_type = "";
    }

    if (product.details.preview) {
        req.options.ejs.preview = '<section class="preview-sec" itemprop="description"><div class="description"><h3 class="sub-header">Product Description:</h3><p> ' + convertHomitTags(product.details.preview) + '</p></div></section>';
    } else {
        req.options.ejs.preview = "";
    }

    if (product.details.ingredients) {
        req.options.ejs.ingredients = '<section class="ingredients-sec" itemprop="disambiguatingDescription"><div class="ingredients"><h3 class="sub-header">Ingredients:</h3><span> ' + convertHomitTags(product.details.ingredients) + '</span></div></section>';
    } else {
        req.options.ejs.ingredients = "";
    }

    if (product.details.serving_suggestions) {
        req.options.ejs.serving_suggestions = '<section class="preview-sec" itemprop="additionalProperty"><div class="description"><h3 class="sub-header">Serving Sugestions:</h3><p> ' + convertHomitTags(product.details.serving_suggestions) + '</p></div></section>';
    } else {
        req.options.ejs.serving_suggestions = "";
    }

    if (product.images.length > 0) {
        req.options.ejs.product_image = '<img itemprop="image" width="0px" height="0px" src="' + product.images[0] + '">';
    }

    req.options.ejs.product_images = JSON.stringify({ "images": product.images });
    req.options.ejs.see_more_url = "/hub/" + product.store_type_name + "/" + product.category;
    if (similarProducts.length < 12) {
        let remainder = 12 - similarProducts.length;
        let tmpRecommended = recommended_products[product.category].slice(0, remainder);
        req.options.ejs.recommended_products = JSON.stringify(similarProducts.concat(tmpRecommended));
    } else {
        req.options.ejs.recommended_products = JSON.stringify(similarProducts);
    }

    req.options.ejs.og_image = product.images[0];

    req.options.ejs.title = _.trim(product.brand + _.trimEnd(" " + product.name) + " - Delivered to Your Doorstep | Homit");

    if (product.details.preview) {
        req.options.ejs.meta_description = _.trim(product.brand + _.trimEnd(" " + product.name) + " - 45 minutes delivery in Calgary. " + clearHomitTags(product.details.preview).split(".")[0]);
    } else {
        req.options.ejs.meta_description = _.trim(product.brand + _.trimEnd(" " + product.name) + " - 45 minutes delivery in Calgary. Let us Home It and liberate your precious time.");
    }

    product.product_variants.selectedVolume = 0;
    product.product_variants.selectedPack = 0;
    product.product_variants.container = product.container;

    req.options.ejs.product = JSON.stringify(product);

    res.render("product.ejs", req.options.ejs);
});

router.get('/:parent/', async function (req, res, next) {
    req.options.ejs.title = _.startCase(req.params.parent) + " Page | Homit";
    //TODO: og image
    res.render("store.ejs", req.options.ejs);
});

router.get('/:parent/:category', async function (req, res, next) {
    if (!await Catalog.verifyStoreCategory(req.params.parent, req.params.category)) {
        return res.redirect("/notfound");
    }

    try {
        req.options.ejs.title = _.startCase(req.params.category) + " Catalog | Homit";
        req.options.ejs.loadedStore = _.startCase(req.params.parent);
        req.options.ejs.selectedCategory = req.params.category.replace(/-/g, " ");
        res.render("catalog.ejs", req.options.ejs);
    } catch (e) {
        next();
    }
});

function convertHomitTags(string) {
    let tmpString = string;
    for (tag in homit_tags) {
        tmpString = tmpString.replace(new RegExp(tag, 'g'), homit_tags[tag]);
    }
    return tmpString;
}

function clearProductUrl(path) {
    let tempPath = path;
    tempPath = tempPath.replace(/[#&',.%/()]/g, "");
    tempPath = tempPath.replace(/---/g, "-");
    tempPath = tempPath.replace(/--/g, "-");
    return tempPath;
}

function clearHomitTags(string) {
    let tmpString = string;
    for (tag in homit_tags) {
        tmpString = tmpString.replace(new RegExp(tag, 'g'), "");
    }
    return tmpString;
}

let recommended_products = {
    "frozen-food": [
        {
            "brand": "Painted Turtle",
            "name": "Cabernet Sauvignon",
            "store_type_name": "liquor-station",
            "product_id": 1001,
            "category": "wine",
            "image": "b_3001.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 12.49
        },
        {
            "brand": "Strongbow",
            "name": "Dark Fruit Cider",
            "store_type_name": "liquor-station",
            "product_id": 80,
            "category": "cider-and-cooler",
            "image": "c_1057.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 12.49
        },
        {
            "brand": "Lina's Market",
            "name": "Fresh Pizza Dough",
            "store_type_name": "linas-italian-market",
            "product_id": 7646,
            "category": "pasta-and-baking",
            "image": "wrp_1348.jpeg",
            "packaging": "1",
            "volume": "500g",
            "price": 12.49
        },
        {
            "brand": "Dwarf Stars",
            "name": "Pumpkin Seed Butter Cups",
            "store_type_name": "locally-made",
            "product_id": 7646,
            "category": "chocolate-and-bar",
            "image": "bg_1289.jpeg",
            "packaging": "1",
            "volume": "42g",
            "price": 5
        },
        {
            "brand": "Aurora",
            "name": "Sardines in Oil",
            "store_type_name": "linas-italian-store",
            "product_id": 6582,
            "category": "canned-and-jarred",
            "image": "c_11081.jpeg",
            "packaging": "1",
            "volume": "120g",
            "price": 1.99
        }
    ],
    "deli-and-meat": [
        {
            "brand": "Dwarf Stars",
            "name": "Originals",
            "store_type_name": "locally-made",
            "product_id": 7586,
            "category": "chocolate-and-bar",
            "image": "bg_1288.jpeg",
            "packaging": "1",
            "volume": "120g",
            "price": 11.99
        },
        {
            "brand": "Grissini Bon",
            "name": "Breadsticks with Rosemary",
            "store_type_name": "linas-italian-market",
            "product_id": 6837,
            "category": "baked-goods",
            "image": "btc_11269.jpeg",
            "packaging": "1",
            "volume": "250g",
            "price": 4.49
        },
        {
            "brand": "Molson",
            "name": "Canadian Cider",
            "store_type_name": "liquor-station",
            "product_id": 31,
            "category": "cider-and-cooler",
            "image": "b_1020.jpeg",
            "packaging": "6",
            "volume": "341ml",
            "price": 17.49
        },
        {
            "brand": "Advil",
            "name": "Liqui Gels",
            "store_type_name": "snack-vendor",
            "product_id": 6503,
            "category": "everyday-needs",
            "image": "p_11003.jpeg",
            "packaging": "16ct",
            "volume": "200mg",
            "price": 7.19
        },
        {
            "brand": "19 Crimes",
            "name": "Shiraz Durif",
            "store_type_name": "liquor-station",
            "product_id": 1161,
            "category": "wine",
            "image": "b_3161.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 18.09
        }

    ],
    "dairy": [
        {
            "brand": "GiGi",
            "name": "Fig Spread",
            "store_type_name": "linas-italian-market",
            "product_id": 7249,
            "category": "condiments",
            "image": "jr_11749.jpeg",
            "packaging": "1",
            "volume": "380ml",
            "price": 6.99
        },
        {
            "brand": "Blasted Church",
            "name": "Unorthodox Chardonnay",
            "store_type_name": "liquor-station",
            "product_id": 1022,
            "category": "wine",
            "image": "b_3022.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 29.99
        },
        {
            "brand": "Taylors of Horrogate",
            "name": "Organic Chamomile",
            "store_type_name": "linas-italian-market",
            "product_id": 7213,
            "category": "coffee-and-tea",
            "image": "bx_11713.jpeg",
            "packaging": "1",
            "volume": "30g",
            "price": 6.99
        },
        {
            "brand": "Duo Penotti",
            "name": "Hazelnut Pasta",
            "store_type_name": "linas-italian-market",
            "product_id": 7231,
            "category": "condiments",
            "image": "jr_11731.jpeg",
            "packaging": "1",
            "volume": "750g",
            "price": 9.99
        },
        {
            "brand": "Perrier",
            "name": "Carbonated Natural Spring Water",
            "store_type_name": "linas-italian-market",
            "product_id": 7164,
            "category": "beverages",
            "image": "b_11664.jpeg",
            "packaging": "1",
            "volume": "1L",
            "price": 1.29
        }
    ],
    "beer": [
        {
            "brand": "Doritos",
            "name": "Cheese",
            "store_type_name": "snack-vendor",
            "product_id": 4528,
            "category": "snacks",
            "image": "p_9028.jpeg",
            "packaging": "1",
            "volume": "family",
            "price": 4.79
        },
        {
            "brand": "D.L Jardine's",
            "name": "Salsa Bobos Medium",
            "store_type_name": "linas-italian-market",
            "product_id": 6733,
            "category": "condiments",
            "image": "jr_11360.jpeg",
            "packaging": "1",
            "volume": "453gm",
            "price": 9.99
        },
        {
            "brand": "Tostitos",
            "name": "Round",
            "store_type_name": "snack-vendor",
            "product_id": 4531,
            "category": "snacks",
            "image": "p_9031.jpeg",
            "packaging": "1",
            "volume": "regular",
            "price": 4.49
        },
        {
            "brand": "Jack Link's",
            "name": "Cholula",
            "store_type_name": "snack-vendor",
            "product_id": 4516,
            "category": "snacks",
            "image": "p_9016.jpeg",
            "packaging": "1",
            "volume": "80gm",
            "price": 6.99
        },
        {
            "brand": "Browne",
            "name": "Corkscrew Bottle Opener",
            "store_type_name": "liquor-station",
            "product_id": 6003,
            "category": "party-supply",
            "image": "o_10003.jpeg",
            "packaging": "1",
            "volume": "4.5in",
            "price": 3.99
        }
    ],
    "cider-and-cooler": [
        {
            "brand": "Jack Link's",
            "name": "Sriracha",
            "store_type_name": "snack-vendor",
            "product_id": 4518,
            "category": "snacks",
            "image": "p_9018.jpeg",
            "packaging": "1",
            "volume": "80gm",
            "price": 6.99
        },
        {
            "brand": "Shock Top",
            "name": "Belgian White",
            "store_type_name": "liquor-station",
            "product_id": 7468,
            "category": "beer",
            "image": "b_1173.jpeg",
            "packaging": "6",
            "volume": "341ml",
            "price": 16.73
        },
        {
            "brand": "Cheetos",
            "name": "Cheddar Jalapeno",
            "store_type_name": "snack-vendor",
            "product_id": 4505,
            "category": "snacks",
            "image": "p_9005.jpeg",
            "packaging": "1",
            "volume": "regular",
            "price": 3.69
        },
        {
            "brand": "Rummo",
            "name": "Linguine",
            "store_type_name": "linas-italian-market",
            "product_id": 6508,
            "category": "pasta-and-baking",
            "image": "bx_11008.jpeg",
            "packaging": "1",
            "volume": "500gm",
            "price": 2.69
        },
        {
            "brand": "Augusto",
            "name": "Truffle Pesto",
            "store_type_name": "linas-italian-market",
            "product_id": 6747,
            "category": "condiments",
            "image": "jr_11374.jpeg",
            "packaging": "1",
            "volume": "180gm",
            "price": 6.99
        }
    ],
    "wine": [
        {
            "brand": "Loacker",
            "name": "Coconut",
            "store_type_name": "linas-italian-market",
            "product_id": 7300,
            "category": "confectionery",
            "image": "bx_11800.jpeg",
            "packaging": "1",
            "volume": "100gm",
            "price": 4.49
        },
        {
            "brand": "Browne",
            "name": "Corkscrew Wing Bottle Opener",
            "store_type_name": "liquor-station",
            "product_id": 6023,
            "category": "party-supply",
            "image": "o_10023.jpeg",
            "packaging": "1",
            "volume": "6in",
            "price": 3.99
        },
        {
            "brand": "Sea Change Seafoods",
            "name": "Candied Wild Smoked Salmon",
            "store_type_name": "linas-italian-market",
            "product_id": 6613,
            "category": "dry-packaged",
            "image": "cntr_11112.jpeg",
            "packaging": "1",
            "volume": "70mg",
            "price": 14.99
        },
        {
            "brand": "Mozaik",
            "name": "Classic Wine Glass",
            "store_type_name": "liquor-station",
            "product_id": 6013,
            "category": "party-supply",
            "image": "p_10013.jpeg",
            "packaging": "1",
            "volume": "15oz",
            "price": 9.49
        },
        {
            "brand": "Perugina",
            "name": "Milk Chocolate",
            "store_type_name": "linas-italian-market",
            "product_id": 7287,
            "category": "confectionery",
            "image": "br_11787.jpeg",
            "packaging": "1",
            "volume": "99gm",
            "price": 3.99
        }
    ],
    "spirit": [
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "store_type_name": "snack-vendor",
            "product_id": 5533,
            "category": "beverages",
            "image": "p_9528.jpeg",
            "packaging": "1",
            "volume": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Red Bull",
            "name": "Classic",
            "store_type_name": "snack-vendor",
            "product_id": 5531,
            "category": "beverages",
            "image": "c_9526.jpeg",
            "packaging": "4",
            "volume": "250ml",
            "price": 10.49
        },
        {
            "brand": "Lazzaroni",
            "name": "Crackers with Pizza Flavor",
            "store_type_name": "linas-italian-market",
            "product_id": 6832,
            "category": "snacks",
            "image": "btc_11264.jpeg",
            "packaging": "1",
            "volume": "200gm",
            "price": 4.99
        },
        {
            "brand": "Mott's",
            "name": "Clamato The Original",
            "store_type_name": "snack-vendor",
            "product_id": 5516,
            "category": "beverages",
            "image": "b_9511.jpeg",
            "packaging": "1",
            "volume": "32oz",
            "price": 3.99
        },
        {
            "brand": "Apothic",
            "name": "Blend Red",
            "store_type_name": "liquor-station",
            "product_id": 1044,
            "category": "wine",
            "image": "b_3044.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 14.99
        }
    ],
    "liqueur": [
        {
            "brand": "Grand Aroma",
            "name": "Lemon Flavoured Extra Virgin Olive Oil",
            "store_type_name": "linas-italian-market",
            "product_id": 4543,
            "category": "oil-and-vinegar",
            "image": "b_11280.jpeg",
            "packaging": "1",
            "volume": "250ml",
            "price": 7.99
        },
        {
            "brand": "Maitre Truffout",
            "name": "Fancy Truffles with Coffee",
            "store_type_name": "linas-italian-market",
            "product_id": 7283,
            "category": "confectionery",
            "image": "bx_11783.jpeg",
            "packaging": "1",
            "volume": "200gm",
            "price": 4.99
        },
        {
            "brand": "Guinness",
            "name": "Draught",
            "store_type_name": "liquor-station",
            "product_id": 83,
            "category": "beer",
            "image": "c_1060.jpeg",
            "packaging": "4",
            "volume": "440ml",
            "price": 14.99
        },
        {
            "brand": "Krino's",
            "name": "Cocktail - Gigantic Green Stuffed Olives",
            "store_type_name": "linas-italian-market",
            "product_id": 6909,
            "category": "canned-and-jarred",
            "image": "jr_11495.jpeg",
            "packaging": "1",
            "volume": "500ml",
            "price": 7.99
        },
        {
            "brand": "Touch Bamboo",
            "name": "Paddle Skewer",
            "store_type_name": "liquor-station",
            "product_id": 6014,
            "category": "party-supply",
            "image": "p_10014.jpeg",
            "packaging": "50",
            "volume": "60in",
            "price": 3.99
        }
    ],
    "beverages": [
        {
            "brand": "Twizzler",
            "name": "Strawberry",
            "store_type_name": "snack-vendor",
            "product_id": 4537,
            "category": "snacks",
            "image": "p_9037.jpeg",
            "packaging": "1",
            "volume": "227gm",
            "price": 2.99
        },
        {
            "brand": "Natur Puglia",
            "name": "Taralli with Pizza Flavour",
            "store_type_name": "linas-italian-market",
            "product_id": 6830,
            "category": "baked-goods",
            "image": "btc_11262.jpeg",
            "packaging": "1",
            "volume": "250gm",
            "price": 3.99
        },
        {
            "brand": "Stella Artois",
            "name": "Pale Lager",
            "store_type_name": "liquor-station",
            "product_id": 54,
            "category": "beer",
            "image": "b_1039.jpeg",
            "packaging": "6",
            "volume": "330gm",
            "price": 18.49
        },
        {
            "brand": "Cocktail Shaker",
            "name": "30oz",
            "store_type_name": "liquor-station",
            "product_id": 6012,
            "category": "party-supply",
            "image": "o_10012.jpeg",
            "packaging": "1",
            "volume": "30oz",
            "price": 14.49
        },
        {
            "brand": "Hershey's",
            "name": "Cookies & Cream",
            "store_type_name": "snack-vendor",
            "product_id": 4541,
            "category": "snacks",
            "image": "br_9041.jpeg",
            "packaging": "1",
            "volume": "100gm",
            "price": 3.19
        }
    ],
    "everyday-needs": [
        {
            "brand": "Saltwest Naturas",
            "name": "Sun Dried Tomato Basil",
            "store_type_name": "linas-italian-market",
            "product_id": 6668,
            "category": "herbs-and-spices",
            "image": "cntr_11167.jpeg",
            "packaging": "1",
            "volume": "40gm",
            "price": 5.99
        },
        {
            "brand": "Bevara",
            "name": "Sealing Cleaps",
            "store_type_name": "liquor-station",
            "product_id": 6022,
            "category": "party-supply",
            "image": "p_10022.jpeg",
            "packaging": "10",
            "volume": "4in",
            "price": 1.39
        },
        {
            "brand": "Mozaik",
            "name": "Cutlery Set",
            "store_type_name": "party-supply",
            "product_id": 6007,
            "category": "party-supply",
            "image": "p_10007.jpeg",
            "packaging": "80",
            "volume": "combo",
            "price": 10.99
        },
        {
            "brand": "Lindt",
            "name": "Hazelnut Chocolate",
            "store_type_name": "snack-vendor",
            "product_id": 4539,
            "category": "snacks",
            "image": "br_9039.jpeg",
            "packaging": "1",
            "volume": "100gm",
            "price": 3.19
        },
        {
            "brand": "Grissini Bon",
            "name": "Breadsticks with Olive Oil",
            "store_type_name": "linas-italian-market",
            "product_id": 6838,
            "category": "baked-goods",
            "image": "bx_11270.jpeg",
            "packaging": "1",
            "volume": "250gm",
            "price": 3.99
        }
    ],
    "party-supply": [
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "store_type_name": "snack-vendor",
            "product_id": 5533,
            "category": "beverages",
            "image": "p_9528.jpeg",
            "packaging": "1",
            "volume": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Absolut",
            "name": "Vodka",
            "store_type_name": "liquor-station",
            "product_id": 2500,
            "category": "spirit",
            "image": "b_5000.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 28.99
        },
        {
            "brand": "Lindt",
            "name": "Hazelnut Chocolate",
            "store_type_name": "snack-vendor",
            "product_id": 4539,
            "category": "snacks",
            "image": "br_9039.jpeg",
            "packaging": "1",
            "volume": "100gm",
            "price": 3.19
        },
        {
            "brand": "Jagermeister",
            "name": "Herbal Liqueur",
            "store_type_name": "liquor-station",
            "product_id": 3500,
            "category": "liqueur",
            "image": "b_7000.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 31.99
        },
        {
            "brand": "Rockstar",
            "name": "Classic",
            "store_type_name": "snack-vendor",
            "product_id": 5532,
            "category": "beverages",
            "image": "c_9527.jpeg",
            "packaging": "1",
            "volume": "473ml",
            "price": 3.59
        }
    ],
    "snacks": [
        {
            "brand": "Preservation",
            "name": "Bloody Mary mix",
            "store_type_name": "linas-italian-market",
            "product_id": 7107,
            "category": "beverages",
            "image": "b_11607.jpeg",
            "packaging": "1",
            "volume": "946ml",
            "price": 11.99
        },
        {
            "brand": "Bud Light",
            "name": "Lager",
            "store_type_name": "liquor-station",
            "product_id": 71,
            "category": "beer",
            "image": "b_1052.jpeg",
            "packaging": "6",
            "volume": "341ml",
            "price": 15.99
        },
        {
            "brand": "Purex",
            "name": "Bathroom Tissue Paper",
            "store_type_name": "snack-vendor",
            "product_id": 6500,
            "category": "everyday-needs",
            "image": "p_11000.jpeg",
            "packaging": "4",
            "volume": "D. Roll",
            "price": 5.29
        },
        {
            "brand": "Perrier",
            "name": "Sparkling Water",
            "store_type_name": "snack-vendor",
            "product_id": 5534,
            "category": "beverages",
            "image": "b_9529.jpeg",
            "packaging": "6",
            "volume": "500ml",
            "price": 10.74
        },
        {
            "brand": "Simply",
            "name": "Lemonade Orange",
            "store_type_name": "snack-vendor",
            "product_id": 5509,
            "category": "beverages",
            "image": "b_9506.jpeg",
            "packaging": "1",
            "volume": "1.75L",
            "price": 5.99
        }
    ],
    "canned-and-jarred": [
        {
            "brand": "Joe tea",
            "name": "Peach",
            "store_type_name": "linas-italian-market",
            "product_id": 7099,
            "category": "beverages",
            "image": "b_11599.jpeg",
            "packaging": "1",
            "volume": "591ml",
            "price": 6.49
        },
        {
            "brand": "Krave",
            "name": "Chili Lime",
            "store_type_name": "snack-vendor",
            "product_id": 4524,
            "category": "snacks",
            "image": "p_9024.jpeg",
            "packaging": "1",
            "volume": "75gm",
            "price": 7.99
        },
        {
            "brand": "Heineken",
            "name": "Pale Lager",
            "store_type_name": "liquor-station",
            "product_id": 41,
            "category": "beer",
            "image": "b_1028.jpeg",
            "packaging": "6",
            "volume": "330ml",
            "price": 17.99
        },
        {
            "brand": "Purex",
            "name": "Bathroom Tissue Paper",
            "store_type_name": "snack-vendor",
            "product_id": 6500,
            "category": "everyday-needs",
            "image": "p_11000.jpeg",
            "packaging": "4",
            "volume": "Double R.",
            "price": 5.29
        },
        {
            "brand": "Rummo",
            "name": "Rigatoni",
            "store_type_name": "linas-italian-market",
            "product_id": 6509,
            "category": "pasta-and-baking",
            "image": "bx_11009.jpeg",
            "packaging": "1",
            "volume": "500gm",
            "price": 2.69
        }
    ],
    "pasta-and-baking": [
        {
            "brand": "Dalla Terra",
            "name": "Mediterranean Appetizer",
            "store_type_name": "linas-italian-market",
            "product_id": 6843,
            "category": "canned-and-jarred",
            "image": "jr_11429.jpeg",
            "packaging": "1",
            "volume": "375ml",
            "price": 3.99
        },
        {
            "brand": "San Pellegrino",
            "name": "Sparkling Blood Orange",
            "store_type_name": "linas-italian-market",
            "product_id": 7110,
            "category": "beverages",
            "image": "b_11610.jpeg",
            "packaging": "1",
            "volume": "330ml",
            "price": 1.69
        },
        {
            "brand": "Gouda's Glorie",
            "name": "Curry Kruiden Ketchup Original",
            "store_type_name": "linas-italian-market",
            "product_id": 6719,
            "category": "condiments",
            "image": "cntr_11218.jpeg",
            "packaging": "1",
            "volume": "930gm",
            "price": 9.99
        },
        {
            "brand": "Mott's Clamato",
            "name": "The Original",
            "store_type_name": "snack-vendor",
            "product_id": 5516,
            "category": "beverages",
            "image": "b_9511.jpeg",
            "packaging": "1",
            "volume": "32oz",
            "price": 3.99
        },
        {
            "brand": "Miller",
            "name": "Lite",
            "store_type_name": "liquor-station",
            "product_id": 27,
            "category": "beer",
            "image": "b_1018.jpeg",
            "packaging": "12",
            "volume": "341ml",
            "price": 27.99
        }
    ],
    "grains-and-legumes": [
        {
            "brand": "Bellei",
            "name": "Balsamic Vinegar of Modena White Label",
            "store_type_name": "linas-italian-market",
            "product_id": 7022,
            "category": "oil-and-vinegar",
            "image": "b_11522.jpeg",
            "packaging": "1",
            "volume": "250ml",
            "price": 15.99
        },
        {
            "brand": "Peller Estates",
            "name": "Chardonnay",
            "store_type_name": "liquor-station",
            "product_id": 1015,
            "category": "wine",
            "image": "b_3015.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 12.69
        },
        {
            "brand": "Allessia's",
            "name": "Breadsticks with Olive Oil",
            "store_type_name": "linas-italian-market",
            "product_id": 6815,
            "category": "baked-goods",
            "image": "bx_11247.jpeg",
            "packaging": "1",
            "volume": "100gm",
            "price": 2.49
        },
        {
            "brand": "Advil",
            "name": "Liqui Gels",
            "store_type_name": "snack-vendor",
            "product_id": 6503,
            "category": "everyday-needs",
            "image": "p_11003.jpeg",
            "packaging": "16ct",
            "volume": "200gm",
            "price": 7.19
        },
        {
            "brand": "Acqua Panna",
            "name": "Toscana Spring Water",
            "store_type_name": "linas-italian-market",
            "product_id": 7165,
            "category": "beverages",
            "image": "b_11665.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 2.49
        }
    ],
    "herbs-and-spices": [
        {
            "brand": "Rummo",
            "name": "Lasagne",
            "store_type_name": "linas-italian-market",
            "product_id": 6510,
            "category": "pasta-and-baking",
            "image": "bx_11010.jpeg",
            "packaging": "1",
            "volume": "500gm",
            "price": 2.69
        },
        {
            "brand": "Augusto",
            "name": "Paprika Pesto",
            "store_type_name": "linas-italian-market",
            "product_id": 6720,
            "category": "condiments",
            "image": "jr_11219.jpeg",
            "packaging": "1",
            "volume": "180gm",
            "price": 6.99
        },
        {
            "brand": "Lavazza",
            "name": "Gran Selezione Dark Roast",
            "store_type_name": "linas-italian-market",
            "product_id": 7197,
            "category": "coffee-and-tea",
            "image": "bg_11697.jpeg",
            "packaging": "1",
            "volume": "340gm",
            "price": 11.49
        },
        {
            "brand": "Matua",
            "name": "Pinot Noir Rose",
            "store_type_name": "liquor-station",
            "product_id": 1144,
            "category": "wine",
            "image": "b_3144.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 18.99
        },
        {
            "brand": "Lindt",
            "name": "White Chocolate",
            "store_type_name": "snack-vendor",
            "product_id": 4540,
            "category": "snacks",
            "image": "br_9040.jpeg",
            "packaging": "1",
            "volume": "100gm",
            "price": 3.19
        }
    ],
    "dry-packaged": [
        {
            "brand": "Canada Dry",
            "name": "Ginger Ale",
            "store_type_name": "snack-vendor",
            "product_id": 5506,
            "category": "beverages",
            "image": "b_9503.jpeg",
            "packaging": "1",
            "volume": "1L",
            "price": 2.79
        },
        {
            "brand": "Steven Smith Teamaker",
            "name": "Mao Feng Shui",
            "store_type_name": "linas-italian-market",
            "product_id": 7218,
            "category": "coffee-and-tea",
            "image": "bx_11718.jpeg",
            "packaging": "1",
            "volume": "37gm",
            "price": 12.99
        },
        {
            "brand": "Riso Cariotti",
            "name": "Arborio Superfine",
            "store_type_name": "linas-italian-market",
            "product_id": 6542,
            "category": "grains-and-legumes",
            "image": "bx_11041.jpeg",
            "packaging": "1",
            "volume": "1kg",
            "price": 5.99
        },
        {
            "brand": "Baileys",
            "name": "Irish Cream Original",
            "store_type_name": "liquor-station",
            "product_id": 3518,
            "category": "liqueur",
            "image": "b_7018.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 29.99
        },
        {
            "brand": "Duo Penotti",
            "name": "Hazelnut Pasta",
            "store_type_name": "linas-italian-market",
            "product_id": 7231,
            "category": "condiments",
            "image": "jr_11731.jpeg",
            "packaging": "1",
            "volume": "750gm",
            "price": 9.99
        }
    ],
    "condiments": [
        {
            "brand": "Natur Puglia",
            "name": "Taralli with Pizza Flavour",
            "store_type_name": "linas-italian-market",
            "product_id": 6830,
            "category": "baked-goods",
            "image": "btc_11262.jpeg",
            "packaging": "1",
            "volume": "250gm",
            "price": 3.99
        },
        {
            "brand": "Safie's",
            "name": "Pickled Asparagus",
            "store_type_name": "linas-italian-market",
            "product_id": 6861,
            "category": "canned-and-jarred",
            "image": "jr_11447.jpeg",
            "packaging": "1",
            "volume": "750gm",
            "price": 15.99
        },
        {
            "brand": "ITALISSIMA",
            "name": "Sparkling Grapefruit Juice",
            "store_type_name": "linas-italian-market",
            "product_id": 7118,
            "category": "beverages",
            "image": "b_11618.jpeg",
            "packaging": "1",
            "volume": "1L",
            "price": 3.99
        },
        {
            "brand": "Knorr",
            "name": "Beef",
            "store_type_name": "linas-italian-market",
            "product_id": 6552,
            "category": "herbs-and-spices",
            "image": "cbe_11052.jpeg",
            "packaging": "6",
            "volume": "11gm",
            "price": 4.49
        },
        {
            "brand": "Blasted Church",
            "name": "Merlot",
            "store_type_name": "liquor-station",
            "product_id": 1021,
            "category": "wine",
            "image": "b_3021.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 37.99
        }
    ],
    "baked-goods": [
        {
            "brand": "Scotties",
            "name": "Napkins",
            "store_type_name": "liquor-station",
            "product_id": 6015,
            "category": "party-supply",
            "image": "p_10015.jpeg",
            "packaging": "210",
            "volume": "regular",
            "price": 2.49
        },
        {
            "brand": "Painted Turtle",
            "name": "Cabernet Sauvignon",
            "store_type_name": "liquor-station",
            "product_id": 1001,
            "category": "wine",
            "image": "b_3001.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 12.49
        },
        {
            "brand": "GIGI",
            "name": "Premium Sweet Antipasto",
            "store_type_name": "linas-italian-market",
            "product_id": 6855,
            "category": "canned-and-jarred",
            "image": "jr_11441.jpeg",
            "packaging": "1",
            "volume": "580ml",
            "price": 7.99
        },
        {
            "brand": "Forno Steno",
            "name": "Almond Biscuits",
            "store_type_name": "linas-italian-market",
            "product_id": 7310,
            "category": "confectionery",
            "image": "bg_11810.jpeg",
            "packaging": "1",
            "volume": "150gm",
            "price": 7.69
        },
        {
            "brand": "Cape Herb & Spice",
            "name": "Lemon Pepper",
            "store_type_name": "linas-italian-market",
            "product_id": 6622,
            "category": "herbs-and-spices",
            "image": "cntr_11121.jpeg",
            "packaging": "1",
            "volume": "210gm",
            "price": 15.99
        }
    ],
    "oil-and-vinegar": [
        {
            "brand": "Divella",
            "name": "Lasagne",
            "store_type_name": "linas-italian-market",
            "product_id": 7329,
            "category": "pasta-and-baking",
            "image": "bx_11829.jpeg",
            "packaging": "1",
            "volume": "500gm",
            "price": 3.99
        },
        {
            "brand": "Grand Marnier",
            "name": "Cordon Rouge",
            "store_type_name": "liquor-station",
            "product_id": 3515,
            "category": "liqueur",
            "image": "b_7015.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 46.99
        },
        {
            "brand": "Tylenol",
            "name": "Regular",
            "store_type_name": "snack-vendor",
            "product_id": 6501,
            "category": "everyday-needs",
            "image": "p_11001.jpeg",
            "packaging": "24ct",
            "volume": "325mg",
            "price": 4.99
        },
        {
            "brand": "Golosini",
            "name": "Grilled Artichokes in Oil",
            "store_type_name": "linas-italian-market",
            "product_id": 6913,
            "category": "canned-and-jarred",
            "image": "jr_11499.jpeg",
            "packaging": "1",
            "volume": "314ml",
            "price": 7.99
        },
        {
            "brand": "Xochitl",
            "name": "Sea Salt Chips",
            "store_type_name": "linas-italian-market",
            "product_id": 7084,
            "category": "snacks",
            "image": "btc_11584.jpeg",
            "packaging": "1",
            "volume": "340gm",
            "price": 7.99
        }
    ],
    "coffee-and-tea": [
        {
            "brand": "Balocco",
            "name": "Biscuits with Lemon Flavor",
            "store_type_name": "linas-italian-market",
            "product_id": 7305,
            "category": "confectionery",
            "image": "bg_11805.jpeg",
            "packaging": "1",
            "volume": "700gm",
            "price": 5.99
        },
        {
            "brand": "Milka",
            "name": "Cherry Cream",
            "store_type_name": "linas-italian-market",
            "product_id": 7364,
            "category": "confectionery",
            "image": "br_11864.jpeg",
            "packaging": "1",
            "volume": "100gm",
            "price": 3.99
        },
        {
            "brand": "Nutella",
            "name": "Chocolate Spread",
            "store_type_name": "linas-italian-market",
            "product_id": 7227,
            "category": "condiments",
            "image": "jr_11727.jpeg",
            "packaging": "1",
            "volume": "725gm",
            "price": 9.99
        },
        {
            "brand": "Kahlua",
            "name": "Coffee Liqueur",
            "store_type_name": "liquor-station",
            "product_id": 3511,
            "category": "liqueur",
            "image": "b_7011.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 30.99
        },
        {
            "brand": "Loacker",
            "name": "Lemon Quadratini",
            "store_type_name": "linas-italian-market",
            "product_id": 7307,
            "category": "confectionery",
            "image": "bg_11807.jpeg",
            "packaging": "1",
            "volume": "250gm",
            "price": 5.49
        }
    ],
    "confectionery": [
        {
            "brand": "Cartwright & Butler",
            "name": "English Breakfast",
            "store_type_name": "linas-italian-market",
            "product_id": 7216,
            "category": "coffee-and-tea",
            "image": "bx_11716.jpeg",
            "packaging": "1",
            "volume": "45gm",
            "price": 9.99
        },
        {
            "brand": "Good Drink",
            "name": "Mango Tea with Hibiscus and Vanilla",
            "store_type_name": "linas-italian-market",
            "product_id": 7155,
            "category": "beverages",
            "image": "b_11655.jpeg",
            "packaging": "1",
            "volume": "473ml",
            "price": 2.99
        },
        {
            "brand": "Lina's",
            "name": "Dark Roast Organic",
            "store_type_name": "linas-italian-market",
            "product_id": 7186,
            "category": "coffee-and-tea",
            "image": "bg_11686.jpeg",
            "packaging": "1",
            "volume": "454gm",
            "price": 16.99
        },
        {
            "brand": "Fluggi",
            "name": "Natural Mineral Water",
            "store_type_name": "linas-italian-market",
            "product_id": 7169,
            "category": "beverages",
            "image": "b_11669.jpeg",
            "packaging": "1",
            "volume": "1L",
            "price": 3.99
        },
        {
            "brand": "Browne",
            "name": "Corkscrew Wing Bottle Opener",
            "store_type_name": "liquor-station",
            "product_id": 6023,
            "category": "party-supply",
            "image": "o_10023.jpeg",
            "packaging": "1",
            "volume": "6in",
            "price": 3.99
        }
    ],
    "dwarf-stars": [
        {
            "brand": "Guinness",
            "name": "Draught",
            "store_type_name": "liquor-station",
            "product_id": 83,
            "category": "beer",
            "image": "c_1060.jpeg",
            "packaging": "4",
            "volume": "440ml",
            "price": 13.39
        },
        {
            "brand": "Anna's Country Kitchen",
            "name": "Fontina",
            "store_type_name": "linas-italian-market",
            "product_id": 7612,
            "category": "dairy",
            "image": "wrp_1314.jpeg",
            "packaging": "1",
            "volume": "227g",
            "price": 11.99
        },
        {
            "brand": "Peller Estates",
            "name": "Sauvignon Blanc",
            "store_type_name": "liquor-station",
            "product_id": 1017,
            "category": "wine",
            "image": "b_3017.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 12.69
        },
        {
            "brand": "Augusto Espresso",
            "name": "Organic Dark Roast Ground",
            "store_type_name": "linas-italian-market",
            "product_id": 7180,
            "category": "coffee-and-tea",
            "image": "cntr_11680.jpeg",
            "packaging": "1",
            "volume": "225g",
            "price": 15.99
        },
        {
            "brand": "Jackson-Triggs",
            "name": "Shiraz",
            "store_type_name": "liquor-station",
            "product_id": 1037,
            "category": "wine",
            "image": "b_3037.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 12.69
        }
    ],
    "borderland-food-co": [
        {
            "brand": "Beatrice",
            "name": "2% Skimmed (Lactose free)",
            "store_type_name": "linas-italian-market",
            "product_id": 7627,
            "category": "dairy",
            "image": "jg_1329.jpeg",
            "packaging": "1",
            "volume": "4L",
            "price": 6.99
        },
        {
            "brand": "Cupcake",
            "name": "Malbec",
            "store_type_name": "liquor-station",
            "product_id": 1071,
            "category": "wine",
            "image": "b_3071.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 15.99
        },
        {
            "brand": "Jack Link's",
            "name": "Pork",
            "store_type_name": "snack-vendor",
            "product_id": 4517,
            "category": "snacks",
            "image": "p_9017.jpeg",
            "packaging": "1",
            "volume": "80g",
            "price": 6.99
        },
        {
            "brand": "National",
            "name": "Free Run Eggs",
            "store_type_name": "linas-italian-market",
            "product_id": 7628,
            "category": "deli-and-meat",
            "image": "cs_1330.jpeg",
            "packaging": "1",
            "volume": "12ea",
            "price": 5.99
        },
        {
            "brand": "Disaronno",
            "name": "Originale Amaretto",
            "store_type_name": "liquor-station",
            "product_id": 7476,
            "category": "liqueur",
            "image": "b_1181.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 30.59
        }
    ],
    "pure-foods-fresh": [
        {
            "brand": "El Mercado",
            "name": "Addictive Homemade Style",
            "store_type_name": "linas-italian-market",
            "product_id": 7087,
            "category": "snacks",
            "image": "btc_11587.jpeg",
            "packaging": "1",
            "volume": "400g",
            "price": 6.49
        },
        {
            "brand": "Coors",
            "name": "Banquet",
            "store_type_name": "liquor-station",
            "product_id": 20,
            "category": "beer",
            "image": "c_1013.jpeg",
            "packaging": "6",
            "volume": "355ml",
            "price": 15.93
        },
        {
            "brand": "Tostitos",
            "name": "Round",
            "store_type_name": "snack-vendor",
            "product_id": 4531,
            "category": "snacks",
            "image": "p_9031.jpeg",
            "packaging": "1",
            "volume": "regular",
            "price": 4.49
        },
        {
            "brand": "Pringles",
            "name": "Original",
            "store_type_name": "snack-vendor",
            "product_id": 4500,
            "category": "snacks",
            "image": "p_9000.jpeg",
            "packaging": "1",
            "volume": "regular",
            "price": 3.69
        },
        {
            "brand": "Zdravo",
            "name": "100% Tomato",
            "store_type_name": "linas-italian-market",
            "product_id": 7106,
            "category": "beverages",
            "image": "b_11606.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 5.99
        }
    ],
    "honey-and-bloom": [
        {
            "brand": "Saltwest Naturas",
            "name": "Roasted Garlic & Onion Infused",
            "store_type_name": "linas-italian-market",
            "product_id": 6670,
            "category": "herbs-and-spices",
            "image": "cntr_11169.jpeg",
            "packaging": "1",
            "volume": "40g",
            "price": 5.99
        },
        {
            "brand": "American Vintage",
            "name": "Iced Tea Lemon",
            "store_type_name": "liquor-station",
            "product_id": 7414,
            "category": "cider-and-cooler",
            "image": "c_1120.jpeg",
            "packaging": "6",
            "volume": "355ml",
            "price": 15.09
        },
        {
            "brand": "Aurora",
            "name": "Pomegranate Juice",
            "store_type_name": "linas-italian-market",
            "product_id": 7133,
            "category": "beverages",
            "image": "b_11633.jpeg",
            "packaging": "1",
            "volume": "1L",
            "price": 7.99
        },
        {
            "brand": "Borderland Food",
            "name": "Free Range Chicken Smoothie Base Bone Broth",
            "store_type_name": "locally-made",
            "product_id": 7653,
            "category": "borderland-food-co",
            "image": "sup_1355.jpeg",
            "packaging": "1",
            "volume": "591ml",
            "price": 8.99
        },
        {
            "brand": "Pure Foods Fresh",
            "name": "Trumato Sauce",
            "store_type_name": "locally-made",
            "product_id": 7656,
            "category": "pure-foods-fresh",
            "image": "b_1358.jpeg",
            "packaging": "1",
            "volume": "354ml",
            "price": 9.99
        }
    ],
    "honey-and-bloom": [
        {
            "brand": "Allessia's",
            "name": "Breadsticks with Seasame Seeds",
            "store_type_name": "linas-italian-market",
            "product_id": 6816,
            "category": "baked-goods",
            "image": "bx_11248.jpeg",
            "packaging": "1",
            "volume": "100g",
            "price": 2.49
        },
        {
            "brand": "Good Drink",
            "name": "Green Tea with Lemon and Honey",
            "store_type_name": "linas-italian-market",
            "product_id": 7152,
            "category": "beverages",
            "image": "b_11652.jpeg",
            "packaging": "1",
            "volume": "473ml",
            "price": 2.99
        },
        {
            "brand": "Xochitl",
            "name": "Sea Salt Chips",
            "store_type_name": "linas-italian-market",
            "product_id": 7084,
            "category": "snacks",
            "image": "btc_11584.jpeg",
            "packaging": "1",
            "volume": "340g",
            "price": 0
        },
        {
            "brand": "Mission Hill Five Vineyards",
            "name": "Cabernet Merlot",
            "store_type_name": "liquor-station",
            "product_id": 1036,
            "category": "wine",
            "image": "b_3036.jpeg",
            "packaging": "1",
            "volume": "750ml",
            "price": 19.89
        },
        {
            "brand": "Dwarf Stars",
            "name": "Originals",
            "store_type_name": "locally-made",
            "product_id": 7647,
            "category": "dwarf-stars",
            "image": "sup_1349.jpeg",
            "packaging": "1",
            "volume": "11.99",
            "price": 11.99
        }
    ]
}

module.exports = router;