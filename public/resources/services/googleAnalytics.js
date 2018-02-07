/**
 * This service provides helpers for Google Analytics 
 * 
 * 
 * @copyright Homit
 * @author Jeyhun Gurbanov
 */
app.service('notification', function(){
    var pub = {};

     /**
     * Registers event with Google Analytics
     * 
     * @param {*} eventName - event name (REQUIRED)
     * @param {*} params - event params (if any)
     */
    pub.addEvent = function(eventName, params){
        if (params){
            gtag('event', eventName, params);
        } else {
            gtag('event', eventName);
        }
    };

    return pub;
});
