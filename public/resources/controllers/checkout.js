// import { clearInterval } from "timers";

app.controller("checkoutController",
    function ($scope, $http, $location, $rootScope, $cookies, $window, $timeout, $mdSidenav, $log, advancedStorage, cartService, storage, date) {

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

        $scope.b_years = date.getYears();
        $scope.b_months = date.getMonths();
        $scope.b_days = date.getDays($scope.userInfo.birth_month, $scope.userInfo.birth_year);

        $scope.updateBDays = function(){
            $scope.b_days = date.getDays($scope.userInfo.birth_month, $scope.userInfo.birth_year);
        }

        $scope.init = function () {
            checkout.getCheckoutUserInfo = storage.getCheckoutUserInfo();
            $scope.userInfo.cardText = "Credit card";
            $scope.selectedAddress = 0;
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
            if (checkout.getCheckoutUserInfo != "undefined") {
                $scope.userInfo = checkout.getCheckoutUserInfo;
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
                console.log("error");
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
                    console.log.log("ERROR");
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
                    console.log("ERROR");
                });

            // Calculation For receipt
            $scope.updatePrices($scope.userCart);
        }
        $scope.userInfo.cardIsShown = false;

        function checkPaymentResponse(callback) {
            function looper() {
                setTimeout(() => {
                    var helcim_message = document.getElementById("helcimResults");
                    var response_id = document.getElementById("response");
                    var response_message = document.getElementById("responseMessage");
                    var transaction_id = document.getElementById("transactionId");
                    if (response_id || helcim_message.textContent != "CONNECTING...") {
                        if (response_id) {
                            if (response_id.value == 1) {
                                callback(response_id.value, response_message.value, transaction_id.value);
                            } else if (response_id.value == 0) {
                                callback(response_id.value, response_message.value, 0);
                            }
                        } else if (helcim_message.childNodes.length == 1) {
                            callback(0, 0, 0);
                        }
                    } else {
                        looper();
                    }
                }, 500);
            }
            looper();
        }

        $scope.paymentResult = "";
        $scope.paymentMessage_1 = "";
        $scope.paymentMessage_2 = "";

        $scope.HomeIt = function () {
            activateCheckoutModal();
            updateCheckoutModal("inProcess");
            checkPaymentResponse(function (response_id, response_message, transaction_id) {
                if (response_id == 1 && transaction_id) {
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
                        $scope.paymentMessage_1 = "Thank You, ";
                        $scope.paymentMessage_2 = "Homit will take care!";
                        updateCheckoutModal("1");
                    }, function errorCallback(response) {
                        $scope.paymentMessage_1 = "We are sorry, "
                        $scope.paymentMessage_2 = "Something went wrong while processing your order, please contact us at +1(403)40-Homit.";
                        updateCheckoutModal("10");
                        console.log("ERROR in order processing");
                    });
                } else if (response_id == 0 && response_message == 0 && transaction_id == 0) {
                    updateCheckoutModal("0");
                } else if (response_id == 0 && response_message == "Duplicate Payment") {
                    $scope.paymentMessage_1 = "Thank You, ";
                    $scope.paymentMessage_2 = "You order already processed.";
                    updateCheckoutModal("1");
                }
            });
        }

        function activateCheckoutModal() {
            $('#checkoutModal').modal('toggle');
            $('#checkoutModal').modal('show');
        }
        function updateCheckoutModal(type) {
            $scope.paymentResult = type;
            $('#checkoutModal').modal();
            if (type == "0") {
                $('#checkoutModal').click();
                $scope.userInfo.card = type;
                $scope.userInfo.cardText = "Credit card error";
                storage.setCheckoutUserInfo($scope.userInfo);
                location.reload();
            }
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
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug("toggle " + navID + " is done");
                    });
            }, 200);
        }
        $scope.close = function () {
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

        function clearPage() {
            $scope.userInfo = {};
            $scope.userCart = {};
            $scope.delFee = 0;
            $scope.totalAmount = 0;
            $scope.GST = 0;
            $scope.receipt = 0;
            location.reload();
        }

        $scope.init();

    });