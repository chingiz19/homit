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

app.controller("adminController", ["$location", "$scope", "$cookies", "$http", "$rootScope", "$window",
    function ($location, $scope, $cookies, $http, $rootScope, $window) {

        $scope.searchCriteria;
        $scope.searCriteriaIndex;
        $scope.foundUsers = [];
        $scope.foundOrders = [];
        $scope.foundOrderContent = [];

        $scope.searchUserHistory = function(searchBy){
            $scope.searCriteriaIndex = searchBy;
            if($scope.searCriteriaIndex == 1){
                $http({
                    method: 'POST',
                    url: "/api/orders/findusersbyemail",
                    data: {
                        user_email: $scope.searchCriteria
                    }
                }).then(function successCallback(response) {
                    $scope.foundUsers = response.data.users;
                }, function errorCallback(response) {
                    console.error("error");
                });
            }
            else if($scope.searCriteriaIndex == 2){
                $http({
                    method: 'POST',
                    url: "/api/orders/findusersbyphone",
                    data: {
                        phone_number: $scope.searchCriteria
                    }
                }).then(function successCallback(response) {
                    $scope.foundUsers = response.data.users;
                }, function errorCallback(response) {
                    console.error("error");
                });
            }
            else if($scope.searCriteriaIndex == 3){
                $http({
                    method: 'POST',
                    url: "/api/orders/getorder",
                    data: {
                        order_id: $scope.searchCriteria
                    }
                }).then(function successCallback(response) {

                    $scope.foundUsers.push(response.data.user);
                    setTimeout(() => {
                        document.getElementById("usrRbtn").click();
                        setTimeout(() => {
                            document.getElementById($scope.searchCriteria).click();
                        }, 10);
                    }, 10);

                }, function errorCallback(response) {
                    console.error("error");
                });
            }
        }
        $scope.selectedUserID = function (user){
            $scope.foundOrderContent = [];
            var guestId;
            var userId;
            if (user.is_guest) {
                guestId = user.id;
            } else {
                userId = user.id;
            }
            $http({
                method: 'POST',
                url: "/api/orders/vieworders",
                data: {
                    user_id: userId,
                    guest_id: guestId
                }
            }).then(function successCallback(response) {
                $scope.foundOrders = response.data.orders;
            }, function errorCallback(response) {
                console.error("error");
            });
        }
        $scope.selectedOrderId = function (order){
            $http({
                method: 'POST',
                url: "/api/orders/getorder",
                data: {
                    order_id: order.order_id
                }
            }).then(function successCallback(response) {
                $scope.foundOrderContent = response.data.orders;
            }, function errorCallback(response) {
                console.error("error");
            });
        }

        $scope.logoutBtn = function () {
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