/**
 * @copyright Homit 2017
 */


/* Twilio Credentials, trial values. 
   Shall be switched to real before production  */
const accountSid = 'ACd01af7b10b7ab88d15f35df2ec6b9f20';
const authToken = '7590685d91fcb4fff4a1b97b9cc37824';
const twillioNumber = '+15873176903';   //this number owned by Homit 
var directors = [];

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

//send regular sms notifying about driver's arrival
pub.arrivalNotification = function (number, name) { //require number in <+1**********> format and first_name as a name <String>

    client.messages
        .create({
            to: number,
            from: twillioNumber,
            body: 'Hey ' + name + ', your Homit delivery is minutes away!',
        })
        .then((message) => console.log(message.sid));
}


//send waring message to all directors with message body
pub.alertDirectors = function (message) { //require waring message body <String> format, it will be send to all directors automatically
    for (director in directors) {
        client.messages
            .create({
                to: director,
                from: twillioNumber,
                body: message,
            })
            .then((message) => console.log(message.sid));
    }
}

pub.notifyDriver = function (message, name, number, callback) { //require message, number and name of driver. All fields required in <String> 

    client.messages
        .create({
            to: number,
            from: twillioNumber,
            body: 'Hey ' + name + ', \n' + ' It is Homit dispatch! ' + message,
        })
        .then((message) => { callback(true) });
}


module.exports = pub;