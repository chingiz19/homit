let pub = {};
let mongoose = require('mongoose'), mongoosastic = require('mongoosastic');
let Schema = mongoose.Schema;
let mySQLConnected = false;
let MongoDBConnected = false;
let inititialized = false;
let indexedStores = [];
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
 * Registers when MySQL connection
 */
pub.mySQLConnected = function () {
    mySQLConnected = true;
    init();
}

let productSchema = new Schema({
    _id: { type: Schema.Types.Mixed, es_indexed: true, es_type: 'keyword' },
    brand: {
        type: Schema.Types.String,
        required: true,
        es_indexed: true,
        es_type: 'text',
    },
    name: {
        type: Schema.Types.String,
        required: true,
        es_indexed: true,
        es_type: 'text',
    },
    brandname: {
        type: Schema.Types.String,
        required: true,
        es_indexed: true,
        es_type: 'completion',
    },
    tax: { type: Schema.Types.Number, es_indexed: false },
    container: { type: Schema.Types.String, es_indexed: false },
    images: {
        es_indexed: false,
        image_catalog: {
            type: Schema.Types.String,
            es_indexed: false
        },
        images_all: [Schema.Types.String]
    },
    category: {
        category_display_name: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        },
        category_name: { type: Schema.Types.String, es_indexed: false },
        category_image: { type: Schema.Types.String, es_indexed: false },
        category_cover: { type: Schema.Types.String, es_indexed: false }
    },
    subcategory: {
        type: Schema.Types.String,
        es_indexed: true,
        es_type: 'keyword'
    },
    details: {
        ingredients: {
            display_name: { type: Schema.Types.String, es_indexed: false },
            description: { type: Schema.Types.String, es_indexed: true, es_type: 'text' }
        },
        preview: {
            display_name: { type: Schema.Types.String, es_indexed: false },
            description: { type: Schema.Types.String, es_indexed: true, es_type: 'text' }
        },
        country_of_origin: {
            display_name: { type: Schema.Types.String, es_indexed: false },
            description: { type: Schema.Types.String, es_indexed: true, es_type: 'text' }
        },
        serving_suggestions: {
            display_name: { type: Schema.Types.String, es_indexed: false },
            description: { type: Schema.Types.String, es_indexed: true, es_type: 'text' }
        }
    },
    tags: [
        {
            name: { type: Schema.Types.String, es_indexed: true, es_type: 'keyword' },
            rating: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
            icon_url: { type: Schema.Types.String, es_indexed: false }
        }
    ],
    variance: [
        {
            _id: { type: Schema.Types.Mixed, es_indexed: false },
            si_unit_size: { type: Schema.Types.Number, es_indexed: false },
            si_unit: { type: Schema.Types.String, es_indexed: false },
            preffered_unit: { type: Schema.Types.String, es_indexed: false },
            preffered_unit_size: { type: Schema.Types.String, es_indexed: false },
            packs: [
                {
                    _id: { type: Schema.Types.Mixed, es_indexed: false },
                    h_value: { type: Schema.Types.Number, es_indexed: false },
                    price: { type: Schema.Types.Number, es_indexed: false },
                    available: { type: Schema.Types.Number, es_indexed: false },
                    stock_quantity: { type: Schema.Types.Number, es_indexed: false },
                    sold: {
                        quantity: { type: Schema.Types.Number, es_indexed: false },
                    }
                }
            ]
        }
    ]
});

productSchema.plugin(mongoosastic);

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
                pub.models[storeTypeName].createMapping(function (err, mapping) {
                    if (err) {
                        Logger.log.error('Error creating mapping (you can safely ignore this)');
                        if (process.env.n_mode != "production") { console.log(err); }
                    } else {
                        Logger.log.debug(`Mapping created for ${storeTypeName} and mapping is ${JSON.stringify(mapping)}`);
                    }
                    synchronizeModel(pub.models[storeTypeName], storeTypeName);
                });
            }
        }

        if (process.env.n_mode != "production") {
            console.log('Initialized store models with Mongo DB');
        }
    }
}

async function synchronizeModel(mongoModel, storeType) {
    indexedStores[storeType] = false;
    let stream = mongoModel.synchronize(), count = 0;

    stream.on('data', function (err, doc) {
        count++;
    });
    stream.on('close', function () {
        indexedStores[storeType] = true;
        checkIfSyncIsDone();
    });
    stream.on('error', function (err) {
        console.log(err);
    });
}

function checkIfSyncIsDone() {
    for (let i in indexedStores) {
        if (!indexedStores[i]) {
            return;
        }
    }
    if (process.env.n_mode != "production") {
        return console.log('All Mongo DB documents have been sync-ed');
    }
    return true;
}

pub.testSearch = async function (suggest) {
    MDB.models['pure-foods-fresh'].esSearch({
        "suggest": {
            "suggested": {
                "prefix": suggest,
                "completion": {
                    "field": "brandname",
                    "fuzzy": {
                        "fuzziness": 1
                    }
                }
            }
        }
    }, function (err, results) {
        if (err) {
            return console.log(JSON.stringify(err, null, 4));
        }
        return displayOptions(results);
    });
}

function displayOptions(results) {
    let options = results.suggest.suggested[0].options;

    for (let i in options) {
        console.log(options[i].text);
    }
}

module.exports = pub;
