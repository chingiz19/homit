/**
 * @copyright Homit 2018
 */

var pub = {};
var winston = require('winston');
require('winston-daily-rotate-file');
var dateFormat = require('dateformat');
var fs = require('fs');
const path = require('path');
var filename = path.normalize(process.env.LOG_FILE_PATH + process.env.LOG_FILE_NAME);
var nameDate = dateFormat(new Date().setUTCHours(13), "isoDateTime").split('T')[0];
var activeLogLocation = process.env.LOG_FILE_PATH + nameDate + "." + process.env.LOG_FILE_NAME;

/**
 * Log levels used --> error: 0 | warn: 1 | info: 2 | verbose: 3 | debug: 4 | silly: 5 
 * It seems that winston only support GMT (UTC +0), it means 7 hours of difference
 * Therefore we are using custom timestamp
 */
pub.log = new (winston.Logger)({
    level: process.env.DEBUG_LEVEL,
    exitOnError: false,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    transports: [
        new (winston.transports.DailyRotateFile)({
            timestamp: true,
            maxFiles: 365,
            eol: ",\n",
            tailable: true,
            prepend: true,
            colorize: true,
            filename: filename,
            prettyPrint: true,
        })
    ]
});

pub.stream = function (res) {
    if (fs.existsSync(activeLogLocation)) {
        res.setHeader("content-type", "text/html");
        fs.createReadStream(activeLogLocation).pipe(res);
    } else {
        var response = {
            success: false,
            error_message: "Log file does not exist"
        };
        res.send(response);
        Logger.log.debug("Could not locate log file at " + activeLogLocation);
    }
};


module.exports = pub;