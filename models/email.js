/**
 * @copyright Homit 2018
 */

var pdf = require('html-pdf');
var pub = {};
var path = require("path");
var ejs = require("ejs");
const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
const NeverBounce = require('neverbounce');
const MESSAGE_IF_STORE_NA = "Sorry, address is not available, contact us for more details";
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const NEVERBOUNCE_SECRET_KEY = process.env.NEVERBOUNCE_SECRET_KEY;

verifyEnvVariables();

/* Initialize NeverBounce client */
const NeverBounceClient = new NeverBounce({ apiKey: NEVERBOUNCE_SECRET_KEY });

/* Create reusable transporter object for orders */
let orderTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.ORDER_EMAIL_USER,
        pass: process.env.ORDER_EMAIL_PASS
    }
});

/* Create reusable transporter object for no-reply */
let noReplyTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.NOREPLY_EMAIL_USER,
        pass: process.env.NOREPLY_EMAIL_PASS
    }
});


/* Send order emails using order transporter object.
 * <orders@homit.ca> account 
 * Includes cancelled, refunded and modified orders. 
*/
function sendEmailViaOrders(mailOptions) {
    return orderTransporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            let metaData = {
                directory: __filename,
                error_message: error.message,
            }
            Logger.log.error("Could not send an ORDER email with " + error.message + "ID.", metaData)
            return false;
        } else {
            Logger.log.debug('ORDER email was sent! ', metaData);
            return true;
        }
    });
}

/* Send reset password emails using no-reply transporter object. 
 * <no-reply@homit.ca> account 
 * Includes cancelled, refunded and modified orders. 
*/
function sendEmailViaNoReply(mailOptions) {
    return new Promise(function (resolve, reject) {
        noReplyTransporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                let metaData = {
                    directory: __filename,
                    error_message: error.message,
                }
                Logger.log.error("Could not send an email via no reply error message " + error + "ID.", metaData)
                return reject(false);
            } else {
                Logger.log.debug('Email was sent via no-reply with ' + info.messageId + "ID.");
                return resolve(true);
            }
        });
    });
}

pub.sendOrderSlip = async function (orderInfo, prices) {
    let priceObject = await getTotalPriceForProducts(prices);
    let html = getEmailHtml(orderInfo.customer, priceObject);

    prepareOrderSlip(orderInfo, priceObject, function (pdfFileFath) {
        let fromValue = "Homit Orders <" + process.env.ORDER_EMAIL_USER + ">";
        let mailOptions = {
            from: fromValue,
            to: orderInfo.customer.email,
            subject: orderInfo.customer.first_name + '\'s order',
            html: html,
            attachments: [
                {
                    filename: 'Delivery Slip.pdf',
                    path: pdfFileFath
                },
            ]
        };
        sendEmailViaOrders(mailOptions);
    });
};


/* Prepare mail options and send notification email to customer, respectively */
pub.sendStoreAssignedEmail = function (orderInfo) {                                            //change this
    let html = getStoreAssingdedEmailHtml(orderInfo);
    let fromValue = "Homit Orders <" + process.env.ORDER_EMAIL_USER + ">";
    let mailOptions = {
        from: fromValue,
        to: orderInfo.user_email,
        subject: orderInfo.user_name + '\'s order',
        html: html,
    };
    sendEmailViaOrders(mailOptions);
};

pub.sendResetPasswordEmail = async function (orderInfo) {
    var html = getResetPasswordHTML(orderInfo.resetLink);
    var fromValue = "Do not reply <" + process.env.NOREPLY_EMAIL_USER + ">";
    let mailOptions = {
        from: fromValue,
        to: orderInfo.customer_email,
        subject: "Reset password",
        html: html,
    };
    return await sendEmailViaNoReply(mailOptions);
}

pub.sendAccountVerificationEmail = async function (name, email, link) {
    let html = getAccountVerificationEmailHtml(name, link);
    let fromValue = "noreply <" + process.env.NOREPLY_EMAIL_USER + ">";
    let mailOptions = {
        from: fromValue,
        to: email,
        subject: "Homit Account Verification",
        html: html,
    };
    return await sendEmailViaNoReply(mailOptions);
}

