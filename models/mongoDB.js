let pub = {};
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/homit', { useNewUrlParser: true }).then(function (result) {
    console.log("Connection to Mongo DB established");
}, function (err) {
    throw new Error('Error connecting to Mongo DB');
});

let productSchema = new Schema({
    _id: Schema.Types.Mixed,
    brand: String,
    name: String,
    container: String,
    images: {
        image_catalog: String,
        images_all: [String]
    },
    category: {
        category_display_name: String,
        category_name: String,
        category_image: String,
        category_cover: String
    },
    subcategory: String,
    details: {
        ingredients: {
            display_name: String,
            description: String,
        },
        preview: {
            display_name: String,
            description: String
        },
        country_of_origin: {
            display_name: String,
            description: String
        },
        serving_suggestions: {
            display_name: String,
            description: String
        }
    },
    tags: [
        {
            name: Number,
            rating: String,
            icon_url: String
        }
    ],
    variance: [
        {
            _id: Schema.Types.Mixed,
            size: Number,
            unit: String,
            preffered_unit: String,
            packs: [
                {
                    _id: Schema.Types.Mixed,
                    type: Number,
                    price: Number,
                    available: Boolean,
                    stock_quantity: Number
                }
            ]
        }
    ]
});

module.exports = pub;
