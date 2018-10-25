/**
 * Welcome to homit batch product uploader. 
 * Make sure you have this store_type in store types table 
 * After runnning debugger on console of debugger enter BatchUploader.startOperation()
 * Please, edit the following constants before starting batch upload
 */

/*** Adjust following constants as per your need ***/
const COLLECTION_NAME = "seasonal";
const WORKBOOK_LOCATION = "./seasonal.xlsx";
const IMAGE_EXTENSION = ".jpeg";
const DEFAULT_COUNTRY_OF_ORIGIN = "Canada";
const SAVE_JSON_TO_DIRECTORY = "./project_setup/resources/mongodb";
const UNWIND = true;
const START_ID = 1;
/*** End of editing ***/

let pub = {};
let expectedNumberOfProducts = 0;
let productSchema = require('./product_schema');
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
                fs.writeFileSync(`${SAVE_JSON_TO_DIRECTORY}/mongoDB_${COLLECTION_NAME}.json`, JSON.stringify(arrayOfNewProducts), 'utf8', function (err) {
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

        let mainIdCounter = START_ID || 1;

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
                ingredients: { display_name: "Ingredients", description: formatDescription(retrieveFromSheet("C", row, sheet)) },
                serving_suggestions: { display_name: "Serving Suggestions", description: formatDescription(retrieveFromSheet("L", row, sheet)) },
                preview: { display_name: "Preview", description: formatDescription(retrieveFromSheet("M", row, sheet)) },
                country_of_origin: { display_name: "Country of Origin", description: (retrieveFromSheet("K", row, sheet, DEFAULT_COUNTRY_OF_ORIGIN)) },
            };

            while (true) {
                let packIdCounter = 1;
                let varianceId = mainId + "-" + varianceIdCounter;
                let variance = varianceObjectMaker(row, sheet, varianceId);
                variance.packs = [];

                while (true) {
                    let packId = varianceId + "-" + packIdCounter;
                    variance.packs.push(packObjectMaker(row, sheet, packId, 1));

                    if (!UNWIND && retrieveFromSheet("B", row + 1, sheet) == selName && retrieveFromSheet("A", row + 1, sheet) == selBrand && retrieveFromSheet("F", row + 1, sheet) == container && (size == retrieveFromSheet("G", row + 1, sheet) && sizeUnit == retrieveFromSheet("H", row + 1, sheet))) {
                        row++;
                    } else {
                        break;
                    }

                    packIdCounter++;
                }

                varianceObject.push(variance);
                varianceIdCounter++;

                if (!UNWIND && retrieveFromSheet("B", row + 1, sheet) == selName && retrieveFromSheet("A", row + 1, sheet) == selBrand && retrieveFromSheet("F", row + 1, sheet) == container) {
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
                images: imageObjectBuilder(mainId),
                tags: [],
                category: categoryObjectBuilder(retrieveFromSheet("D", row, sheet), storeId),
                subcategory: { value: retrieveFromSheet("E", row, sheet), weight: 1.0 },
                details: detailsObject,
                variance: varianceObject,
                store: storeObject,
                visible: 1
            });

            mainIdCounter++;

        }

        return localArray;
    } else {
        console.log(`Error fetching store data, did you create store_type in database table?`);
    }
};

function varianceObjectMaker(inRow, inSheet, inVarianceId) {
    let unit = retrieveFromSheet("H", inRow, inSheet);
    let size = retrieveFromSheet("G", inRow, inSheet);
    let siUnits = fromSiUnitConverter(size, unit);

    return {
        _id: inVarianceId,
        si_unit_size: siUnits.value,
        si_unit: siUnits.unit,
        preffered_unit: unit,
        preffered_unit_size: size,
    }
}

function packObjectMaker(inRow, inSheet, inPackId) {
    return {
        _id: inPackId,
        h_value: retrieveFromSheet("I", inRow, inSheet),
        price: retrieveFromSheet("J", inRow, inSheet),
        visible: 1,
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
        let localValue = sheet[(column + row)].v;
        return isNaN(localValue) ? localValue.trim() : localValue;
    }

    return defaultValue || "";
}

function categoryObjectBuilder(name, storeId) {
    let formatted = escapeCategoryName(name);
    let imageUrl = storeId + "_" + formatted + IMAGE_EXTENSION;

    return {
        category_display_name: name,
        category_name: formatted,
        category_image: imageUrl,
        category_cover: imageUrl
    };
}

function imageObjectBuilder(inProductId) {
    let mainImage = inProductId + IMAGE_EXTENSION;

    return {
        image_catalog: mainImage,
        images_all: [mainImage]
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

        return localString.toLowerCase();
    } else {
        return inName.toLowerCase();
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

function fromSiUnitConverter(size, unit) {
    let inUnit = unit.trim();
    let inSize = isNaN(size) ? size.trim() : size;

    let unit_list = {
        "kg": { value: 1, unit: "kg" },
        "m3": { value: 1, unit: "m3" },
        "m": { value: 1, unit: "m" },
        "g": { value: 0.001, unit: "kg" },
        "lb": { value: 0.453592, unit: "kg" },
        "oz": { value: 0.0000295735, unit: "m3" },
        "ml": { value: 0.001, unit: "m3" },
        "L": { value: 0.01, unit: "m3" },
        "in": { value: 0.0254, unit: "m" },
        "ft": { value: 0.3048, unit: "m" },
        "cm": { value: 0.01, unit: "m" },
    };

    return {
        value: unit_list.hasOwnProperty(inUnit) ? (inSize * unit_list[inUnit].value) : "",
        unit: unit_list.hasOwnProperty(inUnit) ? unit_list[inUnit].unit : ""
    }
}

module.exports = pub;