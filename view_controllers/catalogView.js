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
    "liquor-station": ['beer', 'liqueur', 'spirit', 'wine', 'party supply'],
    "snack-vendor": ['beverages', 'everyday needs', 'snacks'],
    "linas-italian-market": ['baked goods', 'beverages', 'canned and jarred', 'coffee and tea', 'condiments', 'confectionery', 'dry packaged', 'grains and legumes', 'herbs and spices', 'oil and vinegar', 'pasta and baking', 'snacks']
}

const api_categories = {
    "liquor-station": ['beer', 'liqueur', 'spirit', 'wine', 'party-supply'],
    "snack-vendor": ['beverages', 'everyday-needs', 'snacks'],
    "linas-italian-market": ['baked-goods', 'beverages', 'canned-and-jarred', 'coffee-and-tea', 'condiments', 'confectionery', 'dry-packaged', 'grains-and-legumes', 'herbs-and-spices', 'oil-and-vinegar', 'pasta-and-baking', 'snacks']
}


var recommended_products = {
    "beer": [
        {
            "brand": "Doritos",
            "name": "Cheese",
            "image": "/resources/images/products/snacks/p_9028.jpeg",
            "url": "/catalog/product/snack-vendor/doritos-cheese/4528",
            "packaging": "1",
            "size": "family",
            "price": 4.79
        },
        {
            "brand": "Tostitos",
            "name": "Round",
            "image": "/resources/images/products/snacks/p_9031.jpeg",
            "url": "/catalog/product/snack-vendor/tostitos-round/4531",
            "packaging": "1",
            "size": "regular",
            "price": 4.49
        },
        {
            "brand": "Jack Link's",
            "name": "Cholula",
            "image": "/resources/images/products/snacks/p_9016.jpeg",
            "url": "/catalog/product/snack-vendor/jack-links-cholula/4516",
            "packaging": "1",
            "size": "80gm",
            "price": 6.99
        },
        {
            "brand": "Tostitos",
            "name": "Red Pepper Salsa",
            "image": "/resources/images/products/snacks/jr_9045.jpeg",
            "url": "/catalog/product/snack-vendor/tostitos-red-pepper-salsa/4545",
            "packaging": "1",
            "size": "425gm",
            "price": 4.59
        },
        {
            "brand": "Browne",
            "name": "Corkscrew Bottle Opener",
            "image": "/resources/images/products/party-supply/o_10003.jpeg",
            "url": "/product/liquor-station/browne-corkscrew-bottle-opener/6003",
            "packaging": "1",
            "size": "4.5in",
            "price": 3.99
        },
    ],
    "wine": [
        {
            "brand": "Lindt",
            "name": "Chili Piment Rouge",
            "image": "/resources/images/products/snacks/br_9042.jpeg",
            "url": "/catalog/product/snack-vendor/lindt-chili-piment-rouge/4542",
            "packaging": "1",
            "size": "100gm",
            "price": 3.89
        },
        {
            "brand": "Browne",
            "name": "Corkscrew Wing Bottle Opener",
            "image": "/resources/images/products/party-supply/o_10023.jpeg",
            "url": "/catalog/product/liquor-station/browne-corkscrew-wing-bottle-opener/6023",
            "packaging": "1",
            "size": "6in",
            "price": 3.99
        },
        {
            "brand": "Mozaik",
            "name": "Classic Wine Glass",
            "image": "/resources/images/products/party-supply/p_10013.jpeg",
            "url": "/catalog/product/liquor-station/mozaik-classic-wine-glass/6013",
            "packaging": "4",
            "size": "15oz",
            "price": 9.49
        },
        {
            "brand": "Sea Change Seafoods",
            "name": "Candied Wild Smoked Salmon",
            "image": "/resources/images/products/dry-packaged/cntr_11112.jpeg",
            "url": "/catalog/product/linas-italian-market/sea-change-seafoods-candied-wild-smoked-salmon/6613",
            "packaging": "1",
            "size": "70mg",
            "price": 14.99
        },
        {
            "brand": "Rummo",
            "name": "Fusilli #48",
            "image": "/resources/images/products/pasta-and-baking/bx_11006.jpeg",
            "url": "/catalog/product/linas-italian-market/rummo-fusilli-48/6506",
            "packaging": "1",
            "size": "500gm",
            "price": 2.69
        }
    ],
    "spirit": [
        {
            "brand": "Patron",
            "name": "Silver",
            "image": "/resources/images/products/spirit/b_5097.jpeg",
            "url": "/catalog/product/liquor-station/patron-silver/2596",
            "packaging": "1",
            "size": "750ml",
            "price": 71.99
        },
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/snack-vendor/arctic-glacier-ice/5533",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Red Bull",
            "name": "Classic",
            "image": "/resources/images/products/beverages/c_9526.jpeg",
            "url": "/catalog/product/snack-vendor/red-bull-classic/5531",
            "packaging": "4",
            "size": "250",
            "price": 10.49
        },
        {
            "brand": "Mott's",
            "name": "Clamato The Original",
            "image": "/resources/images/products/beverages/b_9511.jpeg",
            "url": "/catalog/product/snack-vendor/motts-clamato-the-original/5516",
            "packaging": "1",
            "size": "32oz",
            "price": 3.99
        },
        {
            "brand": "Coca-Cola",
            "name": "Classic",
            "image": "/resources/images/products/beverages/b_9500.jpeg",
            "url": "/catalog/product/snack-vendor/coca-cola-classic/5500",
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
            "url": "/catalog/product/snack-vendor/lindt-intense-orange/4543",
            "packaging": "1",
            "size": "100gm",
            "price": 3.89
        },
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/snack-vendor/arctic-glacier-ice/5533",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Guinness",
            "name": "Draught",
            "image": "/resources/images/products/beer/c_1060.jpeg",
            "url": "/catalog/product/liquor-station/guinness-draught/83",
            "packaging": "4",
            "size": "440ml",
            "price": 14.99
        },
        {
            "brand": "Natur Puglia",
            "name": "Taralli with Pizza Flavour",
            "image": "/resources/images/products/baked-goods/btc_11262.jpeg",
            "url": "/catalog/product/linas-italian-market/natur-puglia-taralli-with-pizza-flavour/6830",
            "packaging": "1",
            "size": "250gm",
            "price": 3.99
        },
        {
            "brand": "Touch Bamboo",
            "name": "Paddle Skewer",
            "image": "/resources/images/products/party-supply/p_10014.jpeg",
            "url": "/catalog/product/liquor-station/touch-bamboo-paddle-skewer/6014",
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
            "url": "/catalog/product/snack-vendor/twizzler-strawberry/4537",
            "packaging": "1",
            "size": "227gm",
            "price": 2.99
        },
        {
            "brand": "Pringles",
            "name": "Sour Cream & Onion",
            "image": "/resources/images/products/snacks/p_9001.jpeg",
            "url": "/catalog/product/snack-vendor/pringles-sour-cream-onion/4501",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.69
        },
        {
            "brand": "Stella Artois",
            "name": "Pale Lager",
            "image": "/resources/images/products/beer/b_1039.jpeg",
            "url": "/catalog/product/liquor-station/stella-artois-pale-lager/54",
            "packaging": "6",
            "size": "330ml",
            "price": 18.49
        },
        {
            "brand": "Cocktail Shaker",
            "name": "30oz",
            "image": "/resources/images/products/party-supply/o_10012.jpeg",
            "url": "/catalog/product/liquor-station/cocktail-shaker-30oz/6012",
            "packaging": "1",
            "size": "30oz",
            "price": 14.49
        },
        {
            "brand": "Hershey's",
            "name": "Cookies & Cream",
            "image": "/resources/images/products/snacks/br_9041.jpeg",
            "url": "/catalog/product/snack-vendor/hersheys-cookies-cream/4541",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        }
    ],
    "everyday-needs": [
        {
            "brand": "Scotties",
            "name": "Napkins",
            "image": "/resources/images/products/party-supply/p_10015.jpeg",
            "url": "/catalog/product/liquor-station/scotties-napkins/6015",
            "packaging": "210",
            "size": "regular",
            "price": 2.49
        },
        {
            "brand": "Bevara",
            "name": "Sealing Cleaps",
            "image": "/resources/images/products/party-supply/p_10022.jpeg",
            "url": "/catalog/product/liquor-station/bevara-sealing-cleaps/6022",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.69
        },
        {
            "brand": "Shot Glass",
            "name": "35ml",
            "image": "/resources/images/products/party-supply/p_10020.jpeg",
            "url": "/catalog/product/liquor-station/shot-glass-35ml/6020",
            "packaging": "6",
            "size": "330ml",
            "price": 18.49
        },
        {
            "brand": "Mozaik",
            "name": "Cutlery Set",
            "image": "/resources/images/products/party-supply/p_10007.jpeg",
            "url": "/catalog/product/liquor-station/mazaik-cutlery-set/6007",
            "packaging": "80",
            "size": "combo",
            "price": 10.99
        },
        {
            "brand": "Lindt",
            "name": "Hazelnut Chocolate",
            "image": "/resources/images/products/snacks/br_9039.jpeg",
            "url": "/catalog/product/snack-vendor/lindt-hazelnut-chocolate/4539",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        }
    ],
    "party-supply": [
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/snack-vendor/arctic-glacier-ice/5533",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Absolut",
            "name": "Vodka",
            "image": "/resources/images/products/spirit/b_5000.jpeg",
            "url": "/catalog/product/liquor-station/absolut-vodka/2500",
            "packaging": "1",
            "size": "750ml",
            "price": 28.99
        },
        {
            "brand": "Lindt",
            "name": "Hazelnut Chocolate",
            "image": "/resources/images/products/snacks/br_9039.jpeg",
            "url": "/catalog/product/snack-vendor/lindt-hazelnut-chocolate/4539",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        },
        {
            "brand": "Jagermeister",
            "name": "Herbal Liqueur",
            "image": "/resources/images/products/liqueur/b_7000.jpeg",
            "url": "/catalog/product/liquor-station/jagermeister-herbal-liqueur/3500",
            "packaging": "1",
            "size": "750ml",
            "price": 31.99
        },
        {
            "brand": "San Pellegrino",
            "name": "Sparkling Blood Orange",
            "image": "/resources/images/products/beverages/b_11610.jpeg",
            "url": "/catalog/product/linas-italian-market/san-pellegrino-sparkling-blood-orange/7110",
            "packaging": "1",
            "size": "330ml",
            "price": 1.69
        }
    ],
    "snacks": [
        {
            "brand": "Preservation",
            "name": "Bloody Mary mix",
            "image": "/resources/images/products/beverages/b_11607.jpeg",
            "url": "/catalog/product/linas-italian-market/preservation-bloody-mary-mix/7107",
            "packaging": "1",
            "size": "946ml",
            "price": 11.99
        },
        {
            "brand": "Bud Light",
            "name": "Lager",
            "image": "/resources/images/products/beer/b_1052.jpeg",
            "url": "/catalog/product/liquor-station/bud-light-lager/71",
            "packaging": "6",
            "size": "341ml",
            "price": 15.99
        },
        {
            "brand": "Purex",
            "name": "Bathroom Tissue Paper",
            "image": "/resources/images/products/everyday-needs/p_11000.jpeg",
            "url": "/catalog/product/snack-vendor/purex-bathroom-tissue-paper/6500",
            "packaging": "4",
            "size": "Double R.",
            "price": 5.29
        },
        {
            "brand": "Perrier",
            "name": "Sparkling Water",
            "image": "/resources/images/products/beverages/b_9529.jpeg",
            "url": "/catalog/product/snack-vendor/perrier-lemon-orange/5535",
            "packaging": "6",
            "size": "500ml",
            "price": 10.74
        },
        {
            "brand": "Simply",
            "name": "Lemonade Orange",
            "image": "/resources/images/products/beverages/b_9506.jpeg",
            "url": "/catalog/product/snack-vendor/simply-lemonade-orange/5509",
            "packaging": "1",
            "size": "1.75L",
            "price": 5.99
        }
    ],
    "canned-and-jarred": [
        {
            "brand": "Preservation",
            "name": "Bloody Mary mix",
            "image": "/resources/images/products/beverages/b_11607.jpeg",
            "url": "/catalog/product/linas-italian-market/preservation-bloody-mary-mix/7107",
            "packaging": "1",
            "size": "946ml",
            "price": 11.99
        },
        {
            "brand": "Bud Light",
            "name": "Lager",
            "image": "/resources/images/products/beer/b_1052.jpeg",
            "url": "/catalog/product/liquor-station/bud-light-lager/71",
            "packaging": "6",
            "size": "341ml",
            "price": 15.99
        },
        {
            "brand": "Purex",
            "name": "Bathroom Tissue Paper",
            "image": "/resources/images/products/everyday-needs/p_11000.jpeg",
            "url": "/catalog/product/snack-vendor/purex-bathroom-tissue-paper/6500",
            "packaging": "4",
            "size": "Double R.",
            "price": 5.29
        },
        {
            "brand": "Perrier",
            "name": "Sparkling Water",
            "image": "/resources/images/products/beverages/b_9529.jpeg",
            "url": "/catalog/product/snack-vendor/perrier-lemon-orange/5535",
            "packaging": "6",
            "size": "500ml",
            "price": 10.74
        },
        {
            "brand": "Simply",
            "name": "Lemonade Orange",
            "image": "/resources/images/products/beverages/b_9506.jpeg",
            "url": "/catalog/product/snack-vendor/simply-lemonade-orange/5509",
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
            "url": "/catalog/product/snack-vendor/arctic-glacier-ice/5533",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Absolut",
            "name": "Vodka",
            "image": "/resources/images/products/spirit/b_5000.jpeg",
            "url": "/catalog/product/liquor-station/absolut-vodka/2500",
            "packaging": "1",
            "size": "750ml",
            "price": 28.99
        },
        {
            "brand": "Lindt",
            "name": "Hazelnut Chocolate",
            "image": "/resources/images/products/snacks/br_9039.jpeg",
            "url": "/catalog/product/snack-vendor/lindt-hazelnut-chocolate/4539",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        },
        {
            "brand": "Jagermeister",
            "name": "Herbal Liqueur",
            "image": "/resources/images/products/liqueur/b_7000.jpeg",
            "url": "/catalog/product/liquor-station/jagermeister-herbal-liqueur/3500",
            "packaging": "1",
            "size": "750ml",
            "price": 31.99
        },
        {
            "brand": "San Pellegrino",
            "name": "Sparkling Blood Orange",
            "image": "/resources/images/products/beverages/b_11610.jpeg",
            "url": "/catalog/product/linas-italian-market/san-pellegrino-sparkling-blood-orange/7110",
            "packaging": "1",
            "size": "330ml",
            "price": 1.69
        }
    ],
    "grains-and-legumes": [
        {
            "brand": "Doritos",
            "name": "Cheese",
            "image": "/resources/images/products/snacks/p_9028.jpeg",
            "url": "/catalog/product/snack-vendor/doritos-cheese/4528",
            "packaging": "1",
            "size": "family",
            "price": 4.79
        },
        {
            "brand": "Tostitos",
            "name": "Round",
            "image": "/resources/images/products/snacks/p_9031.jpeg",
            "url": "/catalog/product/snack-vendor/tostitos-round/4531",
            "packaging": "1",
            "size": "regular",
            "price": 4.49
        },
        {
            "brand": "Jack Link's",
            "name": "Cholula",
            "image": "/resources/images/products/snacks/p_9016.jpeg",
            "url": "/catalog/product/snack-vendor/jack-links-cholula/4516",
            "packaging": "1",
            "size": "80gm",
            "price": 6.99
        },
        {
            "brand": "Tostitos",
            "name": "Red Pepper Salsa",
            "image": "/resources/images/products/snacks/jr_9045.jpeg",
            "url": "/catalog/product/snack-vendor/tostitos-red-pepper-salsa/4545",
            "packaging": "1",
            "size": "425gm",
            "price": 4.59
        },
        {
            "brand": "Doritos",
            "name": "Cheese",
            "image": "/resources/images/products/snacks/p_9028.jpeg",
            "url": "/catalog/product/snack-vendor/doritos-cheese/4528",
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
            "url": "/catalog/product/snack-vendor/lindt-chili-piment-rouge/4542",
            "packaging": "1",
            "size": "100gm",
            "price": 3.89
        },
        {
            "brand": "Browne",
            "name": "Corkscrew Wing Bottle Opener",
            "image": "/resources/images/products/party-supply/o_10023.jpeg",
            "url": "/catalog/product/liquor-station/browne-corkscrew-wing-bottle-opener/6023",
            "packaging": "1",
            "size": "6in",
            "price": 3.99
        },
        {
            "brand": "Mozaik",
            "name": "Classic Wine Glass",
            "image": "/resources/images/products/party-supply/p_10013.jpeg",
            "url": "/catalog/product/liquor-station/mozaik-classic-wine-glass/6013",
            "packaging": "4",
            "size": "15oz",
            "price": 9.49
        },
        {
            "brand": "Sea Change Seafoods",
            "name": "Candied Wild Smoked Salmon",
            "image": "/resources/images/products/dry-packaged/cntr_11112.jpeg",
            "url": "/catalog/product/linas-italian-market/sea-change-seafoods-candied-wild-smoked-salmon/6613",
            "packaging": "1",
            "size": "70mg",
            "price": 14.99
        },
        {
            "brand": "Rummo",
            "name": "Fusilli #48",
            "image": "/resources/images/products/pasta-and-baking/bx_11006.jpeg",
            "url": "/catalog/product/linas-italian-market/rummo-fusilli-48/6506",
            "packaging": "1",
            "size": "500gm",
            "price": 2.69
        }
    ],
    "dry-packaged": [
        {
            "brand": "Patron",
            "name": "Silver",
            "image": "/resources/images/products/spirit/b_5097.jpeg",
            "url": "/catalog/product/liquor-station/patron-silver/2596",
            "packaging": "1",
            "size": "750ml",
            "price": 71.99
        },
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/snack-vendor/arctic-glacier-ice/5533",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Red Bull",
            "name": "Classic",
            "image": "/resources/images/products/beverages/c_9526.jpeg",
            "url": "/catalog/product/snack-vendor/red-bull-classic/5531",
            "packaging": "4",
            "size": "250",
            "price": 10.49
        },
        {
            "brand": "Mott's",
            "name": "Clamato The Original",
            "image": "/resources/images/products/beverages/b_9511.jpeg",
            "url": "/catalog/product/snack-vendor/motts-clamato-the-original/5516",
            "packaging": "1",
            "size": "32oz",
            "price": 3.99
        },
        {
            "brand": "Coca-Cola",
            "name": "Classic",
            "image": "/resources/images/products/beverages/b_9500.jpeg",
            "url": "/catalog/product/snack-vendor/coca-cola-classic/5500",
            "packaging": "1",
            "size": "1L",
            "price": 2.79
        },
    ],
    "condiments": [
        {
            "brand": "Lindt",
            "name": "Intense Orange",
            "image": "/resources/images/products/snacks/br_9043.jpeg",
            "url": "/catalog/product/snack-vendor/lindt-intense-orange/4543",
            "packaging": "1",
            "size": "100gm",
            "price": 3.89
        },
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/snack-vendor/arctic-glacier-ice/5533",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Guinness",
            "name": "Draught",
            "image": "/resources/images/products/beer/c_1060.jpeg",
            "url": "/catalog/product/liquor-station/guinness-draught/83",
            "packaging": "4",
            "size": "440ml",
            "price": 14.99
        },
        {
            "brand": "Natur Puglia",
            "name": "Taralli with Pizza Flavour",
            "image": "/resources/images/products/baked-goods/btc_11262.jpeg",
            "url": "/catalog/product/linas-italian-market/natur-puglia-taralli-with-pizza-flavour/6830",
            "packaging": "1",
            "size": "250gm",
            "price": 3.99
        },
        {
            "brand": "Touch Bamboo",
            "name": "Paddle Skewer",
            "image": "/resources/images/products/party-supply/p_10014.jpeg",
            "url": "/catalog/product/liquor-station/touch-bamboo-paddle-skewer/6014",
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
            "url": "/catalog/product/snack-vendor/twizzler-strawberry/4537",
            "packaging": "1",
            "size": "227gm",
            "price": 2.99
        },
        {
            "brand": "Pringles",
            "name": "Sour Cream & Onion",
            "image": "/resources/images/products/snacks/p_9001.jpeg",
            "url": "/catalog/product/snack-vendor/pringles-sour-cream-onion/4501",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.69
        },
        {
            "brand": "Stella Artois",
            "name": "Pale Lager",
            "image": "/resources/images/products/beer/b_1039.jpeg",
            "url": "/catalog/product/liquor-station/stella-artois-pale-lager/109",
            "packaging": "6",
            "size": "330ml",
            "price": 18.49
        },
        {
            "brand": "Cocktail Shaker",
            "name": "30oz",
            "image": "/resources/images/products/party-supply/o_10012.jpeg",
            "url": "/catalog/product/liquor-station/cocktail-shaker-30oz/6012",
            "packaging": "1",
            "size": "30oz",
            "price": 14.49
        },
        {
            "brand": "Hershey's",
            "name": "Cookies & Cream",
            "image": "/resources/images/products/snacks/br_9041.jpeg",
            "url": "/catalog/product/snack-vendor/hersheys-cookies-cream/4541",
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
            "url": "/catalog/product/liquor-station/scotties-napkins/6015",
            "packaging": "210",
            "size": "regular",
            "price": 2.49
        },
        {
            "brand": "Bevara",
            "name": "Sealing Cleaps",
            "image": "/resources/images/products/party-supply/p_10022.jpeg",
            "url": "/catalog/product/liquor-station/bevara-sealing-cleaps/6022",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.69
        },
        {
            "brand": "Shot Glass",
            "name": "35ml",
            "image": "/resources/images/products/party-supply/p_10020.jpeg",
            "url": "/catalog/product/liquor-station/shot-glass-35ml/6020",
            "packaging": "6",
            "size": "330ml",
            "price": 18.49
        },
        {
            "brand": "Mozaik",
            "name": "Cutlery Set",
            "image": "/resources/images/products/party-supply/p_10007.jpeg",
            "url": "/catalog/product/liquor-station/mazaik-cutlery-set/6007",
            "packaging": "80",
            "size": "combo",
            "price": 10.99
        },
        {
            "brand": "Lindt",
            "name": "Hazelnut Chocolate",
            "image": "/resources/images/products/snacks/br_9039.jpeg",
            "url": "/catalog/product/snack-vendor/lindt-hazelnut-chocolate/4539",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        }
    ],
    "coffee-and-tea": [
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/snack-vendor/arctic-glacier-ice/5533",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Absolut",
            "name": "Vodka",
            "image": "/resources/images/products/spirit/b_5000.jpeg",
            "url": "/catalog/product/liquor-station/absolut-vodka/2500",
            "packaging": "1",
            "size": "750ml",
            "price": 28.99
        },
        {
            "brand": "Lindt",
            "name": "Hazelnut Chocolate",
            "image": "/resources/images/products/snacks/br_9039.jpeg",
            "url": "/catalog/product/snack-vendor/lindt-hazelnut-chocolate/4539",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        },
        {
            "brand": "Jagermeister",
            "name": "Herbal Liqueur",
            "image": "/resources/images/products/liqueur/b_7000.jpeg",
            "url": "/catalog/product/liquor-station/jagermeister-herbal-liqueur/3500",
            "packaging": "1",
            "size": "750ml",
            "price": 31.99
        },
        {
            "brand": "San Pellegrino",
            "name": "Sparkling Blood Orange",
            "image": "/resources/images/products/beverages/b_11610.jpeg",
            "url": "/catalog/product/linas-italian-market/san-pellegrino-sparkling-blood-orange/7110",
            "packaging": "1",
            "size": "330ml",
            "price": 1.69
        }
    ],
    "confectionery": [
        {
            "brand": "Arctic Glacier",
            "name": "Ice",
            "image": "/resources/images/products/beverages/p_9528.jpeg",
            "url": "/catalog/product/snack-vendor/arctic-glacier-ice/5533",
            "packaging": "1",
            "size": "5.95lb",
            "price": 3.59
        },
        {
            "brand": "Absolut",
            "name": "Vodka",
            "image": "/resources/images/products/spirit/b_5000.jpeg",
            "url": "/catalog/product/liquor-station/absolut-vodka/2500",
            "packaging": "1",
            "size": "750ml",
            "price": 28.99
        },
        {
            "brand": "Lindt",
            "name": "Hazelnut Chocolate",
            "image": "/resources/images/products/snacks/br_9039.jpeg",
            "url": "/catalog/product/snack-vendor/lindt-hazelnut-chocolate/4539",
            "packaging": "1",
            "size": "100gm",
            "price": 3.19
        },
        {
            "brand": "Jagermeister",
            "name": "Herbal Liqueur",
            "image": "/resources/images/products/liqueur/b_7000.jpeg",
            "url": "/catalog/product/liquor-station/jagermeister-herbal-liqueur/3500",
            "packaging": "1",
            "size": "750ml",
            "price": 31.99
        },
        {
            "brand": "San Pellegrino",
            "name": "Sparkling Blood Orange",
            "image": "/resources/images/products/beverages/b_11610.jpeg",
            "url": "/catalog/product/linas-italian-market/san-pellegrino-sparkling-blood-orange/7110",
            "packaging": "1",
            "size": "330ml",
            "price": 1.69
        }
    ],
}

