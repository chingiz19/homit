/**
 * @copyright Homit 2017
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const cheerio = require('cheerio')
var pdf = require('html-pdf');
var pub = {};
var priceObject = {};
var products = {};

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // should always be true
    auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASS  // generated ethereal password
    }
});

var sendEmail = function (mailOptions) {
    // send e-mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        } else {
            console.log('Message sent: %s', info.messageId);  //to be deleted and transfer to Logger
        }
    });
}

pub.sendOrderSlip = function (orderInfo) {
    products = orderInfo.customer.order.products;
    priceObject = getTotalPriceForProducts(products);

    var html = getEmailHtml(orderInfo);

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
        sendEmail(mailOptions);
    });
};

//call this function for CSR's modifed e-mails
/*
* @action used to differentiate between 'cancel' order, 'refund' and 'modified' order
*/
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
            sendEmail(mailOptions);
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
            sendEmail(mailOptions);
        });
    } else if (action == "refund") {
        var html = getRfundedOrderEmailHtml(orderInfo);
        prepareOrderSlip(orderInfo, function (pdfFileFath) {
            let mailOptions = {
                from: '"Homit Orders" <orders@homit.ca>',
                to: orderInfo.customer_email,
                subject: orderInfo.customer_name + '\'s order',
                html: html,
                attachments: [
                    {
                        filename: 'Delivery Slip.pdf',
                        path: pdfFileFath
                    },
                ]
            };
            sendEmail(mailOptions);
        });
    }
};

/*Working on these*/
pub.sendRefundEmail = function (orderInfo) {
    var html = getRfundedOrderEmailHtml(orderInfo);
    let mailOptions = {
        from: '"Homit Orders" <orders@homit.ca>',
        to: orderInfo.customer_email,
        subject: orderInfo.customer_name + '\'s order',
        html: html,
    };
    sendEmail(mailOptions);
};



//FOR MORE EDITING OPTIONS PLEASE REFER TO https://www.npmjs.com/package/cheerio
var getEmailHtml = function (orderInfo) {
    var htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email-htmls/order.html", "utf8");
    const $ = cheerio.load(htmlSource);

    $('#user_greeting').text("Hello, " + orderInfo.customer.first_name);
    $('#credit_card').text(orderInfo.customer.credit_card);
    $('#total_amount').text(priceObject.totalAmount);
    $('#gst').text(priceObject.totalTax);
    $('#total_price').text(priceObject.totalPrice);
    $('#delivery_fee').text(priceObject.deliveryFee);
    return $.html();
};

var getModifiedOrderEmailHtml = function (orderInfo) {
    var htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email-htmls/modifiedOrder.html", "utf8");
    var orderNumber = orderInfo.customer.order.id.split('_')[1];
    const $ = cheerio.load(htmlSource);

    $('#customer').text(orderInfo.customer.first_name);
    $('#order_id').text("#" + orderNumber);

    return $.html();
};

var getCancelledOrderEmailHtml = function (orderInfo) {
    var htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email-htmls/cancelledOrder.html", "utf8");
    var orderNumber = orderInfo.customer.order.id.split('_')[1];
    const $ = cheerio.load(htmlSource);

    $('#customer').text(orderInfo.customer.first_name);
    $('#order_id').text("#" + orderNumber);

    return $.html();
};

var getRfundedOrderEmailHtml = function (orderInfo) {
    var htmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email-htmls/refundOrder.html", "utf8");
    var orderNumber = orderInfo.order_id;
    const $ = cheerio.load(htmlSource);

    $('#customer').text(orderInfo.customer_name);
    $('#order_id').text("#" + orderNumber);
    $('#refund_amount').text(orderInfo.refund_amount);

    return $.html();
};

var prepareOrderSlip = function (orderInfo, callback) {
    var orderNumber = orderInfo.customer.order.id.split('_')[1];
    var slipHtmlSource = fs.readFileSync(process.cwd() + "/project_setup/resources/email-htmls/order_slip.html", "utf8");
    var pdfFileFath = process.cwd() + "/OrderSlips/orderSlip#" + orderNumber + ".pdf";
    var orderSlipHtml = getOrderSlipHtml(slipHtmlSource, orderInfo);

    //For now we will use simple options. More options available at https://www.npmjs.com/package/html-pdf
    var options = { format: 'Letter' };

    pdf.create(orderSlipHtml, options).toFile(pdfFileFath, function (err, res) {
        if (err) {
            return Logger.log("Error happened while creating .pdf file for OrderSlip: " + err);
        } else {
            //TODO save file to DB (Zaman Zamanli)
            callback(pdfFileFath);
        }
    });
};


//Editing html for .pdf Order Slip that is attached to main e-mail
var getOrderSlipHtml = function (htmlSource, OI) {
    const $ = cheerio.load(htmlSource);
    const now = new Date();
    const dateArray = now.toString().split(" ");
    var timeStamp = dateArray[0] + " " + dateArray[1] + " " + dateArray[2] + " " + dateArray[3] + " at " + dateArray[4];
    var CustomerName = OI.customer.first_name + " " + OI.customer.last_name


    $('#order_details').text("#" + OI.customer.order.id.split("_")[1] + " ORDER DETAILS");
    $('#store_name').text(OI.store.name);
    $('#store_address').text(OI.store.address);
    $('#store_phone').text(OI.store.phone);
    $('#customer').text(CustomerName);
    $('#customer_address').text(OI.customer.address);
    $('#customer_phone').text(OI.customer.phone);
    $('#date_stamp').text("Your order placed: " + timeStamp);
    $('#total_amount').text(priceObject.totalAmount);
    $('#gst').text(priceObject.totalTax);
    $('#total_price').text(priceObject.totalPrice);
    $('#delivery_fee').text(priceObject.deliveryFee);

    for (var k = 0; k < products.length; k++) {
        var product = products[k];
        var Description = product.brand + " " + product.name + " v." + product.volume + " " + " x" + product.packaging;
        var Quantity = product.quantity;
        var Price = product.price;
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
    return $.html();
};

var getTotalPriceForProducts = function (products) {
    var deliveryFee1 = 4.99;
    var deliveryFee2 = 2.99;
    var albertaGst = 0.05;
    var depotQuantities = {};
    var depotIds = [];
    var prices = [];
    var priceObject = {};
    var totalAmount = 0;
    var totalTax = 0;
    var deliveryFee = deliveryFee1;

    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        var tempObj = {};
        depotIds.push(product.depot_id);
        depotQuantities[product.depot_id] = product.quantity;
        tempObj.price = product.price;
        tempObj.id = product.depot_id;
        tempObj.tax = product.tax;
        prices.push(tempObj);
    }

    for (var i = 0; i < prices.length; i++) {
        totalAmount = totalAmount + parseFloat(prices[i].price) * depotQuantities[prices[i].id];
        if (prices[i].tax) {
            totalTax = totalTax + parseFloat(prices[i].price) * depotQuantities[prices[i].id] * albertaGst;
        }
    }
    // Calculating math numbers
    totalAmount = Math.round(totalAmount * 100) / 100;

    deliveryFee = deliveryFee1 + parseInt(totalAmount / 100) * deliveryFee2;

    totalTax = Math.round((totalTax + deliveryFee * albertaGst) * 100) / 100;
    var totalPrice = totalAmount + deliveryFee + totalTax;

    priceObject.deliveryFee = "C$ " + deliveryFee;
    priceObject.totalTax = "C$ " + totalTax;
    priceObject.totalAmount = "C$ " + totalAmount;
    priceObject.totalPrice = "C$ " + totalPrice;

    return priceObject;
};

module.exports = pub;
