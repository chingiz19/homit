/**
 * @copyright Homit 2018
 */

var stripe = require("stripe")(process.env.STRIPE_TOKEN_SECRET);
const currency = "cad";
const typeAuth = "approved_by_network";

var pub = {};
pub.declinedByNetwork = 'declined_by_network';

pub.charge = function (cardToken, totalPrice) {
    var stripeAmount = parseInt(totalPrice * 100);
    return new Promise(function (resolve, reject) {
        stripe.charges.create({
            amount: stripeAmount,
            currency: currency,
            source: cardToken,
        }, function (err, charge) {
            if (err) return reject(err);
            else {
                if (charge.outcome.network_status != typeAuth) {
                    var error = {
                        type: pub.declinedByNetwork,
                        outcome: charge.outcome
                    };
                    return reject(error);
                } else {
                    return resolve(charge);
                }
            }
        });
    });
}

module.exports = pub;
