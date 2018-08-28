/**
 * This model is used to bulk create sitemaps when their link path changes
 * Call bulk creator function via editor console --> SITEMAP.startBulkOperation();
 */

let fs = require('fs');
let _ = require('lodash');
let date = new Date();
let LAST_MODIFIED = date.getFullYear() + "-" + zeroFill(date.getMonth(), 2) + "-" + zeroFill(date.getDay(), 2);
let RESULTS_DIRECTORY = './temp_results';
let CHANGE_FREQUENCY = 'monthly';
let pub = {};
let stores = [];
let count = 0;

// Insert necessary store files with according paths
stores.push(require("../project_setup/resources/mongodb/mongoDB_liquor-station.json"));
stores.push(require("../project_setup/resources/mongodb/mongoDB_borderland-food-co.json"));
stores.push(require("../project_setup/resources/mongodb/mongoDB_dwarf-stars.json"));
stores.push(require("../project_setup/resources/mongodb/mongoDB_honey-and-bloom.json"));
stores.push(require("../project_setup/resources/mongodb/mongoDB_linas-italian-market.json"));
stores.push(require("../project_setup/resources/mongodb/mongoDB_pure-foods-fresh.json"));
stores.push(require("../project_setup/resources/mongodb/mongoDB_snack-vendor.json"));
stores.push(require("../project_setup/resources/mongodb/mongoDB_westtaste.json"));

pub.startBulkOperation = async function () {

    if (!fs.existsSync(RESULTS_DIRECTORY)) {
        fs.mkdirSync(RESULTS_DIRECTORY);
    }

    let homitsitemapindex = 
`<?xml version="1.0" encoding="UTF-8"?>

<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

`;

    for (let i in stores) {
        let store = stores[i];
        let storeName = store[0].store.name;
        let sitemap =
`<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

`;

        homitsitemapindex += 
`<sitemap>
  <loc>https://homit.ca/sitemap/${storeName}.xml</loc>
  <lastmod>${LAST_MODIFIED}</lastmod>
</sitemap>

`;

        for (let k in store) {
            let product = store[k];
            if (product._id) {
                let path = "https://homit.ca/hub/product/" + product.store.name + "/" + _.toLower(clearProductUrl(_.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-"))) + "/" + product._id.split("-")[1];

                sitemap +=
`<url>
  <loc>${path}</loc>
  <changefreq>${CHANGE_FREQUENCY}</changefreq>
  <priority>0.8</priority>
</url>

`;

                count++;
            }
        }

        sitemap +=
`</urlset>`;

        fs.writeFileSync(`${RESULTS_DIRECTORY}/${storeName}.xml`, sitemap, 'utf8', function (err) {
            if (err) {
                return console.log('Error while saving a file, temp.js');
            }
        });
    }

    homitsitemapindex += 
`</sitemapindex>`;

    fs.writeFileSync(`${RESULTS_DIRECTORY}/homitsitemapindex.xml`, homitsitemapindex, 'utf8', function (err) {
        if (err) {
            return console.log('Error while saving a file, temp.js');
        }
    });

    console.log(`Temp.js finished work! Edited ${count} files`);
}

function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
}

function clearProductUrl(path) {
    let tempPath = path;
    tempPath = tempPath.replace(/[#&',.%/()]/g, "");
    tempPath = tempPath.replace(/---/g, "-");
    tempPath = tempPath.replace(/--/g, "-");
    return tempPath;
};

//Will further add create store and add product functionality

module.exports = pub;

