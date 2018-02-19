var router = require("express").Router();
var _ = require("lodash");

const categories = {
    "liquor-station": ['beer', 'liqueur', 'spirit', 'wine'],
    "snack-vendor": ['beverage', 'everyday-needs', 'party-supply', 'snack']
}


var recommended_products = {
    "beer": [
        {
            "brand": "Munchies",
            "name": "Snack Mix Original",
            "depot_id": 4518,
            "image": "/resources/images/products/snack-vendor/snack/p_9018.jpeg",
            "url": "/catalog/product/munchies-snack-mix-original/ls/9018",
            "packaging": "1",
            "size": "family",
            "price": 3.99
        },
        {
            "brand": "Wonderful Pistachios",
            "name": "Sweet Chili",
            "depot_id": 4555,
            "image": "/resources/images/products/snack-vendor/snack/p_9055.jpeg",
            "url": "/catalog/product/wonderful-pistachios-sweet-chili/ls/9055",
            "packaging": "1",
            "size": "200mg",
            "price": 4.99
        },
        {
            "brand": "Jack Link's",
            "name": "Cholula",
            "depot_id": 4525,
            "image": "/resources/images/products/snack-vendor/snack/p_9025.jpeg",
            "url": "/catalog/product/jack-link's-cholula/ls/9025",
            "packaging": "1",
            "size": "80gm",
            "price": 6.99
        },
        {
            "brand": "Tostitos",
            "name": "Red Pepper Salsa",
            "depot_id": 4574,
            "image": "/resources/images/products/snack-vendor/snack/jr_9074.jpeg",
            "url": "/catalog/product/tostitos-red-pepper-salsa/ls/9074",
            "packaging": "1",
            "size": "425gm",
            "price": 4.59
        },
        {
            "brand": "Doritos",
            "name": "Cheese",
            "depot_id": 4547,
            "image": "/resources/images/products/snack-vendor/snack/p_9047.jpeg",
            "url": "/catalog/product/doritos-cheese/ls/9047",
            "packaging": "1",
            "size": "family",
            "price": 4.79
        },
    ],
    "wine": [
        {
            "brand": "Lindt",
            "name": "Chili Piment Rouge",
            "depot_id": 4570,
            "image": "/resources/images/products/snack-vendor/snack/br_9070.jpeg",
            "url": "/catalog/product/lindt-chili-piment-rouge/ls/9070",
            "packaging": "1",
            "size": "100gm",
            "price": 3.89
        },
        {
            "brand": "Browne",
            "name": "Corkscrew Wing Bottle Opener",
            "depot_id": 6023,
            "image": "/resources/images/products/snack-vendor/party-supply/o_10023.jpeg",
            "url": "/catalog/product/browne-corkscrew-wing-bottle-opener/ls/10023",
            "packaging": "1",
            "size": "6in",
            "price": 3.99
        },
        {
            "brand": "Mozaik",
            "name": "Classic Wine Glass",
            "depot_id": 6013,
            "image": "/resources/images/products/snack-vendor/party-supply/p_10013.jpeg",
            "url": "/catalog/product/mozaik-classic-wine-glass/ls/10013",
            "packaging": "4",
            "size": "15oz",
            "price": 9.49
        },
        {
            "brand": "Senssations",
            "name": "Salami Combo",
            "depot_id": 4592,
            "image": "/resources/images/products/snack-vendor/snack/p_9092.jpeg",
            "url": "/catalog/product/senssations-salami-combo/ls/9092",
            "packaging": "1",
            "size": "100mg",
            "price": 8.99
        },
        {
            "brand": "Babybel",
            "name": "Edam Cheese",
            "depot_id": 4590,
            "image": "/resources/images/products/snack-vendor/snack/p_9090.jpeg",
            "url": "/catalog/product/babybel-edam-cheese/ls/9090",
            "packaging": "1",
            "size": "120gm",
            "price": 6.89
        }
    ],
    "spirit": [
        {
            "brand": "Patron",
            "name": "Silver",
            "depot_id": 2597,
            "image": "/resources/images/products/liquor-station/spirit/b_5097.jpeg",
            "url": "/catalog/product/patron-silver/ls/5097",
            "packaging": "1",
            "size": "750ml",
            "price": 71.99
        },
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "depot_id": 5547,
            "image": "/resources/images/products/snack-vendor/beverage/p_9542.jpeg",
            "url": "/catalog/product/arctic-glacier-ice/ls/9542",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Red Bull",
            "name": null,
            "depot_id": 5544,
            "image": "/resources/images/products/snack-vendor/beverage/c_9538.jpeg",
            "url": "/catalog/product/red-bull/ls/9538",
            "packaging": "4",
            "size": "250",
            "price": 10.49
        },
        {
            "brand": "Mott's",
            "name": "Clamato The Original",
            "depot_id": 5525,
            "image": "/resources/images/products/snack-vendor/beverage/b_9520.jpeg",
            "url": "/catalog/product/mott's-clamato-the-original/ls/9520",
            "packaging": "1",
            "size": "32oz",
            "price": 3.99
        },
        {
            "brand": "Coca-Cola",
            "name": null,
            "depot_id": 5500,
            "image": "/resources/images/products/snack-vendor/beverage/b_9500.jpeg",
            "url": "/catalog/product/coca-cola/ls/9500",
            "packaging": "1",
            "size": "1L",
            "price": 2.79
        },
    ],
    "liqueur": [
        {
            "brand": "Lindt",
            "name": "Intense Orange",
            "depot_id": 4571,
            "image": "/resources/images/products/snack-vendor/snack/br_9071.jpeg",
            "url": "/catalog/product/lindt-chili-piment-rouge/ls/9070",
            "packaging": "1",
            "size": "100gm",
            "price": 3.89
        },
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "depot_id": 5547,
            "image": "/resources/images/products/snack-vendor/beverage/p_9542.jpeg",
            "url": "/catalog/product/arctic-glacier-ice/ls/9542",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Guinness",
            "name": "Draught",
            "depot_id": 83,
            "image": "/resources/images/products/liquor-station/beer/c_1060.jpeg",
            "url": "/catalog/product/guinness-draught/ls/1060",
            "packaging": "4",
            "size": "440ml",
            "price": 14.99
        },
        {
            "brand": "Safeway",
            "name": "Fruit Tray",
            "depot_id": 4594,
            "image": "/resources/images/products/snack-vendor/snack/o_9094.jpeg",
            "url": "/catalog/product/safeway-fruit-tray/ls/9094",
            "packaging": "1",
            "size": "7in",
            "price": 13.49
        },
        {
            "brand": "Touch Bamboo",
            "name": "Paddle Skewer",
            "depot_id": 6014,
            "image": "/resources/images/products/snack-vendor/party-supply/p_10014.jpeg",
            "url": "/catalog/product/touch-bamboo-paddle-skewer/ls/10014",
            "packaging": "50",
            "size": "60in",
            "price": 3.99
        },
    ],
    "beverage": [
        {
            "brand": "Twizzler",
            "name": "Strawberry",
            "depot_id": 4560,
            "image": "/resources/images/products/snack-vendor/snack/p_9060.jpeg",
            "url": "/catalog/product/twizzler-strawberry/ls/9060",
            "packaging": "1",
            "size": "227gm",
            "price": 2.99
        },
        {
            "brand": "Pringles",
            "name": "Sour Cream & Onion",
            "depot_id": 4502,
            "image": "/resources/images/products/snack-vendor/snack/p_9002.jpeg",
            "url": "/catalog/product/pringles-sour-cream-&-onion/ls/9002",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.69
        },
        {
            "brand": "Stella Artois",
            "name": null,
            "depot_id": 54,
            "image": "/resources/images/products/liquor-station/beer/b_1039.jpeg",
            "url": "/catalog/product/stella-artois/ls/1039",
            "packaging": "6",
            "size": "330ml",
            "price": 18.49
        },
        {
            "brand": "Cocktail Shaker",
            "name": null,
            "depot_id": 6012,
            "image": "/resources/images/products/snack-vendor/party-supply/o_10012.jpeg",
            "url": "/catalog/product/coctail-shaker/ls/10012",
            "packaging": "1",
            "size": "30oz",
            "price": 14.49
        },
        {
            "brand": "Hershey's",
            "name": "Cookies & Cream",
            "depot_id": 4568,
            "image": "/resources/images/products/snack-vendor/snack/br_9068.jpeg",
            "url": "/catalog/product/hershey's-cookies-&-cream/ls/9068",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        }
    ],
    "everyday needs": [
        {
            "brand": "Scotties",
            "name": "Napkins",
            "depot_id": 6015,
            "image": "/resources/images/products/snack-vendor/party-supply/p_10015.jpeg",
            "url": "/catalog/product/scotties-napkins/ls/10015",
            "packaging": "210",
            "size": "regular",
            "price": 2.49
        },
        {
            "brand": "Bevara",
            "name": "Sealing Cleaps",
            "depot_id": 6022,
            "image": "/resources/images/products/snack-vendor/party-supply/p_10022.jpeg",
            "url": "/catalog/product/bevara-sealing-cleaps/ls/10022",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.69
        },
        {
            "brand": "Shot Glass 35ml",
            "name": null,
            "depot_id": 6020,
            "image": "/resources/images/products/snack-vendor/party-supply/p_10020.jpeg",
            "url": "/catalog/product/shot-glass-35ml/ls/10020",
            "packaging": "6",
            "size": "330ml",
            "price": 18.49
        },
        {
            "brand": "Mazaik",
            "name": "Cutlery Set",
            "depot_id": 6007,
            "image": "/resources/images/products/snack-vendor/party-supply/p_10007.jpeg",
            "url": "/catalog/product/mazaik-cutlery-set/ls/10007",
            "packaging": "80",
            "size": "combo",
            "price": 10.99
        },
        {
            "brand": "Lindt",
            "name": "Hazelnut Chocolate",
            "depot_id": 4564,
            "image": "/resources/images/products/snack-vendor/snack/br_9064.jpeg",
            "url": "/catalog/product/lindt-hazelnut-chocolate/ls/9064",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        }
    ],
    "party supply": [
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "depot_id": 5547,
            "image": "/resources/images/products/snack-vendor/beverage/p_9542.jpeg",
            "url": "/catalog/product/arctic-glacier-ice/ls/9542",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Absolut",
            "name": "Vodka",
            "depot_id": 2500,
            "image": "/resources/images/products/liquor-station/spirit/b_5000.jpeg",
            "url": "/catalog/product/absolut-vodka/ls/5000",
            "packaging": "1",
            "size": "750ml",
            "price": 28.99
        },
        {
            "brand": "Realemon",
            "name": "Lime juice",
            "depot_id": 5529,
            "image": "/resources/images/products/snack-vendor/beverage/b_9524.jpeg",
            "url": "/catalog/product/realemon-lime-juice/ls/9524",
            "packaging": "1",
            "size": "100ml",
            "price": 1.29
        },
        {
            "brand": "Jagermeister",
            "name": null,
            "depot_id": 3500,
            "image": "/resources/images/products/liquor-station/liqueur/b_7000.jpeg",
            "url": "/catalog/product/jagermeister/ls/7000",
            "packaging": "1",
            "size": "750ml",
            "price": 31.99
        },
        {
            "brand": "OASIS",
            "name": "Exotic Mango",
            "depot_id": 5540,
            "image": "/resources/images/products/snack-vendor/beverage/b_9535.jpeg",
            "url": "/catalog/product/oasis-exotic-mango/ls/9535",
            "packaging": "1",
            "size": "960ml",
            "price": 3.29
        }
    ],
    "snack": [
        {
            "brand": "SunRype",
            "name": "Apple Lime",
            "depot_id": 5538,
            "image": "/resources/images/products/snack-vendor/beverage/b_9533.jpeg",
            "url": "/catalog/product/sunrype-apple-lime/ls/9533",
            "packaging": "1",
            "size": "900ml",
            "price": 1.99
        },
        {
            "brand": "Bud Light",
            "name": null,
            "depot_id": 71,
            "image": "/resources/images/products/liquor-station/beer/b_1052.jpeg",
            "url": "/catalog/product/bud-light/ls/1052",
            "packaging": "6",
            "size": "341ml",
            "price": 15.99
        },
        {
            "brand": "Purex",
            "name": "Bathroom Tissue Paper",
            "depot_id": 6500,
            "image": "/resources/images/products/snack-vendor/everyday-needs/p_11000.jpeg",
            "url": "/catalog/product/purex-bathroom-tissue-paper/ls/11000",
            "packaging": "4",
            "size": "Double R.",
            "price": 5.29
        },
        {
            "brand": "Perrier",
            "name": "Sparkling Water",
            "depot_id": 5549,
            "image": "/resources/images/products/snack-vendor/beverage/b_9544.jpeg",
            "url": "/catalog/product/perrier-sparkling-water/ls/9544",
            "packaging": "6",
            "size": "500ml",
            "price": 10.74
        },
        {
            "brand": "Simply",
            "name": "Lemonade Orange",
            "depot_id": 5515,
            "image": "/resources/images/products/snack-vendor/beverage/b_9512.jpeg",
            "url": "/catalog/product/simply-lemonade-orange/ls/9512",
            "packaging": "1",
            "size": "1.75L",
            "price": 5.99
        }
    ],
}


