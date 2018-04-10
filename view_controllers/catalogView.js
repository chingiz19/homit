var router = require("express").Router();
var _ = require("lodash");

var homit_tags = {
    "d_ht_em": "</em>",
    "ht_em": "<em>",
    "d_ht_b": "</b>",
    "ht_b": "<b>",
    "d_ht_ul": "</ul>",
    "ht_ul": "<ul>",
    "d_ht_li": "</li>",
    "ht_li": "<li>"
}

const categories = {
    "liquor-station": ['beer', 'liqueur', 'spirit', 'wine'],
    "snack-vendor": ['beverages', 'everyday needs', 'party supply', 'snacks'],
    "linas-italian-store": ['baked goods', 'beverages', 'canned and jarred', 'condiments and sauces', 'dry packaged', 'grains and legumes', 'herbs and spices', 'oil and vinegar' , 'pasta and baking', 'snacks']
}

const api_categories = {
    "liquor-station": ['beer', 'liqueur', 'spirit', 'wine'],
    "snack-vendor": ['beverages', 'everyday-needs', 'party-supply', 'snacks'],
    "linas-italian-store": ['baked-goods', 'beverages', 'canned-and-jarred', 'condiments-and-sauces', 'dry-packaged', 'grains-and-legumes', 'herbs-and-spices', 'oil-and-vinegar' , 'pasta-and-baking', 'snacks']
}


