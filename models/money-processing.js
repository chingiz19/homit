/**
 * @copyright Homit 2018
 */

var stripe = require("stripe")(process.env.STRIPE_TOKEN_SECRET);
const currency = "cad";
const typeAuth = "approved_by_network";

var pub = {};
pub.declinedByNetwork = 'declined_by_network';

pub.chargeCard = function (cardToken, totalPrice) {
    var stripeAmount = parseInt(totalPrice * 100);
    return charge({
        amount: stripeAmount,
        currency: currency,
        source: cardToken,
    });
}

pub.chargeCustomer = function (custId, totalPrice) {
    var stripeAmount = parseInt(totalPrice * 100);
    return charge({
        amount: stripeAmount,
        currency: currency,
        customer: custId,
    });
}

pub.createCustomer = function (userEmail) {
    return new Promise(function (resolve, reject) {
        stripe.customers.create({
            description: "Account for: " + userEmail
        }, function (err, customer) {
            if (err) {
                return reject(false);
            } else {
                return resolve(customer.id);
            }
        });
    });
}

pub.updateCustomerPaymentMethod = async function(custId, token){
    return await new Promise(function (resolve, reject) {
        stripe.customers.update(custId, {
            source: token
        }, function (err, card) {
            if (err) {
                return reject(false);
            } else {
                return resolve(true);
            }
        });
    });
}

pub.getCustomerPaymentMethod = async function(custId){
    return await new Promise(function (resolve, reject) {
        stripe.customers.retrieve(custId, function (err, customer) {
            if (err) {
                return reject(false);
            } else {
                var card = {};
                try{
                    card.type = customer.sources.data[0].brand;
                    card.last4 = customer.sources.data[0].last4;
                    card.exp = customer.sources.data[0].exp_month + "/" + (customer.sources.data[0].exp_year % 100);
                } catch(err){
                    card = false;
                }
                return resolve(card);
            }
        });
    });
}



/**
 * Helper method to create charges to stripe
 * @param {*} stripe_obj - stripe.charges.create method's options
 */
function charge(stripe_obj){
    return new Promise(function (resolve, reject) {
        stripe.charges.create(stripe_obj, function (err, charge) {
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
