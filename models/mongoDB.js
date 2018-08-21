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

pub.suggestSearch = async function (suggest, inLimit, cb) {
    MDB.models['liquor-station'].esSearch({
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
    }, async function (err, results) {
        if (err) {
            return console.log(JSON.stringify(err, null, 4));
        }
        let options = results.suggest.suggested[0].options;
        let result = [];
        let limit = Math.min(inLimit, options.length);

        for (let i = 0; i < limit; i++) {
            let id = options[i]._id.split('-')[0];
            let product = options[i]._source;
            product._id = options[i]._id;
            let storeInfo = await db.selectAllWhereLimitOne(db.tables.catalog_store_types, { "id": id });
            product.store_name = storeInfo[0].name;
            delete product.details;
            result.push(product);
        }

        cb(result);
    });
}

async function getMongoProducts(inObject, cb) {
    let finalResult = {};
    let searchedFields = new Map();

    for (let key in inObject) {
        for (let i = 0; i < inObject[key].length; i++) {
            searchedFields.set(key, inObject[key].length);
            MDB.models['liquor-station'].search({
                query_string: {
                    query: inObject[key][i].text
                }
            }, function (err, result) {
                if (result && !err) {
                    if (!finalResult[key]) finalResult[key] = [];
                    finalResult[key] = finalResult[key].concat(result.hits.hits);
                    searchedFields.set(key, searchedFields.get(key)-1);
                    for (let value of searchedFields.values()) {
                        if (value) {
                            return false;
                        }
                    }
                    cb(finalResult);
                    return;
                }
            });
        }
    }
}

pub.globalSearch = async function (inText, cb) {
    MDB.models['liquor-station'].esSearch({
        "suggest": {
            "text": inText,
            "brand-suggest": {
                "phrase": {
                    "field": "brand",
                    "size": 3,
                    "gram_size": 3,
                    "max_errors": 3,
                    "direct_generator": [{
                        "field": "brand",
                        "suggest_mode": "always"
                    }],
                    "highlight": {
                        "pre_tag": "<em>",
                        "post_tag": "</em>"
                    }
                }
            },
            "name-suggest": {
                "phrase": {
                    "field": "name",
                    "size": 3,
                    "gram_size": 3,
                    "max_errors": 3,
                    "direct_generator": [{
                        "field": "name",
                        "suggest_mode": "always"
                    }],
                    "highlight": {
                        "pre_tag": "<em>",
                        "post_tag": "</em>"
                    }
                }
            },
            "cat-suggest": { "phrase": { "field": "category.category_display_name" } },
            "subcat-suggest": { "phrase": { "field": "subcategory" } },
            "country-suggest": { "phrase": { "field": "details.country_of_origin.description" } },
            "desc-suggest": { 
                "phrase": { 
                    "field": "details.preview.description" ,
                    "size": 1,
                    "gram_size": 4,
                    "max_errors": 1,
                }
            },

        }
    }, async function (err, results) {
        if (err) {
            return console.log(JSON.stringify(err, null, 4));
        }
        let options = {};

        options['brand-suggest'] = results.suggest['brand-suggest'][0].options;
        options['name-suggest'] = results.suggest['name-suggest'][0].options;
        options['cat-suggest'] = results.suggest['cat-suggest'][0].options;
        options['subcat-suggest'] = results.suggest['subcat-suggest'][0].options;
        options['country-suggest'] = results.suggest['country-suggest'][0].options;
        options['desc-suggest'] = results.suggest['desc-suggest'][0].options;

       getMongoProducts(options, cb);

    });
}

module.exports = pub;