app.filter('totalPrice', function() {
    return function(input) {
        var totalPrice = 0;
        input.forEach(function(cart_item){
            var price = cart_item["price"];
            var quantity = parseInt(cart_item["quantity"]);
            totalPrice += (price * quantity);
        });
        return totalPrice;
    };
});

app.controller("adminController", ["$location", "$scope", "$cookies", "$http", "$rootScope", 
    function($location, $scope, $cookies, $http, $rootScope) {


        $scope.orders = [];

    $http({
        method: 'GET',
        url: "/api/orders/getorder"
    }).then(function successCallback(response) {
        $scope.orders = response.data;
    }, function errorCallback(response) {

    });
}]);