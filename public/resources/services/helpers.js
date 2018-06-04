/**
 * This service is for helper functions that are commonly used in many placesd
 * 
 * 
 * @copyright Homit
 * @author Jeyhun Gurbanov
 */
app.service('helpers', function(){
    var pub = {};

    pub.randomDigitGenerator = function(){
        return Math.floor(Math.random()*90000000) + 10000000;
    }

    return pub;
});