/**
 * Subscribes to Guest users list 
 * @param {*} email customer email
 * @param {*} fname first name should be accompanied by last name
 * @param {*} lname last name should be accompanied by first name
 */
pub.subscribeToGuestUsers = async function (email, fname, lname) {
    if (email) {
        let GUEST_USERS_LIST = process.env.GUEST_USERS_LIST;
        let JsonRequest = {
            "email_address": email,
            "status": "subscribed"
        };

        if (fname && lname) {
            JsonRequest.merge_fields = {
                "FNAME": fname,
                "LNAME": lname,
                "ADDRESS": "",
                "PHONE": ""
            }
        }

        return axios.post('https://us18.api.mailchimp.com/3.0/lists/' + GUEST_USERS_LIST + '/members', JsonRequest, {
            headers: { 'Authorization': 'apikey ' + MAILCHIMP_API_KEY }
        })
            .then(response => {
                if (response.data.status == "subscribed") {
                    Logger.log.info("Successfully subscribed " + response.data.email_address + " to Guest users list");
                    subscribeToAllUsers(email, fname, lname);
                    return true;
                }
            })
            .catch(error => {
                console.log(error.response.data.title);
                var metaData = {
                    directory: __filename,
                    error_message: error.response.data.title,
                }
                Logger.log.error("Error happened while subscribing member to Guest users list" + metaData);
                return false;
            });
    } else {
        return false;
    }
}

/**
 * Subscribes to Signed Up users list 
 * NOTE: Signed up users are also part of All users list
 * @param {*} email customer email
 * @param {*} fname first name should be accompanied by last name
 * @param {*} lname last name should be accompanied by first name
 */
pub.subscribeToSignedUsers = async function (email, fname, lname) {
    if (email) {
        let SIGNED_USERS_LIST = process.env.SIGNED_USERS_LIST;
        let JsonRequest = {
            "email_address": email,
            "status": "subscribed"
        };

        if (fname && lname) {
            JsonRequest.merge_fields = {
                "FNAME": fname,
                "LNAME": lname,
                "ADDRESS": "",
                "PHONE": ""
            }
        }

        axios.post('https://us18.api.mailchimp.com/3.0/lists/' + SIGNED_USERS_LIST + '/members', JsonRequest, {
            headers: { 'Authorization': 'apikey ' + MAILCHIMP_API_KEY }
        })
            .then(response => {
                if (response.data.status == "subscribed") {
                    Logger.log.info("Successfully subscribed " + response.data.email_address + " to Signed users list");
                    subscribeToAllUsers(email, fname, lname);
                }
            })
            .catch(error => {
                console.log(error.response.data.title);
                let metaData = {
                    directory: __filename,
                    error_message: error.response.data.title,
                }
                Logger.log.error("Error happened while subscribing member to Signed users list" + metaData);
            });
    } else {
        return false;
    }
}

/**
 * Validates user email using NeverBounce API service
 * @param {*} email 
 */
pub.validateUserEmail = function (email) {
    return NeverBounceClient.single.check(email).then(
        result => {
            return (result.getResult() == "valid" || result.getResult() == "catchall");
        },
        err => {
            let metaData = {
                directory: __filename,
                source: "Neverbounde Error Response"
            }
            switch (err.type) {
                case NeverBounce.errors.AuthError:
                    Logger.log.error("The API credentials used are bad, have you reset them recently?" + metaData);
                    break;
                case NeverBounce.errors.BadReferrerError:
                    Logger.log.error("The script is being used from an unauthorized source" + metaData);
                    break;
                case NeverBounce.errors.ThrottleError:
                    Logger.log.error("Too many requests in a short amount of time, try again shortly or adjust your rate limit settings for this application in the dashboard" + metaData);
                    break;
                case NeverBounce.errors.GeneralError:
                    Logger.log.error("A non recoverable API error occurred check the message for details" + metaData);
                    break;
                default:
                    Logger.log.error("Other non specific errors while verifying email" + metaData);
                    break;
            }
            return false;
        }
    );
}

/**
 * Subscribes email to All users list at Mail Chimp
 * @param {*} email customer email
 * @param {*} fname first name should be accompanied by last name
 * @param {*} lname last name should be accompanied by first name
 */
