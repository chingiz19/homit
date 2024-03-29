/**
 * This service provides helpers for Google Analytics 
 * 
 * 
 * @copyright Homit
 * @author Jeyhun Gurbanov
 */
app.service('googleAnalytics', function(){
    var pub = {};

    pub.eventCategories = {
        cart_actions: "cart_actions",
        catalog_actions: "catalog_actions",
        checkout_actions: "checkout_actions",
        address_actions: "address_actions",
        product_actions: "product_actions",
        main_actions: "main_actions",
        store_page_actions: "store_page_actions",
        myaccount_actions: "myaccount_actions",
        header_actions: "header_actions"
    };

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
