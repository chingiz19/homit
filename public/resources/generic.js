var app = angular.module('mainModule', ["ngRoute", "ngCookies", "ngMaterial", "ngMessages", "ngMdIcons", "ngSanitize"])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    })

    // Set up CSRF Header for AJAX calls
    .run(function($http, $cookies){
        $http.defaults.headers.post['CSRF-TOKEN'] = $cookies.get("csrf-token");
    });

app.filter("capitalize", function(){
    return function(str){
        return _.capitalize(str);
    };
});

app.filter('totalPrice', function () {
    return function (input) {
        var totalPrice = 0;
        input.forEach(function (cart_item) {
            var price = cart_item.price;
            var quantity = parseInt(cart_item.quantity);
            totalPrice += (price * quantity);
        });
        return totalPrice;
    };
});

app.filter("kebabCase", function(){
    return function(str){
        return _.kebabCase(str);
    };
});