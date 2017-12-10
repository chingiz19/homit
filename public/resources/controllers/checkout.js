// import { clearInterval } from "timers";

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

        var checkout = this;


        // init didn't work that's why $cookies.getObject is outside
        if ($cookies.get("user")) {
            $scope.userInfo = JSON.parse($cookies.get("user").replace("j:", ""));
            if ($scope.userInfo) {
                $scope.isUserSigned = true;
            }
            else {
                $scope.userInfo = {};
                $scope.isUserSigned = false;
            }
        }
        if ($cookies.getObject("homit-address")) {
            $scope.deliveryAddress = $cookies.getObject("homit-address").name;
            checkout.deliveryAddress_lat = $cookies.getObject("homit-address").geometry.location['lat'];
            checkout.deliveryAddress_lng = $cookies.getObject("homit-address").geometry.location['lng'];

            var inputAddressGuestUser = document.getElementById('addressGuestUser');
            if (inputAddressGuestUser.value.length == 0) {
                $scope.userInfo.address = $scope.deliveryAddress;
            }
            var inputAddressUser = document.getElementById('newAddressUser');
            if (!inputAddressUser) {
                $scope.userInfo.address0 = $scope.deliveryAddress;
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
            $scope.selectedAddress = 0;
        }

        cartService.getCart()
            .then(function successCallback(response) {
                if (response.data['success'] === true) {
                    $scope.userCart = cartService.mergeCarts($scope.userCart, response.data['cart']);
                } else {
                    $scope.userCart = cartService.mergeCarts(advancedStorage.getUserCart(), {}); //REQUIRED to convert to new convention with super_category
                }
                advancedStorage.setUserCart({});

                for (var super_category in $scope.userCart) {
                    for (var a in $scope.userCart[super_category]) {
                        $scope.totalAmount = $scope.totalAmount + ($scope.userCart[super_category][a]['quantity'] * $scope.userCart[super_category][a]['price']);
                        $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.userCart[super_category][a]['quantity'];
                        $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                        $scope.prepareItemForDB(a, $scope.userCart[super_category][a].quantity);
                    }
                }

                // Calculation For receipt
                $scope.updatePrices($scope.userCart);

            }, function errorCallback(response) {
                $scope.userCart = advancedStorage.getUserCart($scope);
                Logger.log("error");
                Logger.log(response);
            });
        $scope.plusItem = function (product) {
            var tmpQuantity = 1;
            if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
                var currentQuantity = $scope.userCart[product.super_category][product.depot_id]["quantity"];
                if (currentQuantity < 10) {
                    currentQuantity++;

                    $scope.userCart[product.super_category][product.depot_id]["quantity"] = currentQuantity;
                    $scope.numberOfItemsInCart++;


                    $scope.prepareItemForDB(product.depot_id, currentQuantity);
                    $scope.updatePrices($scope.userCart);
                }
            }
        }

        $scope.minusItem = function (product) {
            if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
                var currentQuantity = $scope.userCart[product.super_category][product.depot_id]["quantity"];
                if (currentQuantity > 1) {
                    currentQuantity--;

                    $scope.userCart[product.super_category][product.depot_id]["quantity"] = currentQuantity;
                    $scope.numberOfItemsInCart--;
                    $scope.prepareItemForDB(product.depot_id, currentQuantity);

                    $scope.updatePrices($scope.userCart);
                }
            }
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
                    Logger.log("ERROR");
                });
        }

        $scope.removeFromCart = function (product) {
            if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
                delete $scope.userCart[product.super_category][product.depot_id];

                // if super_category doesn't contain objects, then remove from list
                if (Object.entries($scope.userCart[product.super_category]).length == 0) {
                    delete $scope.userCart[product.super_category];
                }

                $scope.numberOfItemsInCart = $scope.numberOfItemsInCart - product.quantity;
                $scope.prepareItemForDB(product.depot_id, 0);

                $scope.updatePrices($scope.userCart);
            }
        }

        $scope.prepareItemForDB = function (depot_id, itemQuantity, action) {
            cartService.modifyCartItem(depot_id, itemQuantity)
                .then(function successCallback(response) {
                    if (response.data["error"] && response.data["error"].code == "C001") { // use local storage
                        advancedStorage.setUserCart($scope.userCart);
                    }
                }, function errorCallback(response) {
                    Logger.log("ERROR");
                });

            // Calculation For receipt
            $scope.updatePrices($scope.userCart);
        }
        $scope.init = function () {
            try {
                $scope.deliveryAddress = $cookies.getObject("homit-address").name;
            } catch (e) {
                // ignore, address doesn't exist
            }
        }
        $scope.userInfo.cardIsShown = false;

        function checkPaymentResponse(callback) {
            function looper() {
                setTimeout(() => {
                    var helcim_response = document.getElementById("response");
                    var transaction_id = document.getElementById("transactionId");
                    if (helcim_response) {
                        callback(helcim_response.value, transaction_id.value);
                    } else {
                        looper();
                    }
                }, 100);
            }
            looper();
        }

        $scope.HomeIt = function () {
            var hcRespond = undefined;
            checkPaymentResponse(function (responseCode, transaction_id) {
                if (responseCode == 1) {
                    var userInfoToSend = {};

                    if ($scope.isUserSigned) {
                        userInfoToSend.email = $scope.userInfo.user_email;
                        userInfoToSend.phone = $scope.userInfo.phone_number;
                        userInfoToSend.address = $scope.userInfo["address" + $scope.selectedAddress];
                        userInfoToSend.address_latitude = 114; // TODO: temp fix this
                        userInfoToSend.address_longitude = 51; // TODO: temp
                    }
                    else {
                        userInfoToSend.fname = $scope.userInfo.first_name;
                        userInfoToSend.lname = $scope.userInfo.last_name;
                        userInfoToSend.email = $scope.userInfo.user_email;
                        userInfoToSend.address = $scope.userInfo.address;
                        userInfoToSend.address_latitude = checkout.deliveryAddress_lat;
                        userInfoToSend.address_longitude = checkout.deliveryAddress_lng;
                        userInfoToSend.phone = $scope.userInfo.phone_number;
                        userInfoToSend.dob = $scope.userInfo.dob;
                    }
                    $http({
                        method: 'POST',
                        url: '/api/checkout/placeorder',
                        data: {
                            user: userInfoToSend,
                            products: $scope.userCart,
                            transaction_id: transaction_id
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
                        Logger.log("ERROR in order processing");
                    });
                    console.log("Girdi == 1");
                } else if (responseCode == 0) {
                    alert("Process payment error occured");
                    console.log("Girdi == 0");
                }
            });


        }

        // Checkout Page right-SideNav functionality
        $scope.toggleRight = buildDelayedToggler('right');
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

        $scope.updatePrices = function (products) {
            var deliveryFee1 = 4.99;
            var deliveryFee2 = 2.99;
            var albertaGst = 0.05;
            var depotQuantities = {};
            var prices = [];
            for (var superCategory in products) {
                for (var key in products[superCategory]) {
                    var temp = {
                        id: products[superCategory][key].depot_id,
                        price: products[superCategory][key].price,
                        tax: products[superCategory][key].tax
                    };
                    prices.push(temp);
                    depotQuantities[products[superCategory][key].depot_id] = products[superCategory][key].quantity;
                }
            }
            var totalAmount = 0;
            var totalTax = 0;
            for (var i = 0; i < prices.length; i++) {
                totalAmount = totalAmount + parseFloat(prices[i].price) * depotQuantities[prices[i].id];
                if (prices[i].tax) {
                    totalTax = totalTax + parseFloat(prices[i].price) * depotQuantities[prices[i].id] * albertaGst;
                }
            }
            // Calculating math numbers
            totalAmount = Math.round(totalAmount * 100) / 100;
            var deliveryFee = deliveryFee1;
            if (totalAmount > 100) {
                deliveryFee = deliveryFee1 + deliveryFee2;
            }
            totalTax = Math.round((totalTax + deliveryFee * albertaGst) * 100) / 100;
            var totalPrice = totalAmount + deliveryFee + totalTax;

            // Updating display variables
            totalTax = totalTax.toFixed(2);
            totalAmount = totalAmount.toFixed(2);
            totalPrice = totalPrice.toFixed(2);

            $scope.delFee = deliveryFee;
            $scope.totalAmount = totalAmount;
            $scope.GST = totalTax;
            $scope.receipt = totalPrice;
        };

    });