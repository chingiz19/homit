/**
 * @copyright Homit 2018
 */

var pub = {};
var winston = require('winston');
require('winston-daily-rotate-file');
var dateFormat = require('dateformat');
var fs = require('fs');
const path = require('path');
const filename = path.normalize(process.env.LOG_FILE_PATH + process.env.LOG_FILE_NAME);
const storeLogFilename = path.normalize(process.env.LOG_FILE_PATH + "store_log");
const filename_error = path.normalize(process.env.LOG_FILE_PATH + "_error_" + process.env.LOG_FILE_NAME);
const nameDate = dateFormat(new Date().setUTCHours(13), "isoDateTime").split('T')[0];
const activeLogLocation = process.env.LOG_FILE_PATH + nameDate + "." + process.env.LOG_FILE_NAME;

/**
 * Log levels used --> error: 0 | warn: 1 | info: 2 | verbose: 3 | debug: 4 | silly: 5 
 * It seems that winston only support GMT (UTC +0), it means 7 hours of difference
 */
pub.storeLog = new (winston.Logger)({
    exitOnError: false,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    transports: [
        new (winston.transports.DailyRotateFile)({
            timestamp: true,
            maxFiles: 365,
            eol: ",\n",
            level: process.env.DEBUG_LEVEL,
            tailable: true,
            prepend: true,
            colorize: true,
            name: "app.combined",
            filename: storeLogFilename,
            prettyPrint: true,
        })
    ]
});

/**
 * Logger specifically for Store App 
 * App is going to remotely logs its errors and exceptions
 */
pub.log = new (winston.Logger)({
    exitOnError: false,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    transports: [
        new (winston.transports.DailyRotateFile)({
            timestamp: true,
            maxFiles: 365,
            eol: ",\n",
            level: process.env.DEBUG_LEVEL,
            tailable: true,
            prepend: true,
            colorize: true,
            name: "file.combined",
            filename: filename,
            prettyPrint: true,
        }),
        new (winston.transports.DailyRotateFile)({
            timestamp: true,
            maxFiles: 365,
            eol: ",\n",
            tailable: true,
            prepend: true,
            colorize: true,
            level: "error",
            name: "file.error",
            filename: filename_error,
            prettyPrint: true,
        })
    ]
});

pub.streamServerLogs = function (res) {

    let activeLogLocation = getActiveLogLocation();

    if (fs.existsSync(activeLogLocation)) {
        res.setHeader("content-type", "text/html");
        fs.createReadStream(activeLogLocation).pipe(res);
    } else {
        errorMessages.sendErrorResponse(res, "Log file does not exist");
        Logger.log.debug("Could not locate log file at " + activeLogLocation);
    }
};

function getActiveLogLocation() {
    let nameDate = dateFormat(new Date().setUTCHours(13), "isoDateTime").split('T')[0];
    return process.env.LOG_FILE_PATH + nameDate + "." + process.env.LOG_FILE_NAME;
}


module.exports = pub;