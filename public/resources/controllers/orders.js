app.filter('totalPrice', function () {
    return function (input) {
        var totalPrice = 0;
        input.forEach(function (cart_item) {
            var price = cart_item["price"];
            var quantity = parseInt(cart_item["quantity"]);
            totalPrice += (price * quantity);
        });
        return totalPrice;
    };
});

app.controller("adminController", ["$location", "$scope", "$cookies", "$http", "$rootScope",
    function ($location, $scope, $cookies, $http, $rootScope) {

        console.log("heeeellllooo");
        $scope.orders = [];

        $http({
            method: 'GET',
            url: "/api/orders/vieworders"
        }).then(function successCallback(response) {
            $scope.orders = response.data;
            console.log("yaxsi");
            console.log(response.data);
        }, function errorCallback(response) {
            console.error("error");
        });

        $scope.logoutBtn = function () {
            console.log("signout");
            $http({
                method: 'POST',
                url: '/api/authentication/signout'
            }).then(function successCallback(response) {
                if (response.data["success"]) {
                    //delete cookie
                    $cookies.remove("user");
                    $rootScope.$broadcast("addNotification", {
                        type: "alert-success",
                        message: response.data["ui_message"],
                        href: "/",
                        reload: true
                    });
                } else {
                    // TODO: error handling
                    console.log("password not reset");
                }
            }, function errorCallback(response) {
                $rootScope.$broadcast("addNotification", { type: "alert-danger", message: response.data["ui_message"] });
                console.log("ERROR in password reset");
            });
        };
    }]);