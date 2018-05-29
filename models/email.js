/**
 * @copyright Homit 2018
 */

var pdf = require('html-pdf');
var pub = {};
var priceObject = {};
var products = {};
var path = require("path");
var ejs = require("ejs");
const nodemailer = require('nodemailer');
const fs = require('fs');
const cheerio = require('cheerio')
const MESSAGE_IF_STORE_NA = "Sorry but address is not available, contact us for more details";

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
var sendEmailViaOrders = function (mailOptions) {
    return orderTransporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            var metaData = {
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
var sendEmailViaNoReply = function (mailOptions) {
    return new Promise(function (resolve, reject) {
        noReplyTransporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                var metaData = {
                    directory: __filename,
                    error_message: error.message,
                }
                Logger.log.error("Could not send an RESET PASSWORD email with " + info.messageId + "ID.", metaData)
                return reject(false);
            } else {
                Logger.log.debug('RESET PASSWORD email was sent with ' + info.messageId + "ID.");
                return resolve(true);
            }
        });
    });
}

pub.sendOrderSlip = function (orderInfo) {
    priceObject = getTotalPriceForProducts(orderInfo.orders);
    var html = getEmailHtml(orderInfo.customer);

    prepareOrderSlip(orderInfo, function (pdfFileFath) {
        var fromValue = "Homit Orders <" + process.env.ORDER_EMAIL_USER + ">";
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
    var html = getStoreAssingdedEmailHtml(orderInfo);
    var fromValue = "Homit Orders <" + process.env.ORDER_EMAIL_USER + ">";
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
    var fromValue = "noreply <" + process.env.NOREPLY_EMAIL_USER + ">";
    let mailOptions = {
        from: fromValue,
        to: orderInfo.customer_email,
        subject: "Reset password",
        html: html,
    };
    return await sendEmailViaNoReply(mailOptions);
}


/** Follwings are <html> retrievers.
 *  For more editing options please refer to https://www.npmjs.com/package/cheerio 
*/

/* Retrieving <html> to further edit */
var getEmailHtml = function (orderInfo) {
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

/* Retrieving <html> and loading it to variable for further edit */
var getStoreAssingdedEmailHtml = function (orderInfo) {
    let htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email_htmls/storeNotification.html", "utf8");
    let orderNumber = orderInfo.order_id.split("_")[1];
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
var getOrderSlipHtml = function (htmlSource, OI) {
    const $ = cheerio.load(htmlSource);
    const now = new Date();
    const dateArray = now.toString().split(" ");
    var CustomerName = filterInputField(OI.customer.first_name, "Dear,") + " " + filterInputField(OI.customer.last_name);
    let orders = OI.orders;

    var html_email = "";

    $('#customer').text(CustomerName);
    $('#customer_address').text(filterInputField(OI.customer.address, "Customer address"));
    $('#customer_phone').text(formatPhoneNumber(OI.customer.phone, "Customer phone number"));


    for (sub_order in orders) {
        html_email +=
            "<div class='order-id'>Order ID:" + filterInputField(OI.orders[sub_order].id.split('_')[1]) + "</div>" +
            "<table class='orders-details-table'>" +
            "<tr class='orders-details-table-tr'>" +
            "<td class='orders-details-table-td-hdr'>Store:</td>" +
            "<td class='orders-details-table-td-input'>" + filterInputField(OI.orders[sub_order].store_type_display_name) + "</td>" +
            "</tr>" +
            "<tr class='orders-details-table-tr'>" +
            "<td class='orders-details-table-td-hdr'>Delivery Option:</td>" +
            "<td class='orders-details-table-td-input'>" + filterInputField(createDeliveryOptionsText(OI.orders[sub_order].scheduledTime)) + "</td>" +
            "</tr>" +
            "</table>"
            ;
    }

    html_email += "<div class='order-content-sep'>ORDER CONTENT</div>";

    for (sub_order in orders) {
        html_email +=
            "<div class='order-id'>Order ID:" + filterInputField(OI.orders[sub_order].id.split('_')[1]) + "</div>" +
            "<table class='order-content-table'>" +
            "<tr class='order-content-table-tr'>" +
            "<td class='order-content-table-hdr-tr-1'>Description</td>" +
            "<td class='order-content-table-hdr-tr-2-3'>Quantity</td>" +
            "<td class='order-content-table-hdr-tr-2-3'>Price</td>" +
            "</tr>"
            ;
        for (var k = 0; k < orders[sub_order].products.length; k++) {
            let product = orders[sub_order].products[k];
            let Description = filterInputField(product.brand) + " " + filterInputField(product.name) + " " + filterInputField(product.volume) + " " + " x" + filterInputField(product.packaging);
            let Quantity = product.quantity;
            let Price = product.price_sold;
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
        "</tr>" +
        "<tr class='order-totals-rable-tr'>" +
        "<td class='order-totals-rable-tr-hdr'>TOTAL</td>" +
        "<td class='order-totals-rable-tr-num'>" + filterInputField(priceObject.totalPrice) + "</td>" +
        "</tr>" +
        "</table>";

    $('#order-details-append').append(html_email);

    return $.html();
};

/* Creating .pdf from given <html> */
var prepareOrderSlip = function (orderInfo, callback) {
    var orderSlipDir = process.env.ORDER_SLIPS_DIR;
    var orderNumber = Object.values(orderInfo.orders)[0].id.split('_')[1];
    var slipEjsSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email_htmls/orderSlip.ejs", "utf8");

    var slipHtmlSource = ejs.render(slipEjsSource);
    var pdfFileFath = orderSlipDir + "order-slip_" + orderNumber + ".pdf";
    var orderSlipHtml = getOrderSlipHtml(slipHtmlSource, orderInfo);

    //For more editing options please refer to https://www.npmjs.com/package/html-pdf
    var options = { format: 'Letter' };

    pdf.create(orderSlipHtml, options).toFile(pdfFileFath, function (err, res) {
        if (err) {
            var metaData = {
                directory: __filename,
                error_message: error.message,
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
var getTotalPriceForProducts = function (orders) {
    var prices = [];

    for (sub_order in orders) {
        prices = prices.concat(orders[sub_order].products);
    }

    var calcProducts = Catalog.getCartProductsWithStoreType(prices);

    price = Catalog.calculatePrice(calcProducts);
    priceObject.deliveryFee = (price.delivery_fee == 0 ? "FREE" : "C$ " + price.delivery_fee);
    priceObject.totalTax = "C$ " + price.total_tax;
    priceObject.totalAmount = "C$ " + price.cart_amount;
    priceObject.totalPrice = "C$ " + price.total_price;

    return priceObject;
};

/**
 * Get transaction email json
 * 
 * @param {*} transactionId 
 */
pub.getTransactionEmail = async function (transactionId) {
    var data = {
        transaction_id: transactionId
    };
    var transactionEmail = await db.selectAllWhereLimitOne(db.tables.orders_emails, data);
    if (transactionEmail.length > 0) {
        return transactionEmail[0].email;
    } else {
        return undefined;
    }
}

/**
 * Save transaction email json
 * 
 * @param {*} transactionId 
 * @param {*} json 
 */
pub.saveTransactionEmail = async function (transactionId, json) {
    var key = {
        transaction_id: transactionId
    };
    var transactionEmail = await Email.getTransactionEmail(transactionId);
    if (transactionEmail) {
        var dataUpdate = {
            email: JSON.stringify(json)
        };
        await db.updateQuery(db.tables.orders_emails, [dataUpdate, key]);
    } else {
        key.email = JSON.stringify(json);
        await db.insertQuery(db.tables.orders_emails, key);
    }
}

/**
 * Delete transaction email 
 * 
 * @param {*} transactionId 
 */
pub.deleteTransactionEmail = async function (transactionId) {
    var data = {
        transaction_id: transactionId
    };
    await db.deleteQuery(db.tables.orders_emails, data);
}

/* Helpers functions for time formatting */
function createDeliveryOptionsText(time) {
    let ASAP_WORDING = "ASAP, Placed: ";
    let SCHEDULED_WORDING = "Scheduled: ";

    if (time == 0) {
        return ASAP_WORDING + createTimeText(new Date());
    } else {
        return SCHEDULED_WORDING + createTimeText(new Date(time), new Date(time + 15 * 60 * 1000)); //show 15 minute range for scheduled
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

module.exports = pub;