async function subscribeToAllUsers(email, fname, lname) {
    if (email) {
        let ALL_USERS_LIST = process.env.ALL_USERS_LIST
        let JsonRequest = {
            "email_address": email,
            "status": "subscribed"
        };

        if (fname && lname) {
            JsonRequest.merge_fields = {
                "FNAME": fname,
                "LNAME": lname,
                "ADDRESS": "",
                "PHONE": ""
            }
        }

        axios.post('https://us18.api.mailchimp.com/3.0/lists/' + ALL_USERS_LIST + '/members', JsonRequest, {
            headers: { 'Authorization': 'apikey ' + MAILCHIMP_API_KEY }
        })
            .then(response => {
                if (response.data.status == "subscribed") {
                    Logger.log.info("Successfully subscribed " + response.data.email_address + " to All users list");
                }
            })
            .catch(error => {
                console.log(error.response.data.title);
                var metaData = {
                    directory: __filename,
                    error_message: error.response.data.title,
                }
                Logger.log.error("Error happened while subscribing member to All users list" + metaData);
            });
    } else {
        return false;
    }
}

/** Follwings are <html> retrievers.
 *  For more editing options please refer to https://www.npmjs.com/package/cheerio 
*/

function getEmailHtml(orderInfo, priceObject) {
    let htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email_htmls/order.html", "utf8");
    const $ = cheerio.load(htmlSource);


    $('#credit_card').text("**** **** **** " + filterInputField(orderInfo.card_digit, "****"));
    $('#user_greeting').text("Hello, " + filterInputField(orderInfo.first_name, "Dear Customer"));
    $('#total_amount').text(filterInputField(priceObject.totalAmount));
    $('#gst').text(filterInputField(priceObject.totalTax));
    $('#total_price').text(filterInputField(priceObject.totalPrice));
    $('#delivery_fee').text(filterInputField(priceObject.deliveryFee));

    return $.html();
};

var getAccountVerificationEmailHtml = function (name, link) {
    let file = fs.readFileSync(path.join(process.cwd(), "/project_setup/resources/email_htmls/verifyEmail.ejs"), "utf8");
    return ejs.render(file, {
        userName: filterInputField(name, "Dear Customer"),
        "link": filterInputField(link)
    });
};

var getStoreAssingdedEmailHtml = function (orderInfo) {
    let htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email_htmls/storeNotification.html", "utf8");
    let orderNumber = orderInfo.order_id;
    const $ = cheerio.load(htmlSource);

    $('#user_name').text(filterInputField(orderInfo.user_name, "Dear Customer"));
    $('#order_id').text(filterInputField("(#" + orderNumber + ")", "Order with liquor"));
    $('#store_name').text(filterInputField(orderInfo.store_name, "Solo Liquor"));
    $('#store_address').text(filterInputField(orderInfo.store_address, MESSAGE_IF_STORE_NA));

    return $.html();
};

var getResetPasswordHTML = function (link) {
    let file = fs.readFileSync(path.join(process.cwd(), "/project_setup/resources/email_htmls/resetpassword.ejs"), "utf8");
    return ejs.render(file, {
        resetLink: link
    });
}

