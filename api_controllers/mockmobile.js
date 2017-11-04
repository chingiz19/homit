var router = require("express").Router();


var OutPutData1 = {
    "action": "dispatch",
    "details": {
        "store": {
            "store_id": "l1",
            "address": "3630 Brentwood Rd NW #750, Calgary, AB T2L 1K8",
            "name": "Liquor Depot",
            "nextNodeId": "-1"
        },
        "customer": {
            "customer_id": "u1",
            "first_name": "John",
            "last_name": "Lee",
            "address": "9 Cromwell Ave NW Calgary, AB T2L 0M6",
            "phone": 4031234567,

            "order": {
                "store": "l1",
                "products": [
                    {
                        "depot_id": 1,
                        "product_brand": "Corona",
                        "product_name": "Extra",
                        "product_image": "http://www.lcbo.com/content/dam/lcbo/products/186510.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg",
                        "packaging": "6",
                        "volume": "330ml",
                        "container": "bottle",
                        "price": "22",
                        "type_name": "Lager",
                        "subcategory": "Lager",
                        "category": "beer",
                        "super_category": "liquor"
                    },

                    {
                        "depot_id": 2,
                        "product_brand": "Smirnoff",
                        "product_name": "Ice",
                        "product_image": "https://images-na.ssl-images-amazon.com/images/I/512W9EDUEnL._SX342_.jpg",
                        "packaging": "6",
                        "volume": "330ml",
                        "container": "bottle",
                        "price": "15",
                        "type_name": "Vodka",
                        "subcategory": "spirits",
                        "category": "spirits",
                        "super_category": "liquor"
                    }
                ]
            }
        }
    }
}


var OutPutData2 = {
    "action": "dispatch",
    "details": {
        "store": {
            "store_id": "s1",
            "address": "3636 Brentwood Rd NW, Calgary, AB T2L 1K8",
            "name": "Safeway",
            "nextNodeId": "u1"
        },
        "customer": {
            "customer_id": "u1",
            "first_name": "James",
            "last_name": "Cook",
            "address": "200 Hawkwood Blvd NW Calgary, AB T3G",
            "phone": 4032238575,

            "order": {
                "store": "store id",
                "products": [
                    {
                        "depot_id": 11,
                        "product_brand": "Lays",
                        "product_name": "Classic",
                        "product_image": "https://www.fritolay.com/images/default-source/blue-bag-image/lays-classic.png?sfvrsn=bd1e563a_2",
                        "packaging": "",
                        "volume": "250g",
                        "container": "bottle",
                        "price": "5",
                        "type_name": "",
                        "subcategory": "Chips",
                        "category": "Chips",
                        "super_category": "Snacks"
                    },

                    {
                        "depot_id": 12,
                        "product_brand": "Red bull",
                        "product_name": "classic",
                        "product_image": "http://image.redbull.com/rbx00264/0100/0/406/products/packshots/en_GB/Red-Bull-Energy-Drink-Can-UK.png",
                        "packaging": "4-pack",
                        "volume": "330ml",
                        "container": "cans",
                        "price": "15",
                        "type_name": "",
                        "subcategory": "Energy drink",
                        "category": "Drinks",
                        "super_category": "Snacks"
                    }
                ]
            }
        }
    }
}

router.post("/data1", function(req, res, next){
    res.json(OutPutData1);
});

router.post("/data2", function(req, res, next){
    res.json(OutPutData2);
});

module.exports = router;