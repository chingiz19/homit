/**
 * Welcome to homit batch product uploader. 
 * Make sure you have this store_type in store types table 
 * Please, edit the following constants before starting batch upload
 */

/*** Adjust following constants as per your need ***/
const COLLECTION_NAME = "foreverbee";
const WORKBOOK_LOCATION = "./foreverbee.xlsx";
const IMAGE_EXTENSION = ".jpeg";
const DEFAULT_COUNTRY_OF_ORIGIN = "Canada";
const SAVE_JSON_TO_DIRECTORY = "./project_setup/resources/mongodb";
/*** End of editing ***/

let pub = {};
let expectedNumberOfProducts = 0;
let productSchema = require('./product-schema');
let mongoose = require('mongoose');
let fs = require('fs');
let XLSX = require('xlsx');
let currentModel = mongoose.model(COLLECTION_NAME, productSchema, COLLECTION_NAME);
let format = [
    { cell: 'A1', value: "Brand" },
    { cell: 'B1', value: "Name" },
    { cell: 'C1', value: "Ingredients" },
    { cell: 'D1', value: "Category" },
    { cell: 'E1', value: "Type" },
    { cell: 'F1', value: "Container" },
    { cell: 'G1', value: "Size" },
    { cell: 'H1', value: "Size units" },
    { cell: 'I1', value: "Pack" },
    { cell: 'J1', value: "Price" },
    { cell: 'K1', value: "Country" },
    { cell: 'L1', value: "Serving Suggestions/Directions" },
    { cell: 'M1', value: "Description" },
];

pub.startOperation = async function () {
    let arrayOfNewProducts = await extractFromXLSX();

    if (arrayOfNewProducts && arrayOfNewProducts.length > 0) {
        currentModel.create(arrayOfNewProducts, function (err, returnedArray) {
            if (err) {
                console.log(`Error uploading products, error --> ${err}`);
            } else {
                fs.writeFileSync(`${SAVE_JSON_TO_DIRECTORY}/mongoDB_${COLLECTION_NAME}.json`, arrayOfNewProducts.toString(), 'utf8', function (err) {
                    if (err) {
                        return console.log(`Error while saving a file to ${SAVE_JSON_TO_DIRECTORY}/mongoDB_${COLLECTION_NAME}.json}`);
                    }
                });
                currentModel.countDocuments({}, function (err, count) {
                    if (err) {
                        console.log(`Finished uploading products to ${COLLECTION_NAME} collection, but had error getting count of documents. Expected number of products ${expectedNumberOfProducts} `);
                    } else {
                        console.log(`Finished uploading products to ${COLLECTION_NAME} collection. Expected number of products ${expectedNumberOfProducts}. Actually uploaded ${count}.`);
                    }
                });
            }
        });
    } else {
        console.log(`Error retrieving from excel sheet, please check everything and try again.`);
    }
}

async function extractFromXLSX() {
    let storeInfo = await Catalog.getStoreTypeInfo(COLLECTION_NAME);

    if (storeInfo) {
        let localArray = [];
        let storeObject = storeObjectMaker(storeInfo);
        let workbook = XLSX.readFile(WORKBOOK_LOCATION);
        let sheetName = workbook.SheetNames[0];
        let sheet = workbook.Sheets[sheetName];
        confirmFormatting(sheet);
        expectedNumberOfProducts = getExpectedNumberOfProducts(sheet["!ref"]);

        let mainIdCounter = 1;

        for (let row = 2; row < expectedNumberOfProducts + 2; row++) {
            let selBrand = retrieveFromSheet("A", row, sheet);
            let selName = retrieveFromSheet("B", row, sheet);
            let container = retrieveFromSheet("F", row, sheet);
            let size = retrieveFromSheet("G", row, sheet);
            let sizeUnit = retrieveFromSheet("H", row, sheet);
            let varianceObject = [];
            let storeId = storeInfo.id;
            let varianceIdCounter = 1;
            let mainId = storeId + "-" + mainIdCounter;

            let detailsObject = {
                ingredients: { display_name: "Ingredients", description: formatDescription(retrieveFromSheet("c", row, sheet)) },
                serving_suggestions: { display_name: "Serving Suggestions", description: formatDescription(retrieveFromSheet("L", row, sheet)) },
                preview: { display_name: "Preview", description: formatDescription(retrieveFromSheet("M", row, sheet)) },
                country_of_origin: { display_name: "Country of Origin", description: (retrieveFromSheet("K", row, sheet, DEFAULT_COUNTRY_OF_ORIGIN)) },
            };

            while (retrieveFromSheet("B", row, sheet) == selName && retrieveFromSheet("A", row, sheet) == selBrand) {
                let packIdCounter = 1;
                let varianceId = mainId + "-" + varianceIdCounter;
                let variance = varianceObjectMaker(row, sheet, varianceId);

                while (size == retrieveFromSheet("G", row, sheet) && sizeUnit == retrieveFromSheet("H", row, sheet)) {
                    let packId = varianceId + "-" + packIdCounter;
                    variance.packs = packObjectMaker(row, sheet, packId, 1);

                    if (retrieveFromSheet("B", row+1, sheet) == selName && retrieveFromSheet("A", row+1, sheet) == selBrand && (size == retrieveFromSheet("G", row + 1, sheet) && sizeUnit == retrieveFromSheet("H", row + 1, sheet))) {
                        row++;
                    } else {
                        break;
                    }

                    packIdCounter++;
                }

                varianceObject.push(variance);
                varianceIdCounter++;
                
                if (retrieveFromSheet("B", row + 1, sheet) == selName && retrieveFromSheet("A", row + 1, sheet) == selBrand) {
                    row++;
                } else {
                    break;
                }
            }

            localArray.push({
                _id: mainId,
                brand: selBrand,
                brandname: selBrand + " " + selName,
                name: selName,
                namebrand: selName + " " + selBrand,
                container: container,
                tax: 1,
                images: imageObjectBuilder(container, storeId),
                tags: [],
                category: categoryObjectBuilder(retrieveFromSheet("D", row, sheet), storeId),
                subcategory: retrieveFromSheet("E", row, sheet),
                details: detailsObject,
                variance: varianceObject,
                store: storeObject
            });

            mainIdCounter++;
        }

        return localArray;
    } else {
        console.log(`Error fetching store data, did you create store_type in database table?`);
    }
};