/* Edit html for .pdf Order Slip that is attached to main e-mail */
function getOrderSlipHtml(OI, priceObject) {
    let slipEjsSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email_htmls/orderSlip.ejs", "utf8");
    let orders = OI.orders;
    let html_email = "";
    let general_coupon_html = "";

    let ejsOptions = {
        customer_name: filterInputField(OI.customer.first_name + " " + OI.customer.last_name, "Customer name"),
        customer_address: filterInputField(OI.customer.address, "Customer address"),
        phone_number: formatPhoneNumber(OI.customer.phone, "Customer phone number")
    };

    if (priceObject.couponsUsed.length != 0 && priceObject.couponsUsed[0].privacy_type) {
        general_coupon_html = `<tr class='customer-details-table-tr'>
        <td class='customer-details-table-td-hdr'>General coupons:</td>
        <td id='customer_phone' class='customer-details-table-td-cnt'>` + filterInputField(OI.customer.generalCouponInvoiceMessage, "No coupons used") + `</td></tr>`;
    }

    for (sub_order in orders) {
        html_email +=
            "<div class='order-id'>Order ID:" + filterInputField(orders[sub_order].id) + "</div>" +
            "<table class='orders-details-table'>" +
            "<tr class='orders-details-table-tr'>" +
            "<td class='orders-details-table-td-hdr'>Store:</td>" +
            "<td class='orders-details-table-td-input'>" + filterInputField(orders[sub_order].store_type_display_name) + "</td>" +
            "</tr>" +
            "<tr class='orders-details-table-tr'>" +
            "<td class='orders-details-table-td-hdr'>Delivery Option:</td>" +
            "<td class='orders-details-table-td-input'>" + filterInputField(createDeliveryOptionsText(orders[sub_order].scheduledTime)) + "</td>" +
            "</tr>" +
            "<tr class='orders-details-table-tr'>" +
            "<td class='orders-details-table-td-hdr'>Store coupons:</td>" +
            "<td class='orders-details-table-td-input'>" + filterInputField(orders[sub_order].couponInvoiceMessage, "No coupons used") + "</td>" +               
            "</tr>" +
            "</table>"
            ;
    }

    html_email += "<div class='order-content-sep'>ORDER CONTENT</div>";

    for (sub_order in orders) {
        html_email +=
            "<div class='order-id'>Order ID:" + filterInputField(orders[sub_order].id) + "</div>" +
            "<table class='order-content-table'>" +
            "<tr class='order-content-table-tr'>" +
            "<td class='order-content-table-hdr-tr-1'>Description</td>" +
            "<td class='order-content-table-hdr-tr-2-3'>Quantity</td>" +
            "<td class='order-content-table-hdr-tr-2-3'>Price</td>" +
            "</tr>"
            ;
        for (let k = 0; k < orders[sub_order].products.length; k++) {
            let product = orders[sub_order].products[k];
            let Description = filterInputField(product.brand) + " " + filterInputField(product.name) + " " + filterInputField(product.volume) + " " + " x" + filterInputField(product.packaging);
            let Quantity = product.quantity;
            let Price = product.price;
            html_email +=
                "<tr>" +
                "<td class='order-cnt-table-cnt-tr-1'>" + filterInputField(Description) + "</td>" +
                "<td class='order-cnt-table-cnt-tr-2-3'>" + filterInputField(Quantity) + "</td>" +
                "<td class='order-cnt-table-cnt-tr-2-3'>C$" + filterInputField(Price) + "</td>" +
                "</tr>"
                ;
        }
        html_email += "</table>";
    }

    let couponSavedAmount = "";

    if (priceObject.couponsUsed.length != 0) {
        couponSavedAmount = "<tr class='order-totals-rable-tr' style='color: #da1a36;'>" +
            "<td class='order-totals-rable-tr-hdr'>You Saved</td>" +
            "<td class='order-totals-rable-tr-num'>" + filterInputField(priceObject.savedAmount) + "</td>" +
            "</tr>";
    }

    html_email += "<table class='order-totals-rable'>" +
        "<tr class='order-totals-rable-tr'>" +
        "<td class='order-totals-rable-tr-hdr'>Cart Total</td>" +
        "<td class='order-totals-rable-tr-num'>" + filterInputField(priceObject.totalAmount) + "</td>" +
        "</tr>" +
        "<tr class='order-totals-rable-tr'>" +
        "<td class='order-totals-rable-tr-hdr'>Delivery Charge</td>" +
        "<td class='order-totals-rable-tr-num'>" + filterInputField(priceObject.deliveryFee) + "</td>" +
        "</tr>" +
        "<tr class='order-totals-rable-tr'>" +
        "<td class='order-totals-rable-tr-hdr'>GST</td>" +
        "<td class='order-totals-rable-tr-num'>" + filterInputField(priceObject.totalTax) + "</td>" +
        "</tr>"
        +
        couponSavedAmount
        +
        "<tr class='order-totals-rable-tr'>" +
        "<td class='order-totals-rable-tr-hdr'>TOTAL</td>" +
        "<td class='order-totals-rable-tr-num'>" + filterInputField(priceObject.totalPrice) + "</td>" +
        "</tr>" +
        "</table>";

    ejsOptions["html_email"] = html_email;
    ejsOptions["general_coupon_html"] = general_coupon_html;

    return ejs.render(slipEjsSource, ejsOptions);
};

