/**
 * This service provides Date manipulations, extractions, and conversions
 * 
 * 
 * @copyright Homit
 * @author Jeyhun Gurbanov
 */
app.service('date', [function(){
    var arr_years = []; // contains all the years
    var arr_days_28 = []; // contains days up to 28
    var pub = {}; // public access variable

    /**
     * Initializes variables for this service
     */
    function init(){
        for (var i = 1900; i <= new Date().getUTCFullYear(); i++){
            arr_years.push(i);    
        }   

        for (var i = 1; i < 29; i++){
            arr_days_28.push(i);
        }
    }

    /**
     * Returns Array of all supported years
     * 
     * @return arr_years variable
     */
    pub.getYears = function(){
        return arr_years;
    }

    /**
     * @return Array of String containing months
     */
    pub.getMonths = function(){
        return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];    
    }

    /**
     * This method contains the logic for calculating and returning 
     * number of days for the given month in given year
     * 
     * @param {String} month - Month
     * @param {Number} year - Year
     * @return Array of numbers containing days
     */
    pub.getDays = function(month, year){
        switch(month){
            case "April":
            case "June":
            case "September":
            case "November":
                return arr_days_28.concat([29, 30]);
            case "February":
                if (new Date("Feb 29 " + year).toString().includes("Feb")){
                    return arr_days_28.concat([29]);
                } else {
                    return arr_days_28;
                }
            default:
                return arr_days_28.concat([29, 30, 31]);
        }
    }

    init();

    return pub;
}]);
