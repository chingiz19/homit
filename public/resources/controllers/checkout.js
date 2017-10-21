app.controller("checkoutController",
    function ($scope, $http, $location, $rootScope, $cookies, $window, $timeout, $mdSidenav, $log, advancedStorage, cartService, storage) {

        $scope.localCartName = "bizim_userCart";
        $scope.userCart = advancedStorage.getUserCart() || {};
        $scope.numberOfItemsInCart = 0;
        $scope.totalAmount = 0;
        $scope.delFee = 4.99;
        $scope.GST = 0;
        $scope.receipt = 0;
        $scope.userInfo = {};
        $scope.isUserSigned;
        $scope.orderer = {};

        $scope.toggleRight = buildDelayedToggler('right');

        // init didn't work that's why $cookies.getObject is outside
        if($cookies.get("user")){
            $scope.userInfo = JSON.parse($cookies.get("user").replace("j:", ""));
                if($scope.userInfo){
                    $scope.isUserSigned = true;
                }
                else{
                    $scope.userInfo = {};
                    $scope.isUserSigned = false;
                }
        }
        if($cookies.getObject("homit-address")){
            $scope.deliveryAddress = $cookies.getObject("homit-address").name;
            var inputAddressGuestUser = document.getElementById('addressGuestUser');
            if (inputAddressGuestUser.value.length == 0){
                $scope.userInfo.address=$scope.deliveryAddress;
            }
            var inputAddressUser = document.getElementById('newAddressUser');
            if (!inputAddressUser){
                $scope.userInfo.address1=$scope.deliveryAddress;
            }
        }

        $scope.init = function () {
            try {
                $scope.userInfo = JSON.parse($cookies.get("user").replace("j:", ""));
                $scope.isUserSigned = true;
            } catch (e) {
                $scope.userInfo = {};
                $scope.isUserSigned = false;
            }
            $scope.selectedAddress = 1;
        }

        cartService.getCart()
            .then(function successCallback(response) {
                if (response.data['success'] === true) {
                    if (Object.entries($scope.userCart).length == 0) {
                        $scope.userCart = response.data['cart'];
                    } else {
                        advancedStorage.setUserCart({});
                        $scope.userCart = cartService.mergeCarts($scope.userCart, response.data['cart']);
                    }
                }

                for (var a in $scope.userCart) {
                    $scope.totalAmount = $scope.totalAmount + ($scope.userCart[a]['quantity'] * $scope.userCart[a]['price']);
                    $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.userCart[a]['quantity'];
                    $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                    $scope.prepareItemForDB(a, $scope.userCart[a].quantity);
                }

                // Calculation For receipt
                $scope.GST = (($scope.totalAmount + $scope.delFee) * 0.05).toFixed(2);
                $scope.receipt = (($scope.totalAmount + $scope.delFee) * 1.05).toFixed(2);

            }, function errorCallback(response) {
                $scope.userCart = advancedStorage.getUserCart($scope);
                console.log("error");
                console.log(response);
            });
        $scope.plusItem = function (product) {
            var tmpQuantity = 1;
            if ($scope.userCart.hasOwnProperty(product.depot_id) && $scope.userCart[product.depot_id]["quantity"] < 10) {
                tmpQuantity = $scope.userCart[product.depot_id]["quantity"];
                tmpQuantity++;

                $scope.userCart[product.depot_id]["quantity"] = tmpQuantity;
                $scope.numberOfItemsInCart++;
                $scope.totalAmount = $scope.totalAmount + product.price;
                $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
            }
            $scope.prepareItemForDB(product.depot_id, $scope.userCart[product.depot_id].quantity);
        }

        $scope.minusItem = function (product) {
            var tmpQuantity = 1;
            if ($scope.userCart.hasOwnProperty(product.depot_id) && $scope.userCart[product.depot_id]["quantity"] > 1) {
                tmpQuantity = $scope.userCart[product.depot_id]["quantity"];
                tmpQuantity--;

                $scope.userCart[product.depot_id]["quantity"] = tmpQuantity;
                $scope.numberOfItemsInCart--;

                $scope.totalAmount = $scope.totalAmount - product.price;
                $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
            }

            $scope.prepareItemForDB(product.depot_id, $scope.userCart[product.depot_id].quantity);
        }

        $scope.clearCart = function (product) {
            $scope.userCart = {};
            $scope.numberOfItemsInCart = 0;
            $scope.totalAmount = 0;

            cartService.clearCart()
                .then(function successCallback(response) {
                    if (response.data["error"] && response.data["error"].code == "C001") { // use local storage
                        advancedStorage.setUserCart($scope.userCart);
                    }
                }, function errorCallback(response) {
                    console.log("ERROR");
                });
        }

        $scope.removeFromCart = function (product) {
            if ($scope.userCart.hasOwnProperty(product.depot_id)) {
                delete $scope.userCart[product.depot_id];
                $scope.numberOfItemsInCart = $scope.numberOfItemsInCart - product.quantity;
                $scope.totalAmount = $scope.totalAmount - (product.price * product.quantity);
                $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                $scope.prepareItemForDB(product.depot_id, 0);
            }
        }

        $scope.prepareItemForDB = function (depot_id, itemQuantity, action) {
            cartService.modifyCartItem(depot_id, itemQuantity)
                .then(function successCallback(response) {
                    if (response.data["error"] && response.data["error"].code == "C001") { // use local storage
                        advancedStorage.setUserCart($scope.userCart);
                    }
                }, function errorCallback(response) {
                    console.log("ERROR");
                });

            // Calculation For receipt
            $scope.GST = (($scope.totalAmount + $scope.delFee) * 0.05).toFixed(2);
            $scope.receipt = (($scope.totalAmount + $scope.delFee) * 1.05).toFixed(2);
        }
        $scope.init =function(){
            try{
                $scope.deliveryAddress = $cookies.getObject("homit-address").name;
            } catch(e){
                // ignore, address doesn't exist
            }
        }
        $scope.userInfo.cardIsShown = false;

        $scope.HomeIt = function () {
            var userOrder = [];
            var userInfoToSend = {};
            for (var [key, value] of Object.entries($scope.userCart)) {
                var item = {};
                item.depot_id = key;
                item.quantity = value.quantity;
                userOrder.push(item);
            }

            if ($scope.isUserSigned) {
                userInfoToSend.id = $scope.userInfo.id;
                userInfoToSend.email = $scope.userInfo.user_email;
                userInfoToSend.address = $scope.userInfo["address" + $scope.selectedAddress];
            }
            else {
                userInfoToSend.fname = $scope.userInfo.first_name;
                userInfoToSend.lname = $scope.userInfo.last_name;
                userInfoToSend.email = $scope.userInfo.user_email;
                userInfoToSend.address = $scope.userInfo.address;
                userInfoToSend.phone = $scope.userInfo.phone_number;
                userInfoToSend.dob = $scope.userInfo.dob;
            }
            console.log(userInfoToSend);
            $http({
                method: 'POST',
                url: '/api/checkout/placeorder',
                data: {
                    user: userInfoToSend,
                    products: userOrder
                }
            }).then(function successCallback(response) {
                if (response.data["success"]) {
                    $rootScope.$broadcast("addNotification", {
                        type: "alert-success",
                        message: response.data["ui_message"]
                    });
                } else {
                    $rootScope.$broadcast("addNotification", {
                        type: "alert-danger",
                        message: response.data["ui_message"]
                    });
                }
            }, function errorCallback(response) {
                var m = response.data["ui_message"] || "Something went wrong while processing your order, please try again";
                $rootScope.$broadcast("addNotification", { type: "alert-danger", message: m });
                console.log("ERROR in order processing");
            });
        }

        // Checkout Page right-SideNav functionality
        function debounce(func, wait, context) {
            var timer;
            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function () {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }
        function buildDelayedToggler(navID) {
            return debounce(function () {
                // Component lookup should always be available since we are not using `ng-if`
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug("toggle " + navID + " is done");
                    });
            }, 200);
        }
        $scope.close = function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav('right').close()
                .then(function () {
                    $log.debug("close RIGHT is done");
                });
        };
    });