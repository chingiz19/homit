/**
 * @copyright Homit 2018
 * @description Schedules orders to be implemented after GIVEN_TIME passed. 
 * GIVEN_TIME is difference between (required *date/time*) - (requester's local *date/time*)
 */
var pub = {};
var kue = require('kue-scheduler');
const MAXIMUM_SCHEDULE_TIME = 6.048e+8; // 1 week in milliseconds
const CM_LAG_TIME = 45; // in minutes 

/*Building metadata for log*/
var logMeta = {
    directory: __filename
}

/* Building options, mainly for data persistence through Redis-server*/
var options = {
    redis: {
        port: 6379,
        host: '127.0.0.1',
        db: db.redisTable.scheduler
    },
    restore: true
};

var Queue = kue.createQueue(options);

/* Backoff options for the rare cases when scheduled attempts fail */
var backoff = {
    delay: 60 * 1000, //will retry after 1 minute
    type: 'fixed'
}

/**
 * Public function used by other models to schedule delivery
 * Receives time after which order should be implemented, and
 * data which contains  
 * @param {*} time after which order should be implemented (in milliseconds)
 * @param {*} data all necessary data to send order to CM
 */
pub.scheduleDelivery = function (time, data) {
    var job = Queue
        .createJob('scheduled_order', data) //process name with passed on data
        .attempts(3)
        .backoff(backoff)
        .priority('normal')
        .unique(data.orderId);              //jobs with this unique identifier can be instantiated only once 

    //finally schedule it 
    Queue.schedule(getScheduleDate(time), job);
}

/* Processing orders when they finally get fired */
Queue.process('scheduled_order', async function (job, done) {
    let result = await NM.sendOrderToCM(job.data.userId, job.data.address, "o_" + job.data.orderId, job.data.storeType, false);
    
    if (result) {
        //callback after done
        done(null, {
            orderId: job.data.orderId
        });
    }
});


/* Attaching listeners */
Queue.on('schedule success', function (job) {
    Logger.log.info("Successfully scheduled job: " + job, logMeta);

    //TODO: to be deleted
    console.log("Successfully scheduled job: " + job);

    /* Attach job listeners if scheduled successfully*/
    job.on('complete', function (result) {
        Logger.log.info('Scheduled job has been sent to CM, order ID: ', result.orderId, logMeta);

    }).on('failed attempt', function (error, numberOfAttempts) {
        Logger.log.error('Job failed with the following message: ' + error.message + ' at ' + numberOfAttempts + ' attempt', logMeta);

    }).on('failed', function (error) {
        Logger.log.error('Job failed with the following message: ' + error.message + ' with no attempts left', logMeta);

    }).on('progress', function (progress, data) {
        Logger.log.debug('\r  job #' + job.id + ' ' + progress +
            '% complete with data ', data, logMeta);
    });
});

Queue.on('schedule error', function (error) {
    Logger.log.error("Scheduling error happened with the following message: " + error.message, logMeta);
});

Queue.on('already scheduled', function (job) {
    Logger.log.warn("This job is already scheduled --> " + job, logMeta);
});

Queue.on('lock error', function (error) {
    Logger.log.error("Error happened while locking data, message: " + error.message, logMeta);
});

Queue.on('unlock error', function (error) {
    Logger.log.error("Error happened while unlocking data, message: " + error.message, logMeta);
});

Queue.on('scheduler unknown job expiry key', function (error) {
    Logger.log.error("Scheduler unknown job expiry key --> message: " + error.message, logMeta);
});

Queue.on('restore success', function () {
    Logger.log.info("Successfully restored data for scheduler", logMeta);
});

Queue.on('restore error', function (error) {
    Logger.log.error("Error happened while restoring data for scheduler with the following message: " + error.message, logMeta);
});


/**
 * Checks received time for Homit's set time boundaries
 * Time MUST not be lower than CM interval/lag time and higher than 1 week
 * @param {*} time received diff_time from F.E.
 */
function isItRightTime(time) {
    return !(time < CM_LAG_TIME || time > MAXIMUM_SCHEDULE_TIME);
}

/**
 * Deducts CM interval from given desired diff_time and translates time into seconds for convenience
 * @param {*} time 
 */
function getScheduleDate(time) {
    return new Date(time - CM_LAG_TIME * 60 * 1000);
}

module.exports = pub;