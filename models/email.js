/**
 * @copyright Homit 2018
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const cheerio = require('cheerio')
var pdf = require('html-pdf');
var pub = {};
var priceObject = {};
var products = {};
var path = require("path");
var ejs = require("ejs");

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
            Logger.log.debug('ORDER email was sent with ' + error.message + "ID.");
            return true;
        }
    });
}


/* Send reset password emails using no-reply transporter object. 
 * <no-reply@homit.ca> account 
 * Includes cancelled, refunded and modified orders. 
*/
var sendEmailViaNoReply = function (mailOptions) {
    return noReplyTransporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            var metaData = {
                directory: __filename,
                error_message: error.message,
            }
            Logger.log.error("Could not send an RESET PASSWORD email with " + info.messageId + "ID.", metaData)
            return false;
        } else {
            Logger.log.debug('RESET PASSWORD email was sent with ' + info.messageId + "ID.");
            return true;
        }
    });
}


/** 
* Orders modifed by CSR
* @action is used to differentiate between 'cancel' order, 'refund' and 'modified' order
*/
pub.sendOrderSlip = function (orderInfo) {
    orders = orderInfo.orders;
    priceObject = getTotalPriceForProducts(orders);
    var html = getEmailHtml(orderInfo.customer);

    prepareOrderSlip(orderInfo, function (pdfFileFath) {
        let mailOptions = {
            from: '"Homit Orders" <orders@homit.ca>',
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

pub.sendModifiedOrderSlip = function (orderInfo, action) {
    products = orderInfo.customer.order.products;
    priceObject = getTotalPriceForProducts(products);

    if (action == "cancel") {
        var html = getCancelledOrderEmailHtml(orderInfo);
        prepareOrderSlip(orderInfo, function (pdfFileFath) {
            let mailOptions = {
                from: '"Homit Orders" <orders@homit.ca>',
                to: orderInfo.customer.email,
                subject: orderInfo.customer.first_name + '\'s order',
                html: html,
            };
            sendEmailViaOrders(mailOptions);
        });
    } else if (action == "modified") {
        var html = getModifiedOrderEmailHtml(orderInfo);
        prepareOrderSlip(orderInfo, function (pdfFileFath) {
            let mailOptions = {
                from: '"Homit Orders" <orders@homit.ca>',
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
    } else if (action == "refund") {
        var html = getRefundedOrderEmailHtml(orderInfo);
        prepareOrderSlip(orderInfo, function (pdfFileFath) {
            let mailOptions = {
                from: '"Homit Orders" <orders@homit.ca>',
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
    }
};


/* Prepare mail options and send notification email to customer, respectively */
pub.sendRefundEmail = function (orderInfo) {
    var html = getRefundedOrderEmailHtml(orderInfo);
    let mailOptions = {
        from: '"Homit Orders" <orders@homit.ca>',
        to: orderInfo.customer.email,
        subject: orderInfo.customer.first_name + '\'s order',
        html: html,
    };
    sendEmailViaOrders(mailOptions);
};

pub.sendPartialRefundEmail = function (orderInfo) {
    var html = getPartialRefundedOrderEmailHtml(orderInfo);
    let mailOptions = {
        from: '"Homit Orders" <orders@homit.ca>',
        to: orderInfo.customer.email,
        subject: orderInfo.customer.first_name + '\'s order',
        html: html,
    };
    sendEmailViaOrders(mailOptions);
};

pub.sendCancelEmail = function (orderInfo) {
    var html = getCancelledOrderEmailHtml(orderInfo);
    let mailOptions = {
        from: '"Homit Orders" <orders@homit.ca>',
        to: orderInfo.customer.email,
        subject: orderInfo.customer.first_name + '\'s order',
        html: html,
    };
    sendEmailViaOrders(mailOptions);
};

pub.sendResetPasswordEmail = async function (orderInfo) {
    var html = getResetPasswordHTML(orderInfo.resetLink);
    let mailOptions = {
        from: '"noreply" <no-reply@homit.ca>',
        to: orderInfo.customer.email,
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
    var htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email_htmls/order.html", "utf8");
    const $ = cheerio.load(htmlSource);

    if (orderInfo.card_digits) {
        $('#credit_card').text("**** **** **** " + orderInfo.card_digits);
    }
    $('#user_greeting').text("Hello, " + orderInfo.first_name);
    $('#total_amount').text(priceObject.totalAmount);
    $('#gst').text(priceObject.totalTax);
    $('#total_price').text(priceObject.totalPrice);
    $('#delivery_fee').text(priceObject.deliveryFee);

    return $.html();
};

/* Retrieving <html> and loading it to variable for further edit */
var getModifiedOrderEmailHtml = function (orderInfo) {
    var htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email_htmls/modifiedOrder.html", "utf8");
    var orderNumber = orderInfo.customer.order.id.split('_')[1];
    const $ = cheerio.load(htmlSource);

    $('#customer').text(orderInfo.customer.first_name);
    $('#order_id').text("#" + orderNumber);

    return $.html();
};

var getCancelledOrderEmailHtml = function (orderInfo) {
    var htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email_htmls/cancelledOrder.html", "utf8");
    var orderNumber = orderInfo.order_id;
    const $ = cheerio.load(htmlSource);

    $('#customer').text(orderInfo.first_name);
    $('#order_id').text("#" + orderNumber);
    $('#refund_amount').text(orderInfo.refund_amount);

    return $.html();
};

var getRefundedOrderEmailHtml = function (orderInfo) {
    var htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email_htmls/refundOrder.html", "utf8");
    var orderNumber = orderInfo.order_id;
    const $ = cheerio.load(htmlSource);

    $('#customer').text(orderInfo.customer_name);
    $('#order_id').text("#" + orderNumber);
    $('#refund_amount').text(orderInfo.refund_amount);

    return $.html();
};

var getPartialRefundedOrderEmailHtml = function (orderInfo) {
    var htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email_htmls/refundOrder.html", "utf8");
    var orderNumber = orderInfo.order_id;
    const $ = cheerio.load(htmlSource);

    $('#customer').text(orderInfo.customer_name);
    $('#order_id').text("#" + orderNumber);
    $('#refund_amount').text(orderInfo.refund_amount);
    $('#action').text("partially");

    return $.html();
};

var getResetPasswordHTML = function (link) {
    var file = fs.readFileSync(path.join(process.cwd(), "/project_setup/resources/email_htmls/resetpassword.ejs"), "utf8");
    return ejs.render(file, {
        resetLink: link
    });
}

/* Edit html for .pdf Order Slip that is attached to main e-mail */
var getOrderSlipHtml = function (htmlSource, OI) {
    const $ = cheerio.load(htmlSource);
    const now = new Date();
    const dateArray = now.toString().split(" ");
    var timeStamp = dateArray[0] + " " + dateArray[1] + " " + dateArray[2] + " " + dateArray[3] + " at " + dateArray[4];
    var CustomerName = OI.customer.first_name + " " + OI.customer.last_name

    $('#order_details').text("ORDER DETAILS");

    for (sub_order in orders) {
        $('#table').append(
            "<tr style='width: 100vw;'><table>"+
            "<tr style='text-align: left;'><td style='width: 100%; font-size: 11px;'>"+OI.orders[sub_order].super_category_display+"</td></tr>"+
            "<tr style='text-align: left;'><td style='width: 100%; font-size: 11px; padding-bottom: 4pt; border-bottom: 1px solid black;'>"+"Order ID: " + OI.orders[sub_order].id.split('_')[1] +"</td></tr>"+
            "<tr style='height:8pt'></tr>"+
            "</table></tr>"+
            "<tr style='height:13.85pt'>"+
            "<td width=407 valign=top style='width:305.6pt;padding:0in 5.4pt 0in 5.4pt;"+
            "height:13.85pt'>"+
            "<p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:"+
            "normal'>"+
            "<b>"+
            "<span style='font-size:10.0pt;font-family:'Arial',sans-serif'>DESCRIPTION</span>"+
            "</b>"+
            "</p>"+
            "</td>"+
            "<td width=150 valign=top style='width:112.5pt;padding:0in 5.4pt 0in 5.4pt;"+
            "height:13.85pt'>"+
            "<p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;"+
            "text-align:center;line-height:normal'>"+
            "<b>"+
            "<span style='font-size:10.0pt;"+
            "font-family:'Arial',sans-serif'>QUANTITY</span>"+
            "</b>"+
            "</p>"+
            "</td>"+
            "<td width=159 valign=top style='width:119.15pt;padding:0in 5.4pt 0in 5.4pt;"+
            "height:13.85pt'>"+
            "<p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;"+
            "text-align:center;line-height:normal'>"+
            "<b>"+
            "<span style='font-size:10.0pt;"+
            "font-family:'Arial',sans-serif'>PRICE</span>"+
            "</b>"+
            "</p>"+
            "</td>"+
            "</tr>"
        );
        if (OI.orders[sub_order].store.name.toLowerCase().includes("liquor")) {
            $('#store_name').text(OI.orders[sub_order].store.name + ", ");
            $('#store_address').text(" Ad: " + OI.orders[sub_order].store.address + ", ");
            $('#store_phone').text(" Ph: " + OI.orders[sub_order].store.phone_number + ".");
            $('#licence-id').text("*Liquor delivered in accordance with AGLC policies under Class D License No. 777481-1");
        }
        $('#customer').text(CustomerName);
        $('#customer_address').text(OI.customer.address);
        $('#customer_phone').text(OI.customer.phone);
        $('#date_stamp').text("Your order placed: " + timeStamp);
        $('#total_amount').text(priceObject.totalAmount);
        $('#gst').text(priceObject.totalTax);
        $('#total_price').text(priceObject.totalPrice);
        $('#delivery_fee').text(priceObject.deliveryFee);
        for (var k = 0; k < orders[sub_order].products.length; k++) {
            var product = orders[sub_order].products[k];
            var Description = product.product_brand + " " + product.product_name + " " + product.volume + " " + " x" + product.packaging;
            var Quantity = product.quantity;
            var Price = product.price_sold;
            $('#table').append(
                "<tr style='height:13.85pt'>" +
                "<td width=407 valign=top style='width:305.6pt;padding:0in 5.4pt 0in 5.4pt;height:13.85pt'>" +
                "<p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:normal'>" +
                "<span style='font-size:10.0pt;font-family:'Arial',sans-serif'>" + Description + "</span></p></td>" +
                "<td width=150 valign=top style='width:112.5pt;padding:0in 5.4pt 0in 5.4pt;height:13.85pt'>" +
                "<p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;text-align:center;line-height:normal'>" +
                "<span style='font-size:10.0pt;font-family:'Arial',sans-serif'>" + Quantity + "</span></p></td>" +
                "<td width=159 valign=top style='width:119.15pt;padding:0in 5.4pt 0in 5.4pt;height:13.85pt'>" +
                "<p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;text-align:center;line-height:normal'>" +
                "<span style='font-size:10.0pt;font-family:'Arial',sans-serif'>" + Price + "</span></p></td></tr>");
        }
        $('#table').append(
            "<tr style='height:10pt'></tr>"
        );
    }
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
    var depotQuantities = {};
    var prices = [];

    for (sub_order in orders) {
        for (var i = 0; i < orders[sub_order].products.length; i++) {
            depotQuantities[orders[sub_order].products[i].depot_id] = orders[sub_order].products[i].quantity;
            var currentPrice = {
                "depot_id": orders[sub_order].products[i].depot_id,
                "price": orders[sub_order].products[i].price_sold,
                "tax": orders[sub_order].products[i].tax
            };
            prices.push(currentPrice);
        }
    }

    price = Catalog.priceCalculator(depotQuantities, prices, false);
    priceObject.deliveryFee = "C$ " + price.delivery_fee;
    priceObject.totalTax = "C$ " + price.total_tax;
    priceObject.totalAmount = "C$ " + price.cart_amount;
    priceObject.totalPrice = "C$ " + price.total_price;

    return priceObject;
};

module.exports = pub;