var recommended_products = {
    "beer": [
        {
            "brand": "Munchies",
            "name": "Snack Mix Original",
            "image": "/resources/images/products/snacks/p_9011.jpeg",
            "url": "/catalog/product/munchies-snack-mix-original/ls/9011",
            "packaging": "1",
            "size": "family",
            "price": 3.99
        },
        {
            "brand": "Wonderful Pistachios",
            "name": "Sweet Chili",
            "image": "/resources/images/products/snacks/p_9032.jpeg",
            "url": "/catalog/product/wonderful-pistachios-sweet-chili/ls/9032",
            "packaging": "1",
            "size": "200mg",
            "price": 4.99
        },
        {
            "brand": "Jack Link's",
            "name": "Cholula",
            "image": "/resources/images/products/snacks/p_9016.jpeg",
            "url": "/catalog/product/jack-link's-cholula/ls/9016",
            "packaging": "1",
            "size": "80gm",
            "price": 6.99
        },
        {
            "brand": "Tostitos",
            "name": "Red Pepper Salsa",
            "image": "/resources/images/products/snacks/jr_9045.jpeg",
            "url": "/catalog/product/tostitos-red-pepper-salsa/ls/9045",
            "packaging": "1",
            "size": "425gm",
            "price": 4.59
        },
        {
            "brand": "Doritos",
            "name": "Cheese",
            "image": "/resources/images/products/snacks/p_9028.jpeg",
            "url": "/catalog/product/doritos-cheese/ls/9028",
            "packaging": "1",
            "size": "family",
            "price": 4.79
        },
    ],
    "wine": [
        {
            "brand": "Lindt",
            "name": "Chili Piment Rouge",
            "image": "/resources/images/products/snacks/br_9042.jpeg",
            "url": "/catalog/product/lindt-chili-piment-rouge/ls/9042",
            "packaging": "1",
            "size": "100gm",
            "price": 3.89
        },
        {
            "brand": "Browne",
            "name": "Corkscrew Wing Bottle Opener",
            "image": "/resources/images/products/party-supply/o_10023.jpeg",
            "url": "/catalog/product/browne-corkscrew-wing-bottle-opener/ls/10023",
            "packaging": "1",
            "size": "6in",
            "price": 3.99
        },
        {
            "brand": "Mozaik",
            "name": "Classic Wine Glass",
            "image": "/resources/images/products/party-supply/p_10013.jpeg",
            "url": "/catalog/product/mozaik-classic-wine-glass/ls/10013",
            "packaging": "4",
            "size": "15oz",
            "price": 9.49
        },
        {
            "brand": "Senssations",
            "name": "Salami Combo",
            "image": "/resources/images/products/snacks/p_9057.jpeg",
            "url": "/catalog/product/senssations-salami-combo/ls/9057",
            "packaging": "1",
            "size": "100mg",
            "price": 8.99
        },
        {
            "brand": "Babybel",
            "name": "Edam Cheese",
            "image": "/resources/images/products/snacks/p_9055.jpeg",
            "url": "/catalog/product/babybel-edam-cheese/ls/9055",
            "packaging": "1",
            "size": "120gm",
            "price": 6.89
        }
    ],
    "spirit": [
        {
            "brand": "Patron",
            "name": "Silver",
            "image": "/resources/images/products/spirit/b_5097.jpeg",
            "url": "/catalog/product/patron-silver/ls/5097",
            "packaging": "1",
            "size": "750ml",
            "price": 71.99
        },
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/arctic-glacier-ice/ls/9528",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Red Bull",
            "name": null,
            "image": "/resources/images/products/beverages/c_9526.jpeg",
            "url": "/catalog/product/red-bull/ls/9526",
            "packaging": "4",
            "size": "250",
            "price": 10.49
        },
        {
            "brand": "Mott's",
            "name": "Clamato The Original",
            "image": "/resources/images/products/beverages/b_9511.jpeg",
            "url": "/catalog/product/mott's-clamato-the-original/ls/9511",
            "packaging": "1",
            "size": "32oz",
            "price": 3.99
        },
        {
            "brand": "Coca-Cola",
            "name": null,
            "image": "/resources/images/products/beverages/b_9500.jpeg",
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
            "image": "/resources/images/products/snacks/br_9043.jpeg",
            "url": "/catalog/product/lindt-chili-piment-rouge/ls/9043",
            "packaging": "1",
            "size": "100gm",
            "price": 3.89
        },
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/arctic-glacier-ice/ls/9528",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Guinness",
            "name": "Draught",
            "image": "/resources/images/products/beer/c_1060.jpeg",
            "url": "/catalog/product/guinness-draught/ls/1060",
            "packaging": "4",
            "size": "440ml",
            "price": 14.99
        },
        {
            "brand": "Safeway",
            "name": "Fruit Tray",
            "image": "/resources/images/products/snacks/o_9059.jpeg",
            "url": "/catalog/product/safeway-fruit-tray/ls/9059",
            "packaging": "1",
            "size": "7in",
            "price": 13.49
        },
        {
            "brand": "Touch Bamboo",
            "name": "Paddle Skewer",
            "image": "/resources/images/products/party-supply/p_10014.jpeg",
            "url": "/catalog/product/touch-bamboo-paddle-skewer/ls/10014",
            "packaging": "50",
            "size": "60in",
            "price": 3.99
        },
    ],
    "beverages": [
        {
            "brand": "Twizzler",
            "name": "Strawberry",
            "image": "/resources/images/products/snacks/p_9037.jpeg",
            "url": "/catalog/product/twizzler-strawberry/ls/9037",
            "packaging": "1",
            "size": "227gm",
            "price": 2.99
        },
        {
            "brand": "Pringles",
            "name": "Sour Cream & Onion",
            "image": "/resources/images/products/snacks/p_9001.jpeg",
            "url": "/catalog/product/pringles-sour-cream-&-onion/ls/9001",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.69
        },
        {
            "brand": "Stella Artois",
            "name": null,
            "image": "/resources/images/products/beer/b_1039.jpeg",
            "url": "/catalog/product/stella-artois/ls/1039",
            "packaging": "6",
            "size": "330ml",
            "price": 18.49
        },
        {
            "brand": "Cocktail Shaker",
            "name": null,
            "image": "/resources/images/products/party-supply/o_10012.jpeg",
            "url": "/catalog/product/coctail-shaker/ls/10012",
            "packaging": "1",
            "size": "30oz",
            "price": 14.49
        },
        {
            "brand": "Hershey's",
            "name": "Cookies & Cream",
            "image": "/resources/images/products/snacks/br_9041.jpeg",
            "url": "/catalog/product/hershey's-cookies-&-cream/ls/9041",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        }
    ],
    "everyday needs": [
        {
            "brand": "Scotties",
            "name": "Napkins",
            "image": "/resources/images/products/party-supply/p_10015.jpeg",
            "url": "/catalog/product/scotties-napkins/ls/10015",
            "packaging": "210",
            "size": "regular",
            "price": 2.49
        },
        {
            "brand": "Bevara",
            "name": "Sealing Cleaps",
            "image": "/resources/images/products/party-supply/p_10022.jpeg",
            "url": "/catalog/product/bevara-sealing-cleaps/ls/10022",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.69
        },
        {
            "brand": "Shot Glass 35ml",
            "name": null,
            "image": "/resources/images/products/party-supply/p_10020.jpeg",
            "url": "/catalog/product/shot-glass-35ml/ls/10020",
            "packaging": "6",
            "size": "330ml",
            "price": 18.49
        },
        {
            "brand": "Mozaik",
            "name": "Cutlery Set",
            "image": "/resources/images/products/party-supply/p_10007.jpeg",
            "url": "/catalog/product/mozaik-cutlery-set/ls/10007",
            "packaging": "80",
            "size": "combo",
            "price": 10.99
        },
        {
            "brand": "Lindt",
            "name": "Hazelnut Chocolate",
            "image": "/resources/images/products/snacks/br_9039.jpeg",
            "url": "/catalog/product/lindt-hazelnut-chocolate/ls/9039",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        }
    ],
    "party supply": [
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/arctic-glacier-ice/ls/9528",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Absolut",
            "name": "Vodka",
            "image": "/resources/images/products/spirit/b_5000.jpeg",
            "url": "/catalog/product/absolut-vodka/ls/5000",
            "packaging": "1",
            "size": "750ml",
            "price": 28.99
        },
        {
            "brand": "Realemon",
            "name": "Lime juice",
            "image": "/resources/images/products/beverages/b_9513.jpeg",
            "url": "/catalog/product/realemon-lime-juice/ls/9513",
            "packaging": "1",
            "size": "100ml",
            "price": 1.29
        },
        {
            "brand": "Jagermeister",
            "name": null,
            "image": "/resources/images/products/liqueur/b_7000.jpeg",
            "url": "/catalog/product/jagermeister/ls/7000",
            "packaging": "1",
            "size": "750ml",
            "price": 31.99
        },
        {
            "brand": "OASIS",
            "name": "Exotic Mango",
            "image": "/resources/images/products/beverages/b_9524.jpeg",
            "url": "/catalog/product/oasis-exotic-mango/ls/9524",
            "packaging": "1",
            "size": "960ml",
            "price": 3.29
        }
    ],
    "snacks": [
        {
            "brand": "SunRype",
            "name": "Apple Lime",
            "image": "/resources/images/products/beverages/b_9522.jpeg",
            "url": "/catalog/product/sunrype-apple-lime/ls/9522",
            "packaging": "1",
            "size": "900ml",
            "price": 1.99
        },
        {
            "brand": "Bud Light",
            "name": null,
            "image": "/resources/images/products/beer/b_1052.jpeg",
            "url": "/catalog/product/bud-light/ls/1052",
            "packaging": "6",
            "size": "341ml",
            "price": 15.99
        },
        {
            "brand": "Purex",
            "name": "Bathroom Tissue Paper",
            "image": "/resources/images/products/everyday-needs/p_11000.jpeg",
            "url": "/catalog/product/purex-bathroom-tissue-paper/ls/11000",
            "packaging": "4",
            "size": "Double R.",
            "price": 5.29
        },
        {
            "brand": "Perrier",
            "name": "Sparkling Water",
            "image": "/resources/images/products/beverages/b_9529.jpeg",
            "url": "/catalog/product/perrier-sparkling-water/ls/9529",
            "packaging": "6",
            "size": "500ml",
            "price": 10.74
        },
        {
            "brand": "Simply",
            "name": "Lemonade Orange",
            "image": "/resources/images/products/beverages/b_9506.jpeg",
            "url": "/catalog/product/simply-lemonade-orange/ls/9506",
            "packaging": "1",
            "size": "1.75L",
            "price": 5.99
        }
    ],
    "canned-and-jarred": [
        {
            "brand": "SunRype",
            "name": "Apple Lime",
            "image": "/resources/images/products/beverages/b_9522.jpeg",
            "url": "/catalog/product/sunrype-apple-lime/ls/9522",
            "packaging": "1",
            "size": "900ml",
            "price": 1.99
        },
        {
            "brand": "Bud Light",
            "name": null,
            "image": "/resources/images/products/beer/b_1052.jpeg",
            "url": "/catalog/product/bud-light/ls/1052",
            "packaging": "6",
            "size": "341ml",
            "price": 15.99
        },
        {
            "brand": "Purex",
            "name": "Bathroom Tissue Paper",
            "image": "/resources/images/products/everyday-needs/p_11000.jpeg",
            "url": "/catalog/product/purex-bathroom-tissue-paper/ls/11000",
            "packaging": "4",
            "size": "Double R.",
            "price": 5.29
        },
        {
            "brand": "Perrier",
            "name": "Sparkling Water",
            "image": "/resources/images/products/beverages/b_9529.jpeg",
            "url": "/catalog/product/perrier-sparkling-water/ls/9529",
            "packaging": "6",
            "size": "500ml",
            "price": 10.74
        },
        {
            "brand": "Simply",
            "name": "Lemonade Orange",
            "image": "/resources/images/products/beverages/b_9506.jpeg",
            "url": "/catalog/product/simply-lemonade-orange/ls/9506",
            "packaging": "1",
            "size": "1.75L",
            "price": 5.99
        }
    ],
    "pasta-and-baking": [
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/arctic-glacier-ice/ls/9528",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Absolut",
            "name": "Vodka",
            "image": "/resources/images/products/spirit/b_5000.jpeg",
            "url": "/catalog/product/absolut-vodka/ls/5000",
            "packaging": "1",
            "size": "750ml",
            "price": 28.99
        },
        {
            "brand": "Realemon",
            "name": "Lime juice",
            "image": "/resources/images/products/beverages/b_9513.jpeg",
            "url": "/catalog/product/realemon-lime-juice/ls/9513",
            "packaging": "1",
            "size": "100ml",
            "price": 1.29
        },
        {
            "brand": "Jagermeister",
            "name": null,
            "image": "/resources/images/products/liqueur/b_7000.jpeg",
            "url": "/catalog/product/jagermeister/ls/7000",
            "packaging": "1",
            "size": "750ml",
            "price": 31.99
        },
        {
            "brand": "OASIS",
            "name": "Exotic Mango",
            "image": "/resources/images/products/beverages/b_9524.jpeg",
            "url": "/catalog/product/oasis-exotic-mango/ls/9524",
            "packaging": "1",
            "size": "960ml",
            "price": 3.29
        }
    ],
    "grains-and-legumes": [
        {
            "brand": "Munchies",
            "name": "Snack Mix Original",
            "image": "/resources/images/products/snacks/p_9011.jpeg",
            "url": "/catalog/product/munchies-snack-mix-original/ls/9011",
            "packaging": "1",
            "size": "family",
            "price": 3.99
        },
        {
            "brand": "Wonderful Pistachios",
            "name": "Sweet Chili",
            "image": "/resources/images/products/snacks/p_9032.jpeg",
            "url": "/catalog/product/wonderful-pistachios-sweet-chili/ls/9032",
            "packaging": "1",
            "size": "200mg",
            "price": 4.99
        },
        {
            "brand": "Jack Link's",
            "name": "Cholula",
            "image": "/resources/images/products/snacks/p_9016.jpeg",
            "url": "/catalog/product/jack-link's-cholula/ls/9016",
            "packaging": "1",
            "size": "80gm",
            "price": 6.99
        },
        {
            "brand": "Tostitos",
            "name": "Red Pepper Salsa",
            "image": "/resources/images/products/snacks/jr_9045.jpeg",
            "url": "/catalog/product/tostitos-red-pepper-salsa/ls/9045",
            "packaging": "1",
            "size": "425gm",
            "price": 4.59
        },
        {
            "brand": "Doritos",
            "name": "Cheese",
            "image": "/resources/images/products/snacks/p_9028.jpeg",
            "url": "/catalog/product/doritos-cheese/ls/9028",
            "packaging": "1",
            "size": "family",
            "price": 4.79
        },
    ],
    "herbs-and-spices": [
        {
            "brand": "Lindt",
            "name": "Chili Piment Rouge",
            "image": "/resources/images/products/snacks/br_9042.jpeg",
            "url": "/catalog/product/lindt-chili-piment-rouge/ls/9042",
            "packaging": "1",
            "size": "100gm",
            "price": 3.89
        },
        {
            "brand": "Browne",
            "name": "Corkscrew Wing Bottle Opener",
            "image": "/resources/images/products/party-supply/o_10023.jpeg",
            "url": "/catalog/product/browne-corkscrew-wing-bottle-opener/ls/10023",
            "packaging": "1",
            "size": "6in",
            "price": 3.99
        },
        {
            "brand": "Mozaik",
            "name": "Classic Wine Glass",
            "image": "/resources/images/products/party-supply/p_10013.jpeg",
            "url": "/catalog/product/mozaik-classic-wine-glass/ls/10013",
            "packaging": "4",
            "size": "15oz",
            "price": 9.49
        },
        {
            "brand": "Senssations",
            "name": "Salami Combo",
            "image": "/resources/images/products/snacks/p_9057.jpeg",
            "url": "/catalog/product/senssations-salami-combo/ls/9057",
            "packaging": "1",
            "size": "100mg",
            "price": 8.99
        },
        {
            "brand": "Babybel",
            "name": "Edam Cheese",
            "image": "/resources/images/products/snacks/p_9055.jpeg",
            "url": "/catalog/product/babybel-edam-cheese/ls/9055",
            "packaging": "1",
            "size": "120gm",
            "price": 6.89
        }
    ],
    "dry-packaged": [
        {
            "brand": "Patron",
            "name": "Silver",
            "image": "/resources/images/products/spirit/b_5097.jpeg",
            "url": "/catalog/product/patron-silver/ls/5097",
            "packaging": "1",
            "size": "750ml",
            "price": 71.99
        },
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/arctic-glacier-ice/ls/9528",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Red Bull",
            "name": null,
            "image": "/resources/images/products/beverages/c_9526.jpeg",
            "url": "/catalog/product/red-bull/ls/9526",
            "packaging": "4",
            "size": "250",
            "price": 10.49
        },
        {
            "brand": "Mott's",
            "name": "Clamato The Original",
            "image": "/resources/images/products/beverages/b_9511.jpeg",
            "url": "/catalog/product/mott's-clamato-the-original/ls/9511",
            "packaging": "1",
            "size": "32oz",
            "price": 3.99
        },
        {
            "brand": "Coca-Cola",
            "name": null,
            "image": "/resources/images/products/beverages/b_9500.jpeg",
            "url": "/catalog/product/coca-cola/ls/9500",
            "packaging": "1",
            "size": "1L",
            "price": 2.79
        },
    ],
    "condiments-and-sauces": [
        {
            "brand": "Lindt",
            "name": "Intense Orange",
            "image": "/resources/images/products/snacks/br_9043.jpeg",
            "url": "/catalog/product/lindt-chili-piment-rouge/ls/9043",
            "packaging": "1",
            "size": "100gm",
            "price": 3.89
        },
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/arctic-glacier-ice/ls/9528",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Guinness",
            "name": "Draught",
            "image": "/resources/images/products/beer/c_1060.jpeg",
            "url": "/catalog/product/guinness-draught/ls/1060",
            "packaging": "4",
            "size": "440ml",
            "price": 14.99
        },
        {
            "brand": "Safeway",
            "name": "Fruit Tray",
            "image": "/resources/images/products/snacks/o_9059.jpeg",
            "url": "/catalog/product/safeway-fruit-tray/ls/9059",
            "packaging": "1",
            "size": "7in",
            "price": 13.49
        },
        {
            "brand": "Touch Bamboo",
            "name": "Paddle Skewer",
            "image": "/resources/images/products/party-supply/p_10014.jpeg",
            "url": "/catalog/product/touch-bamboo-paddle-skewer/ls/10014",
            "packaging": "50",
            "size": "60in",
            "price": 3.99
        },
    ],
    "baked-goods": [
        {
            "brand": "Twizzler",
            "name": "Strawberry",
            "image": "/resources/images/products/snacks/p_9037.jpeg",
            "url": "/catalog/product/twizzler-strawberry/ls/9037",
            "packaging": "1",
            "size": "227gm",
            "price": 2.99
        },
        {
            "brand": "Pringles",
            "name": "Sour Cream & Onion",
            "image": "/resources/images/products/snacks/p_9001.jpeg",
            "url": "/catalog/product/pringles-sour-cream-&-onion/ls/9001",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.69
        },
        {
            "brand": "Stella Artois",
            "name": null,
            "image": "/resources/images/products/beer/b_1039.jpeg",
            "url": "/catalog/product/stella-artois/ls/1039",
            "packaging": "6",
            "size": "330ml",
            "price": 18.49
        },
        {
            "brand": "Cocktail Shaker",
            "name": null,
            "image": "/resources/images/products/party-supply/o_10012.jpeg",
            "url": "/catalog/product/coctail-shaker/ls/10012",
            "packaging": "1",
            "size": "30oz",
            "price": 14.49
        },
        {
            "brand": "Hershey's",
            "name": "Cookies & Cream",
            "image": "/resources/images/products/snacks/br_9041.jpeg",
            "url": "/catalog/product/hershey's-cookies-&-cream/ls/9041",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        }
    ],
    "oil-and-vinegar": [
        {
            "brand": "Scotties",
            "name": "Napkins",
            "image": "/resources/images/products/party-supply/p_10015.jpeg",
            "url": "/catalog/product/scotties-napkins/ls/10015",
            "packaging": "210",
            "size": "regular",
            "price": 2.49
        },
        {
            "brand": "Bevara",
            "name": "Sealing Cleaps",
            "image": "/resources/images/products/party-supply/p_10022.jpeg",
            "url": "/catalog/product/bevara-sealing-cleaps/ls/10022",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.69
        },
        {
            "brand": "Shot Glass 35ml",
            "name": null,
            "image": "/resources/images/products/party-supply/p_10020.jpeg",
            "url": "/catalog/product/shot-glass-35ml/ls/10020",
            "packaging": "6",
            "size": "330ml",
            "price": 18.49
        },
        {
            "brand": "Mozaik",
            "name": "Cutlery Set",
            "image": "/resources/images/products/party-supply/p_10007.jpeg",
            "url": "/catalog/product/mozaik-cutlery-set/ls/10007",
            "packaging": "80",
            "size": "combo",
            "price": 10.99
        },
        {
            "brand": "Lindt",
            "name": "Hazelnut Chocolate",
            "image": "/resources/images/products/snacks/br_9039.jpeg",
            "url": "/catalog/product/lindt-hazelnut-chocolate/ls/9039",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        }
    ],
}