router.get("/product/:productName/ls/:listingId", async function (req, res, next) {
    var product = await Catalog.getProductPageProductsByListingId(req.params.listingId);

    var validationUrl = "/product/" + _.trim(_.toLower(product.brand + " " + product.name)).replace(/ /g, "-") + "/ls/" + req.params.listingId;

    if (!product || validationUrl != req.url) {
        return res.redirect("/notfound");
    }

    req.options.ejs.title = _.trim(product.name + _.trimEnd(" " + product.brand) + " - One Click Away | Homit");

    // Assign variables
    req.options.ejs.product_name = product.name;
    req.options.ejs.product_brand = product.brand;
    req.options.ejs.product_description = product.description;
    req.options.ejs.default_container = Object.keys(product.products)[0];
    req.options.ejs.product_super_category = _.startCase(product.super_category);
    req.options.ejs.product_origin_country = product.origin_country;
    req.options.ejs.product_made_by = product.made_by;
    req.options.ejs.product_alcohol_volume = product.alcohol_volume;
    req.options.ejs.showAlcoholVolume = true;
    req.options.ejs.recommended_products = JSON.stringify(recommended_products[_.lowerCase(product.category)]);
    req.options.ejs.see_more_url = "https://homit.ca/catalog/" + product.super_category + "/" + product.category;

    if (Object.values(product.products).length > 0){
        req.options.ejs.og_image = Object.values(product.products)[0].image;
    }

    for (key in product.products) {
        product.products[key].selectedVolume = 0;
        product.products[key].selectedPack = 0;
    }

    req.options.ejs.product = JSON.stringify(product);


    if (product.super_category != 'liquor-station') {
        req.options.ejs.showAlcoholVolume = false;
    }


    res.render("product.ejs", req.options.ejs);
});

router.get('/:parent/', function (req, res, next) {
    try {
        res.redirect("/catalog/" + req.params.parent + "/" + categories[req.params.parent][0]);
    } catch (e) {
        next()
    }
});

router.get('/:parent/:category', function (req, res, next) {
    if (!_.includes(categories[req.params.parent], req.params.category)) {
        return res.redirect("/notfound");
    }

    try {
        req.options.ejs.categories = convertArrayToString(categories[req.params.parent]);
        req.options.ejs.loadedStore = _.startCase(req.params.parent);
        req.options.ejs.selectedCategory = req.params.category;
        res.render("catalog.ejs", req.options.ejs);
    } catch (e) {
        next()
    }
});

function convertArrayToString(array) {
    return "[\"" + array.join("\",\"") + "\"]";
}

module.exports = router;