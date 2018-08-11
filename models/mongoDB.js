let pub = {};
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let mySQLConnected = false;
let MongoDBConnected = false;
let inititialized = false;
pub.models = [];

if (!process.env.DB_NAME_MONGO) {
    throw new Error('Missing env variable for Mongo DB name');
}

let db_name = process.env.DB_NAME_MONGO;

mongoose.connect(`mongodb://localhost:27017/${db_name}`, { useNewUrlParser: true }).then(function (result) {
    console.log("Connection to Mongo DB established");
    MongoDBConnected = true;
    init();
}, function (err) {
    throw new Error('Error connecting to Mongo DB');
});

/**
 * Registers when MySQL connects to start fetching data from it
 */
pub.mySQLConnected = function () {
    mySQLConnected = true;
    init();
}

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
            si_unit_size: Number,
            si_unit: String,
            preffered_unit: String,
            preffered_unit_size: String,
            packs: [
                {
                    _id: Schema.Types.Mixed,
                    h_value: Number,
                    price: Number,
                    available: Number,
                    stock_quantity: Number,
                    tax: Number,
                    sold: {
                        quantity: Number
                    }
                }
            ]
        }
    ]
});

/**
 * Dummy function
 * @param {*} storeType 
 * @param {*} productBrand 
 */
pub.findProductByBrand = async function (storeType, productBrand) {                                     //will be deleted 
    return pub.models[storeType].findOne({ 'brand': productBrand }, {}, function (err, product) {
        if (err) throw new Error(err);
        return product;
    });
}

/**
 * Inits storeType - Collection registration with Mongo DB
 */
async function init() {
    if (mySQLConnected && MongoDBConnected && !inititialized) {
        inititialized = true;
        let storeTypes = await Catalog.getAllStoreTypeNames();

        if (storeTypes && storeTypes.length > 0) {
            for (storeType in storeTypes) {
                let storeTypeName = storeTypes[storeType].name;
                pub.models[storeTypeName] = mongoose.model(storeTypeName, productSchema, storeTypeName);
            }
        }

        if (process.env.n_mode != "production") {
            console.log('Initialized store models with Mongo DB');
        }
    }
}

module.exports = pub;
