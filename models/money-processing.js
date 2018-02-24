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

var statusApproved = "APPROVED";
var typePurchase = "PURCHASE";
var responseMessage = "APPROVED";
var cvvMatch = "M";
var avsResponses = ["D", "F", "M", "X", "Y"];

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


pub.isTransactionValid = function (transactiionId, amountRequired) {
    return true;
}

pub.validateTransaction = function (transactionDetails, amountRequired) {
    var transaction = transactionDetails.transactions.transaction[0];

    if (isTransactionPurchase(transaction)
        && isTransactionApproved(transaction)
        && isTransactionAmountCorrect(transaction, amountRequired)
        && isTransactionValidMode(transaction)
        && isTransactionCvvMatch(transaction)
        && isTransactionAvsValid(transaction)
        && isTransactionResponseApproved(transaction)
    ) {
        return true;
    } else {
        Logger.log.error("Transaction is not valid.", transactionDetails);
        return false;
    }
}

var isTransactionPurchase = function (transaction) {
    if (transaction.type[0].toUpperCase() == typePurchase) {
        return true;
    } else {
        Logger.log.error("Transaction type is wrong.", transaction.type[0].toUpperCase(), typePurchase);
        return false;
    }
}

var isTransactionApproved = function (transaction) {
    if (transaction.status[0].toUpperCase() == statusApproved) {
        return true;
    } else {
        Logger.log.error("Transaction status is wrong.", transaction.status[0].toUpperCase(), statusApproved);
        return false;
    }
}

var isTransactionAmountCorrect = function (transaction, amountRequired) {
    if (transaction.amount[0] >= amountRequired) {
        return true;
    } else {
        Logger.log.error("Transaction amount is wrong.", transaction.amount[0], amountRequired);
        return false;
    }

}

var isTransactionValidMode = function (transaction) {
    if (transaction.test[0] == process.env.HELCIM_TEST_MODE) {
        return true;
    } else {
        Logger.log.error("Transaction mode is wrong.", transaction.test[0], process.env.HELCIM_TEST_MODE);
        return false;
    }
}

var isTransactionResponseApproved = function (transaction) {
    if (transaction.responseMessage[0].toUpperCase().substring(0, 3) == responseMessage.substring(0, 3)) {
        return true;
    } else {
        Logger.log.error("Transaction response is wrong.", transaction.responseMessage[0].toUpperCase(), responseMessage);
        return false;
    }
}

var isTransactionCvvMatch = function (transaction) {
    if (transaction.cvvResponse[0].toUpperCase() == cvvMatch) {
        return true;
    } else {
        Logger.log.error("Transaction cvv is not matched.", transaction.cvvResponse[0].toUpperCase(), cvvMatch);
        return false;
    }
}

var isTransactionAvsValid = function (transaction) {
    var avsRes = transaction.avsResponse[0].toUpperCase();
    for (var i = 0; i < avsResponses.length; i++) {
        if (avsRes.toUpperCase() == avsResponses[i]) {
            return true;
        }
    }
    Logger.log.error("Transaction avs is not matched.", avsRes, avsResponses);
    return false;
}

pub.getUserCardLastDigits = function (transactionDetails) {
    return "1234";
    // var transaction = transactionDetails.transactions.transaction[0];
    // var cardNumber = transaction.card[0].cardNumber[0];
    // return cardNumber.substring(12, 16);
}

pub.getUserCardToken = function (transactionDetails) {
    var transaction = transactionDetails.transactions.transaction[0];
    return transaction.card[0].cardType[0];
}

pub.getUserCardType = function (transactionDetails) {
    var transaction = transactionDetails.transactions.transaction[0];
    return transaction.card[0].cardToken[0];
}

module.exports = pub;
