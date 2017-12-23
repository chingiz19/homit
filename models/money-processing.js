/**
 * @copyright Homit 2017
 */

var parseString = require('xml2js').parseString;
var https = require("https");
var querystring = require('querystring');
var helcimAccountId = parseInt(process.env.HELCIM_ACCOUNT_ID, 10);
var helcimApiToken = process.env.HELCIM_API_TOKEN;
var helcimHost = "secure.myhelcim.com";
var helcimPath = "/api/";

var pub = {};

pub.getTransaction = function (transactionId, callback) {
    var post_data = querystring.stringify({
        action: "transactionView",
        accountId: helcimAccountId,
        apiToken: helcimApiToken,
        transactionId: transactionId
    });


    // An object of options to indicate where to post to
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

    // Set up the request
    var post_req = https.request(post_options, function (res) {
        // res.setEncoding('utf8');
        res.on('data', function (chunk) {
            parseString(chunk, function (err, result) {
                callback(result);
            });
        });
    });

    post_req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

};

module.exports = pub;
