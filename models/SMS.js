/**
 * @copyright Homit 2018
 */

/* Getting Twilio Credentials */
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const twillioNumber = process.env.TWILIO_NUMBER;   //this number owned by Homit 
var directors = [];

/*Building metadata for log*/
var logMeta = {
    directory: __filename
}

//TODO: move this out
const Shabnam = '+14039261177';
const Elnar = '+14033977020';
const Chingiz = '+14039262501';
const Jeyhun = '+14039185792';
const Zaman = '+14034733973';

directors.push(Shabnam);
directors.push(Elnar);
directors.push(Chingiz);
directors.push(Jeyhun);
directors.push(Zaman);

const client = require('twilio')(accountSid, authToken);
var pub = {};

/**
 * Sends regular sms notifying customer about driver's arrival
 * @param {*String} number -in <+1**********> format
 * @param {*String} name 
 */
pub.notifyDriverArrival = function (number, name) { 
    client.messages
        .create({
            to: number,
            from: twillioNumber,
            body: 'Hey ' + name + ', your Homit delivery is minutes away!',
        })
        .then((message) => Logger.log.debug('Sent text message with ID: ' + message.sid), logMeta);;
}

/**
 * Sends waring message to all directors with message body.
 * @param {*String} message 
 */
pub.alertDirectors = function (message) {
    if (process.env.n_mode == "production") {
        for (director in directors) {
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

module.exports = pub;