router.get("/product/:productName/ls/:listingId", async function (req, res, next) {
    var product = await Catalog.getProductPageProductsByListingId(req.params.listingId);

    var validationUrl = "/product/" + _.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-") + "/ls/" + req.params.listingId;

    if (!product || validationUrl != req.url) {
        return res.redirect("/notfound");
    }

    // Assign variables
    req.options.ejs.product_brand = product.brand;
    req.options.ejs.product_name = product.name;
    req.options.ejs.product_details = product.details;
    req.options.ejs.default_container = Object.keys(product.products)[0];
    req.options.ejs.store_type_display_name = _.startCase(product.store_type_display_name, '-', ' ');
    req.options.ejs.store_type_api_name = product.store_type_api_name;
    req.options.ejs.product_type = product.type;
    req.options.ejs.recommended_products = JSON.stringify(recommended_products[product.category]);
    req.options.ejs.see_more_url = "https://homit.ca/catalog/" + product.store_type_api_name + "/" + product.category;

    
    if (Object.values(product.products).length > 0) {
        req.options.ejs.og_image = Object.values(product.products)[0].image;
    }

    req.options.ejs.title = _.trim(product.brand + _.trimEnd(" " + product.name) + " - Delivered to Your Doorstep | Homit");

    if(product.details.preview){
        req.options.ejs.meta_description = _.trim(product.brand + _.trimEnd(" " + product.name) + " - 45 minutes delivery in Calgary. " + clearHomitTags(product.details.preview).split(".")[0]);
    }else{
        req.options.ejs.meta_description = _.trim(product.brand + _.trimEnd(" " + product.name) + " - 45 minutes delivery in Calgary. Let us Home It and liberate your precious time.");
    }

    for(detail in req.options.ejs.product_details){
        req.options.ejs.product_details[detail] = convertHomitTags(req.options.ejs.product_details[detail]);
    }

    if(product.store_type_api_name == "linas-italian-store"){
        req.options.ejs.store_web = "https://linasmarket.com/";
    } else{
        req.options.ejs.store_web = undefined;
    }

    for (key in product.products) {
        product.products[key].selectedVolume = 0;
        product.products[key].selectedPack = 0;
    }

    req.options.ejs.product = JSON.stringify(product);


    res.render("product.ejs", req.options.ejs);
});

