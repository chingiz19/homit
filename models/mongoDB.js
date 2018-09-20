let pub = {};
let mongoose = require('mongoose'), mongoosastic = require('mongoosastic');
let productSchema = require('./product_schema');
let mySQLConnected = false;
let MongoDBConnected = false;
let inititialized = false;
let indexedStores = [];
const INDEX_NAME = "homit_products";
const TYPE_NAME = "product";
pub.models = [];

if (!process.env.DB_NAME_MONGO) {
    throw new Error('Missing env variable for Mongo DB name');
}

let db_name = process.env.DB_NAME_MONGO;
let db_user_name = process.env.DB_USER_NAME;
let db_password = process.env.DB_PASSWORD;

mongoose.connect(`mongodb://${db_user_name}:${db_password}@localhost:27017/${db_name}`, { useNewUrlParser: true }).then(function (result) {
    Logger.logError("Connection to Mongo DB established");
    MongoDBConnected = true;
    init();
}, function (err) {
    throw new Error('Error connecting to Mongo DB ' + err);
});

/**
 * Registers when MySQL connection
 */
pub.mySQLConnected = function () {
    mySQLConnected = true;
    init();
}

productSchema.plugin(mongoosastic, { index: INDEX_NAME, type: TYPE_NAME });

pub.suggestSearch = async function (suggest, inLimit, cb) {
    MDB.models['liquor-station'].esSearch({
        "suggest": {
            "left_suggest": {
                "prefix": suggest,
                "completion": {
                    "field": "brandname",
                    "skip_duplicates": true,
                    "size": 5,
                    "fuzzy": {
                        "fuzziness": 1,
                    }
                }
            }, "right_suggest": {
                "prefix": suggest,
                "completion": {
                    "field": "namebrand",
                    "skip_duplicates": true,
                    "size": 5,
                    "fuzzy": {
                        "fuzziness": 1,
                    }
                }
            },
        }
    }, async function (err, results) {
        if (err) {
            return console.log(JSON.stringify(err, null, 4));
        }
        let brandname = results.suggest.left_suggest[0].options;
        let namebrand = results.suggest.right_suggest[0].options;
        let mergedArray = brandname.concat(namebrand);
        let result = [];
        let limit = Math.min(inLimit, mergedArray.length);

        for (let i = 0; i < limit; i++) {
            let product = mergedArray[i]._source;
            product._id = mergedArray[i]._id;
            delete product.details;
            delete product.variance;
            result.push(product);
        }

        cb(result || false);
    });
}

pub.globalSearch = async function (inText, cb) {
    let finalResult = [];
    let searchedFields = new Map();

    MDB.models['liquor-station'].search({
        "bool": {
            "must": {
                "query_string": {
                    "query": inText
                }
            },
            "filter": {
                "term": {
                    "visible": 1
                }
            }
        }
    }, function (err, result) {
        if (!err && result && result.hits && result.hits.hits) {
            finalResult.push({
                "results": result.hits.hits,
                "highlight": undefined,
                "score": undefined
            });
            cb(finalResult);
        } else if (err) {
            Logger.logError(err);
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
                            "field": "subcategory.value", "highlight": {
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
                return Logger.logError(JSON.stringify(err, null, 4));

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
                            "bool": {
                                "must": {
                                    "query_string": {
                                        "query": suggestResults[key].text
                                    }
                                },
                                "filter": {
                                    "term": {
                                        "visible": 1
                                    }
                                }
                            }
                        }, function (err, result) {
                            if (!err && result && result.hits && result.hits.hits) {
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
                            } else {

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
            let product = await MDB.models[selectedStore.name].findById(searchId).where({ visible: 1 }).exec();
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
                pub.models[storeTypeName].createMapping(function (err, mapping) {
                    if (err) {
                        Logger.logError('Error creating mapping (you can safely ignore this)');
                    } else {
                        Logger.log.debug(`Mapping created for ${storeTypeName} and mapping is ${JSON.stringify(mapping)}`);
                    }
                    synchronizeModel(pub.models[storeTypeName], storeTypeName);
                });
            }
        }

        Logger.logError('Initialized store models with Mongo DB');
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
    Logger.logError('All Mongo DB documents have been sync-ed');
    return true;
}

module.exports = pub;