/* Creating .pdf from given <html> */
function prepareOrderSlip(orderInfo, priceObject, callback) {
    let orderSlipDir = process.env.ORDER_SLIPS_DIR;
    let orderNumber = Object.values(orderInfo.orders)[0].id;
    let pdfFileFath = orderSlipDir + "order-slip_" + orderNumber + ".pdf";
    let orderSlipHtml = getOrderSlipHtml(orderInfo, priceObject);

    //For more editing options please refer to https://www.npmjs.com/package/html-pdf
    let options = {
        width: '595px',
        format: 'Letter'
    };

    pdf.create(orderSlipHtml, options).toFile(pdfFileFath, function (err, res) {
        if (err) {
            let metaData = {
                directory: __filename,
                error_message: err.message,
            }
            return Logger.log.error("Error happened while creating .pdf file for Order Slip" + metaData);
        } else {
            callback(pdfFileFath);
        }
    });
};

/**
 * Prepare received products array for catalog price calculator. 
 * @param {*Array} products - Products recieved after dispatch [array of product objecs] 
 */
async function getTotalPriceForProducts(price) {
    let priceObject = {};

    priceObject.deliveryFee = (price.delivery_fee == 0 ? "FREE" : "C$ " + parseFloat(Math.round(price.delivery_fee * 100) / 100).toFixed(2));
    priceObject.totalTax = "C$ " + parseFloat(Math.round(price.total_tax * 100) / 100).toFixed(2);
    priceObject.totalAmount = "C$ " + parseFloat(Math.round(price.cart_amount * 100) / 100).toFixed(2);
    priceObject.totalPrice = "C$ " + parseFloat(Math.round(price.total_price * 100) / 100).toFixed(2);
    priceObject.savedAmount = "C$ -" + parseFloat(Math.round(price.total_coupon_off * 100) / 100).toFixed(2);
    priceObject.couponsUsed = price.coupons_used;

    return priceObject;
};

/* Helpers functions for time formatting */
function createDeliveryOptionsText(time) {
    let ASAP_WORDING = "ASAP, Placed: ";
    let SCHEDULED_WORDING = "Scheduled: ";
    if (time == 0) {
        return ASAP_WORDING + createTimeText(new Date());
    } else {
        return SCHEDULED_WORDING + createTimeText(new Date(time), new Date(time + 15 * 60 * 1000)); //show 15 minute range for scheduled orders
    }
}

function createTimeText(date, range) {
    var array = date.toString().split(" ");
    var text = array[0] + " " + array[1] + " " + array[2] + "," + array[3] + " @ " + formatTime(array[4]);

    if (range) {
        text += " - " + formatTime(range.toString().split(" ")[4]);
    }
    return text;
}

function formatTime(time) {
    let splitArray = time.split(":");
    let hours = parseInt(splitArray[0]);
    let hourTag = "pm";
    if (hours < 12) {
        hourTag = "am";
    }
    hours = hours % 12;
    return ((hours == 0) ? 12 : hours) + ":" + splitArray[1] + hourTag;
}

function filterInputField(data, substitute) {
    if (data) {
        return data;
    } else {
        if (substitute) {
            return substitute;
        } else {
            return "";
        }
    }
}

/**
 * Helper function to format phone number
 * @param {phone} number received raw phone number
 * @param {*text} substitute should not be undefined
 */
function formatPhoneNumber(number, substitute) {
    if (number) {
        let array = number.toString().split("");
        if (array.length == 10) {
            return "(" + array[0] + array[1] + array[2] + ") " + array[3] + array[4] + array[5] +
                "-" + array[6] + array[7] + array[8] + array[9];
        } else {
            return number;
        }
    } else {
        return substitute;
    }
}

/**
 * Throws error if MAILCHIMP or NEVERBOUNCE keys don't exist in env file
 */
function verifyEnvVariables() {
    if (!MAILCHIMP_API_KEY && !NEVERBOUNCE_SECRET_KEY) {
        throw Error('MAILCHIMP_API_KEY and/or NEVERBOUNCE_SECRET_KEY are absent');
    }
}

module.exports = pub;