router.get('/:parent/', function (req, res, next) {
    try {
        res.redirect("/catalog/" + req.params.parent + "/" + api_categories[req.params.parent][0]);
    } catch (e) {
        next()
    }
});

router.get('/:parent/:category', function (req, res, next) {
    if (!_.includes(api_categories[req.params.parent], req.params.category)) {
        return res.redirect("/notfound");
    }

    try {
        req.options.ejs.title = _.startCase(req.params.category) + " Catalog | Homit";
        req.options.ejs.categories = convertArrayToString(categories[req.params.parent]);
        req.options.ejs.loadedStore = _.startCase(req.params.parent);
        req.options.ejs.selectedCategory = req.params.category.replace(/-/g , " ");
        res.render("catalog.ejs", req.options.ejs);
    } catch (e) {
        next()
    }
});

function convertArrayToString(array) {
    return "[\"" + array.join("\",\"") + "\"]";
}

function convertHomitTags(string){
    var tmpString = string;
    for (tag in homit_tags){
        tmpString = tmpString.replace(new RegExp(tag, 'g'), homit_tags[tag]);
    }
    return tmpString;
}

function clearHomitTags(string){
    var tmpString = string;
    for (tag in homit_tags){
        tmpString = tmpString.replace(new RegExp(tag, 'g'),"");
    }
    return tmpString;
}

module.exports = router;