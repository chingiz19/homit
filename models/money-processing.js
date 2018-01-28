/**
 * @copyright Homit 2018
 */

var parseString = require('xml2js').parseString;
var https = require("https");
var querystring = require('querystring');
var helcimAccountId = parseInt(process.env.HELCIM_ACCOUNT_ID, 10);
var helcimApiToken = process.env.HELCIM_API_TOKEN;
var helcimHost = "secure.myhelcim.com";
var helcimPath = "/api/";
var pub = {};

var statusApproved = "approved";
var typePurchase = "purchase";
var responseMessageApproved = "approved";

/**
 * Requesting from Helcim to view transcation 
 * and confirm it with data recieved from front-end 
 * @param {*Number} transactionId 
 * @param {*Function} callback 
 */
pub.getTransaction = function (transactionId, callback) {
    var post_data = querystring.stringify({
        action: "transactionView",
        accountId: helcimAccountId,
        apiToken: helcimApiToken,
        transactionId: transactionId
    });

    // Options object for post request
    var post_options = {
        host: helcimHost,
        port: '443',
        path: helcimPath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };

    // Creating request
    var post_req = https.request(post_options, function (res) {
        // res.setEncoding('utf8');
        res.on('data', function (chunk) {
            parseString(chunk, function (err, result) {
                callback(result);
            });
        });
    });

    post_req.on('error', (error) => {
        var logMeta = {
            directory: __filename,
            error_message: error.message
        }
        Logger.log.info(`Could not get 'transactionView' from helcim (POST)`, logMeta);
        callback('empty');
    });

    // Posting the data
    post_req.write(post_data);
    post_req.end();
};

pub.validateTransaction = function (transactionDetails, amountRequired) {
    var transaction = transactionDetails.transactions.transaction[0];
    if (transaction.amount[0] >= amountRequired
        && transaction.type[0].toLowerCase() == typePurchase
        && transaction.status[0].toLowerCase() == statusApproved
        && transaction.responseMessage[0].toLowerCase() == responseMessageApproved
        && transaction.test[0] == process.env.HELCIM_TEST_MODE) {
        return true;
    } else {
        Logger.log.error("Transaction is not valid.", transactionDetails);
        return false;
    }
};

module.exports = pub;