function varianceObjectMaker(inRow, inSheet, inVarianceId) {
    return {
        _id: inVarianceId,
        si_unit_size: "",
        si_unit: "",
        preffered_unit: retrieveFromSheet("G", inRow, inSheet),
        preffered_unit_size: retrieveFromSheet("H", inRow, inSheet),
    }
}

function packObjectMaker(inRow, inSheet, inPackId) {
    return {
        _id: inPackId,
        h_value: retrieveFromSheet("I", inRow, inSheet),
        price: retrieveFromSheet("J", inRow, inSheet),
        available: 1,
        stock_quantity: 100,
        sold: { quantity: 0 }
    }
}

function storeObjectMaker(inData) {
    return {
        name: inData.name,
        display_name: inData.display_name,
        image_url: inData.image
    }
}

function retrieveFromSheet(column, row, sheet, defaultValue) {
    if (sheet.hasOwnProperty(column + row)) {
        return sheet[(column + row)].v
    }

    return defaultValue || "";
}

function categoryObjectBuilder(name, storeId) {
    let formatted = escapeCategoryName(name);
    let imageUrl = storeId + "_" + formatted + "." + IMAGE_EXTENSION;

    return {
        category_display_name: name,
        category_name: formatted,
        category_image: imageUrl,
        category_cover: imageUrl
    };
}

function imageObjectBuilder(inContainer, storeId) {
    let mainImage = inContainer.substring(0, 1) + "_" + storeId + "." + IMAGE_EXTENSION;

    return {
        image_catalog: mainImage,
        images_all: mainImage
    };
}

function escapeCategoryName(inName) {
    let split = inName.split(" ");

    if (split.length > 1) {
        let localString = "";

        for (let i in split) {
            let endAddition = (i != split.length - 1) ? "-" : "";

            if (split[i] !== "&") {
                localString += split[i] + endAddition;
            } else {
                localString += "and" + endAddition;
            }
        }

        return localString;
    } else {
        return inName;
    }
}

function formatDescription(inText) {
    if (inText === "") {
        return inText;
    }
    return "ht_ulht_li" + inText + "d_ht_lid_ht_ul";
}

function getExpectedNumberOfProducts(inData) {
    return inData.split(':')[1].substring(1) - 1;
}

function confirmFormatting(inSheet) {
    for (let i in format) {
        if (inSheet[format[i].cell].v.trim() != format[i].value) {
            throw new Error('Submitted Excel sheet is not the right format, please verify and try again.');
        }
    }
}

function unitConverter(product_variant) {
    let unit_list = {
        "kg": {
            "g": 1000,
            "lb": 2.20462
        },
        "m3": {
            "oz": 33814,
            "ml": 1000000,
            "L": 1000
        },
        "m": {
            "in": 39.3701,
            "ft": 3.28084,
            "cm": 100
        }
    };

    return (Math.round(product_variant.size * unit_list[product_variant.unit][product_variant.preffered_unit]));

};

module.exports = pub;