router.get("/product/:storeName/:productName/:productId", async function (req, res, next) {
    var product = await Catalog.getProductPageItemsByProductId(req.params.storeName,req.params.productId);

    var validationUrl = clearProductUrl("/product/" + product.store_type_api_name + "/" + _.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-") + "/" + product.product_id);

    if (!product || validationUrl != req.url) {
        return res.redirect("/notfound");
    }

    // Assign variables
    req.options.ejs.product_brand = product.brand;
    req.options.ejs.product_name = product.name;

    if (product.store_type_api_name == "linas-italian-market") {
        req.options.ejs.store_type_display_name = '<li><span class="bold">Sold By: </span><a href="'+ "https://linasmarket.com/" +'" target="_blank" itemprop="additionalProperty">' + _.startCase(product.store_type_display_name, '-', ' ') + '</a></li>';
    } else {
        req.options.ejs.store_type_display_name = undefined;
    }

    if(product.details.country_of_origin){
        req.options.ejs.country_of_origin = '<li><span class="bold">Country of Origin:</span><span itemprop="additionalProperty"> ' + product.details.country_of_origin + '</span></li>';
    } else{
        req.options.ejs.country_of_origin ="";
    }

    if(product.details.producer){
        req.options.ejs.producer = '<li><span class="bold">Made by:</span><span itemprop="manufacturer"> ' + product.details.producer + '</span></li>';
    }else{
        req.options.ejs.producer = "";
    }

    if(product.details.alcohol_content){
        req.options.ejs.alcohol_content = '<li><span class="bold">Alcohol/Vol:</span><span itemprop="additionalProperty"> '+ product.details.alcohol_content + '</span></li>';
    } else{
        req.options.ejs.alcohol_content = "";
    }

    if(product.type){
        req.options.ejs.product_type = '<li><span class="bold">Type:</span><span itemprop="additionalType"> ' + product.type + '</span></li>';
    } else{
        req.options.ejs.product_type = "";
    }

    if(product.details.preview){
        req.options.ejs.preview = '<section class="preview-sec" itemprop="description"><div class="description"><h3 class="sub-header">Product Description:</h3><p> ' + convertHomitTags(product.details.preview) + '</p></div></section>';
    } else{
        req.options.ejs.preview = "";
    }

    if(product.details.ingredients){
        req.options.ejs.ingredients = '<section class="ingredients-sec" itemprop="disambiguatingDescription"><div class="ingredients"><h3 class="sub-header">Ingredients:</h3><span> ' + convertHomitTags(product.details.ingredients) + '</span></div></section>';
    } else{
        req.options.ejs.ingredients = "";
    }

    if(product.details.serving_suggestions){
        req.options.ejs.serving_suggestions = '<section class="preview-sec" itemprop="additionalProperty"><div class="description"><h3 class="sub-header">Serving Sugestions:</h3><p> ' + convertHomitTags(product.details.serving_suggestions) + '</p></div></section>';
    }else{
        req.options.ejs.serving_suggestions = "";
    }
    
    if(product.images.length > 0){
        req.options.ejs.product_image = '<img itemprop="image" width="0px" height="0px" src="' + product.images[0] + '">';
    }

    req.options.ejs.product_images = JSON.stringify({"images" : product.images});
    req.options.ejs.recommended_products = JSON.stringify(recommended_products[product.category]);
    req.options.ejs.see_more_url = "https://homit.ca/catalog/" + product.store_type_api_name + "/" + product.category;


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
        req.options.ejs.selectedCategory = req.params.category.replace(/-/g, " ");
        res.render("catalog.ejs", req.options.ejs);
    } catch (e) {
        next()
    }
});

function convertArrayToString(array) {
    return "[\"" + array.join("\",\"") + "\"]";
}

function convertHomitTags(string) {
    var tmpString = string;
    for (tag in homit_tags) {
        tmpString = tmpString.replace(new RegExp(tag, 'g'), homit_tags[tag]);
    }
    return tmpString;
}

function clearProductUrl(path){
    var tempPath = path;
    let characters = ["#", "&", "'", ",", ".", "%"];
    for(let i=0; i<characters.length; i++){
        tempPath = tempPath.replace(characters[i], "");
    }
    tempPath = tempPath.replace("---", "-");
    tempPath = tempPath.replace("--", "-");
    return tempPath;
}

function clearHomitTags(string) {
    var tmpString = string;
    for (tag in homit_tags) {
        tmpString = tmpString.replace(new RegExp(tag, 'g'), "");
    }
    return tmpString;
}

module.exports = router;