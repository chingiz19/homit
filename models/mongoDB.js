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
        // es_analyzer: "autocomplete", 
        // es_search_analyzer: "standard" 
    },
    tax: { type: Schema.Types.Number, es_indexed: false },
    container: { type: Schema.Types.String, es_indexed: false },
    images: {
        image_catalog: {
            type: Schema.Types.String,
            required: true,
            es_indexed: true,
            es_type: 'text'
        },
        images_all: [
            {
                type: Schema.Types.String,
                required: true,
                es_indexed: true,
                es_type: 'text'
            }]
    },
    category: {
        category_display_name: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        },
        category_name: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        },
        category_image: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        },
        category_cover: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        }
    },
    subcategory: {
        type: Schema.Types.String,
        es_indexed: true,
        es_type: 'keyword'
    },
    store: {
        name: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'keyword'
        },
        display_name: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'text'
        },
        image_url: {
            type: Schema.Types.String,
            es_indexed: true,
            es_type: 'text'
        },
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
            si_unit_size: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
            si_unit: { type: Schema.Types.String, es_indexed: true, es_type: 'text' },
            preffered_unit: { type: Schema.Types.String, es_indexed: true, es_type: 'text' },
            preffered_unit_size: { type: Schema.Types.String, es_indexed: true, es_type: 'text' },
            packs: [
                {
                    _id: { type: Schema.Types.Mixed, es_indexed: false },
                    h_value: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
                    price: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
                    available: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
                    stock_quantity: { type: Schema.Types.Number, es_indexed: true, es_type: 'integer' },
                    sold: {
                        quantity: { type: Schema.Types.Number, es_indexed: false },
                    }
                }
            ]
        }
    ]
});

productSchema.plugin(mongoosastic);

pub.suggestSearch = async function (suggest, inLimit, cb) {
    MDB.models['liquor-station'].esSearch({
        "suggest": {
            "suggested": {
                "prefix": suggest,
                "completion": {
                    "field": "brandname",
                    "fuzzy": {
                        "fuzziness": 1,
                        "skip_duplicates": true
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
            let product = options[i]._source;
            product._id = options[i]._id;
            delete product.details;
            delete product.variance;
            result.push(product);
        }

        cb(result);
    });
}

pub.globalSearch = async function (inText, cb) {
    let finalResult = [];
    let searchedFields = new Map();

    MDB.models['liquor-station'].search({
        query_string: {
            query: inText
        }
    }, function (err, result) {
        if (!err && result && result.hits && result.hits.hits && result.hits.hits.length > 0) {
            finalResult.push({
                "results": result.hits.hits,
                "highlight": undefined,
                "score": undefined
            });
            cb(finalResult);
        } else {
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
                                "pre_tag": "",
                                "post_tag": ""
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
                                "pre_tag": "",
                                "post_tag": ""
                            }
                        }
                    },
                    "cat-suggest": {
                        "phrase": {
                            "field": "category.category_display_name",
                            "highlight": {
                                "pre_tag": "",
                                "post_tag": ""
                            }
                        }
                    },
                    "subcat-suggest": {
                        "phrase": {
                            "field": "subcategory", "highlight": {
                                "pre_tag": "",
                                "post_tag": ""
                            }
                        }
                    },
                    "country-suggest": {
                        "phrase": {
                            "field": "details.country_of_origin.description",
                            "highlight": {
                                "pre_tag": "",
                                "post_tag": ""
                            }
                        }
                    },
                    "desc-suggest": {
                        "phrase": {
                            "field": "details.preview.description",
                            "size": 1,
                            "gram_size": 4,
                            "max_errors": 1,
                            "highlight": {
                                "pre_tag": "",
                                "post_tag": ""
                            }
                        }
                    },

                }
            }, async function (err, results) {
                if (err && process.env.n_mode != "production") {
                    return console.log(JSON.stringify(err, null, 4));
                }

                let suggestResults = [];

                suggestResults = suggestResults.concat(results.suggest['brand-suggest'][0].options);
                suggestResults = suggestResults.concat(results.suggest['name-suggest'][0].options);
                suggestResults = suggestResults.concat(results.suggest['cat-suggest'][0].options);
                suggestResults = suggestResults.concat(results.suggest['subcat-suggest'][0].options);
                suggestResults = suggestResults.concat(results.suggest['country-suggest'][0].options);
                suggestResults = suggestResults.concat(results.suggest['desc-suggest'][0].options);

                if (suggestResults.length > 0) {
                    for (let key in suggestResults) {
                        searchedFields.set(suggestResults[key].text + key, false);
                        MDB.models['liquor-station'].search({
                            query_string: {
                                query: suggestResults[key].text
                            }
                        }, function (err, result) {
                            if (!err && result && result.hits && result.hits.hits && result.hits.hits.length > 0) {
                                searchedFields.set(suggestResults[key].text + key, true);

                                finalResult.push({
                                    "results": result.hits.hits,
                                    "highlight": suggestResults[key].highlighted,
                                    "score": suggestResults[key].score
                                });

                                for (let value of searchedFields.values()) {
                                    if (!value) {
                                        return false;
                                    }
                                }
                                cb(finalResult);
                                return;
                            }
                        });
                    }
                } else {
                    cb(false);
                }
            });
        }
    });
}

/**
 * Function takes array of product UIDs
 * @param {*} UIDs 
 */
pub.findProducts = async function (UIDs, quantityArray) {
    let finalResult = [];

    for (let k in UIDs) {
        let IDobject = pub.formatReceviedUID(UIDs[k]);
        let rawStore = await db.selectAllWhereLimitOne(db.tables.catalog_store_types, { "id": IDobject.storeId });
        if (rawStore && rawStore.length > 0) {
            let selectedStore = rawStore[0];
            let searchId = IDobject.storeId + '-' + IDobject.productId;
            let product = await MDB.models[selectedStore.name].findById(searchId).exec();
            let cleanProduct = product.toObject();
            if (quantityArray && quantityArray[UIDs[k]]) {
                cleanProduct.selected = {
                    quantity: quantityArray[UIDs[k]],
                    UID: UIDs[k]
                }
            }
            finalResult.push(cleanProduct);
        }
    }

    return finalResult;
}

/**
* Returns formatted id as object 
* 
* @param {String} raw received UID
*/
pub.formatReceviedUID = function (raw) {
    let finalObject = {};

    if (raw && typeof raw === 'string') {
        let splitArray = raw.split('-');
        finalObject.storeId = splitArray[0];
        finalObject.productId = splitArray[1];
        finalObject.varianceId = splitArray[2];
        finalObject.packId = splitArray[3];
    }

    return finalObject;
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
                pub.models[storeTypeName].createMapping({
                    "analysis": {
                        "filter": {
                            "autocomplete_filter": {
                                "type": "edge_ngram",
                                "min_gram": 1,
                                "max_gram": 20
                            }
                        },
                        "analyzer": {
                            "autocomplete": {
                                "type": "custom",
                                "tokenizer": "standard",
                                "filter": [
                                    "lowercase",
                                    "autocomplete_filter"
                                ]
                            }
                        }
                    }
                }, function (err, mapping) {
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
    let stream = mongoModel.synchronize();

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

module.exports = pub;