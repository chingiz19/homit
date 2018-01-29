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
        for (var i = new Date().getUTCFullYear(); i >= 1900; i--){
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
    };

    /**
     * @return Array of String containing months
     */
    pub.getMonths = function(){
        return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];    
    };

    /**
     * @return Month number
     */
    pub.convertMonth = function(month){
        var months = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12};
        return months[month];  
    };

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
                break;
            default:
                return arr_days_28.concat([29, 30, 31]);
        }
    };

    pub.isOver18Years = function(day, month, year){
        return new Date(year+18, pub.convertMonth(month)-1, day) <= new Date();
    };

    pub.dayDifference = function(day, month, year){
        var oneDay = 24*60*60*1000;
        var inputDate = new Date(year + 18,pub.convertMonth(month) - 1 , day);
        var today = new Date();
        return Math.round(Math.abs((inputDate.getTime() - today.getTime())/(oneDay)));
    };

    init();

    return pub;
}]);
