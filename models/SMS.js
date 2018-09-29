/**
 * @copyright Homit 2018
 */

/* Getting Twilio Credentials */
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const twillioNumber = process.env.TWILIO_NUMBER;   //this number owned by Homit 
var directors = [];
const path = require('path');
var jsonfile = require('jsonfile');
var file = path.normalize('directors.json');
const client = require('twilio')(accountSid, authToken);
const DRIVER_ARRIVAL_TEXT_BODY = "Driver delivering your Homit order just arrived. Thank you for shopping via Homit ";
var pub = {};

/*Building metadata for log*/
var logMeta = {
    directory: __filename
}

jsonfile.readFile(file, function (err, obj) {
    if (err) {
        Logger.log.error("Could not read director.json file" + err.message, logMeta);
    } else if (obj) {
        for (key in obj){
            directors.push(obj[key]);
        }
    } else {
        Logger.log.error("Unknown issue happened during director.json read", logMeta);
    }
});

/**
 * Sends regular sms notifying customer about driver's arrival
 * @param {*String} number -in <+1**********> format
 * @param {*String} name 
 */
pub.notifyDriverArrival = function (number, name, orderIds) {
    if (process.env.n_mode == "production") {
    client.messages
        .create({
            to: number,
            from: twillioNumber,
            body: 'Hey ' + name + ', your Homit order ' + getInsertText(orderIds) + ' is minutes away!',
        })
        .then((message) => Logger.log.debug('Sent text message with ID: ' + message.sid), logMeta);
    }
}

/**
 * Sends waring message to all directors with message body.
 * @param {*String} message 
 */
pub.alertDirectors = function (message) {
    if (process.env.n_mode == "production") {
        for (director of directors) {
            client.messages
                .create({
                    to: director,
                    from: twillioNumber,
                    body: message,
                })
                .then((message) => Logger.log.debug('Alerted all directors, message ID: ' + message.sid), logMeta);
        }
    }
}

/**
 * Sends custom made text message to driver.
 * @param {*String} message  
 * @param {*String} name 
 * @param {*String} number -in <+1**********> format
 * @param {*String} callback 
 */
pub.notifyDriver = function (message, name, number, callback) {
    client.messages
        .create({
            to: number,
            from: twillioNumber,
            body: 'Hey ' + name + ', \n' + ' It is Homit dispatch! ' + message,
        })
        .then((message) => { callback(true) });
}

/**
 * Helper function to get text to insert into sms 
 * that is sent to customer upon driver arrival
 * @param {*Array} orderIds e.g. [55,65]  
 */
function getInsertText(orderIds) {
    let text = "(order id is unavalable)";

    if (orderIds && orderIds.length != 0) {
        text = "(";

        for (order in orderIds) {
            text += "#" + orderIds[order];
            if (parseInt(order) + 2 == orderIds.length) {
                text += " and ";
            } else if (parseInt(order) + 1 != orderIds.length) {
                text += ", ";
            }
        }

        text += ")";
    }

    return text;
}

module.exports = pub;