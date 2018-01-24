app.controller("checkoutController",
    function ($scope, $http, $location, $rootScope, $cookies, $window, $timeout, $mdSidenav, $log, localStorage, cartService, sessionStorage, date, mapServices) {

        $scope.userCart = localStorage.getUserCart() || {};
        $scope.numberOfItemsInCart = 0;
        $scope.totalAmount = 0;
        $scope.delFee = 0;
        $scope.GST = 0;
        $scope.receipt = 0;
        $scope.userSignedIn = false;
        $scope.userInfo = {
            "fname_valid": false,
            "lname_valid": false,
            "email_valid": false,
            "phone_valid": false,
            "dob_valid": undefined,
            "cd_1_valid": false,
            "cd_2_valid": false,
            "cd_3_valid": false,
            "drInstruction_valid": undefined,
            "address_valid": undefined,
            "HomeIt": false
        };

        $scope.isUserSigned = undefined;
        $scope.orderer = {};

        var checkout = this;

        $scope.b_years = date.getYears();
        $scope.b_months = date.getMonths();
        $scope.b_days = date.getDays($scope.userInfo.birth_month, $scope.userInfo.birth_year);

        $scope.init = function () {
            checkout.getCheckoutUserInfo = sessionStorage.getCheckoutUserInfo();
            if ($cookies.get("user")) {
                $scope.userInfo = JSON.parse($cookies.get("user").replace("j:", ""));
                $scope.userSignedIn = true;
                //TODO sub if's with for loop
                if ($scope.userInfo.first_name)
                    $scope.userInfo.fname_valid = true;
                if ($scope.userInfo.last_name)
                    $scope.userInfo.lname_valid = true;
                if ($scope.userInfo.phone_number)
                    $scope.userInfo.phone_valid = true;
                if ($scope.userInfo.user_email)
                    $scope.userInfo.email_valid = true;
                if ($scope.userInfo.birth_day && $scope.userInfo.birth_month && $scope.userInfo.birth_year)
                    $scope.userInfo.dob_valid = true;
            } else {
                $scope.isUserSigned = false;
            }
            if (checkout.getCheckoutUserInfo != "undefined" && checkout.getCheckoutUserInfo != null) {
                $scope.userInfo = checkout.getCheckoutUserInfo;
            }
            if (sessionStorage.getAddress()) {
                checkout.address = sessionStorage.getAddress();
                checkout.address_latitude = sessionStorage.getAddressLat();
                checkout.address_longitude = sessionStorage.getAddressLng();
                $scope.userInfo.address_valid = true;
            }
            mapServices.createCoveragePolygon().then(function (polygon) {
                if (polygon) {
                    $scope.coveragePolygon = polygon;
                    //TODO: change to dynamic
                    $scope.bounds = new google.maps.LatLngBounds({ lat: 50.862122, lng: -114.173317 }, { lat: 51.172396, lng: -113.925171 });
                }
            });
            readyToHomeIt();
        };

        cartService.getCart()
            .then(function successCallback(response) {
                if (response.data.success === true) {
                    updateUserCart(cartService.mergeCarts($scope.userCart, response.data.cart));
                } else {
                    updateUserCart(cartService.mergeCarts(localStorage.getUserCart(), {})); //REQUIRED to convert to new convention with super_category
                }
                localStorage.setUserCart({});

                for (var super_category in $scope.userCart) {
                    for (var a in $scope.userCart[super_category]) {
                        $scope.totalAmount = $scope.totalAmount + ($scope.userCart[super_category][a].quantity * $scope.userCart[super_category][a].price);
                        $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.userCart[super_category][a].quantity;
                        $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                        $scope.prepareItemForDB(a, $scope.userCart[super_category][a].quantity);
                    }
                    if (super_category == "liquor-station") {
                        $scope.userInfo.hasLiquor = true;
                    }
                }

                // Calculation For receipt
                $scope.updatePrices($scope.userCart);

            }, function errorCallback(response) {
                updateUserCart(localStorage.getUserCart());
                console.log("error");
            });

        $scope.plusItem = function (product) {
            var tmpQuantity = 1;
            if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
                var currentQuantity = $scope.userCart[product.super_category][product.depot_id].quantity;
                if (currentQuantity < 10) {
                    currentQuantity++;
                    $scope.userCart[product.super_category][product.depot_id].quantity = currentQuantity;
                    $scope.numberOfItemsInCart++;

                    updateUserCart($scope.userCart);
                    $scope.prepareItemForDB(product.depot_id, currentQuantity);
                    $scope.updatePrices($scope.userCart);
                }
            }
        };

        $scope.minusItem = function (product) {
            if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
                var currentQuantity = $scope.userCart[product.super_category][product.depot_id].quantity;
                if (currentQuantity > 1) {
                    currentQuantity--;

                    $scope.userCart[product.super_category][product.depot_id].quantity = currentQuantity;
                    $scope.numberOfItemsInCart--;
                    updateUserCart($scope.userCart);
                    $scope.prepareItemForDB(product.depot_id, currentQuantity);

                    $scope.updatePrices($scope.userCart);
                }
            }
        };

        $scope.clearCart = function (product) {
            updateUserCart({});
            $scope.numberOfItemsInCart = 0;
            $scope.totalAmount = 0;

            cartService.clearCart()
                .then(function successCallback(response) {
                    if (response.data.error && response.data.error.code == "C001") { // use local storage
                        localStorage.setUserCart($scope.userCart);
                    }
                }, function errorCallback(response) {
                    console.log.log("ERROR");
                });
        };

        $scope.removeFromCart = function (product) {
            if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
                delete $scope.userCart[product.super_category][product.depot_id];

                // if super_category doesn't contain objects, then remove from list
                if (Object.entries($scope.userCart[product.super_category]).length == 0) {
                    delete $scope.userCart[product.super_category];
                }

                updateUserCart($scope.userCart);
                $scope.numberOfItemsInCart = $scope.numberOfItemsInCart - product.quantity;
                $scope.prepareItemForDB(product.depot_id, 0);

                $scope.updatePrices($scope.userCart);
            }
        };

        $scope.prepareItemForDB = function (depot_id, itemQuantity, action) {
            cartService.modifyCartItem(depot_id, itemQuantity)
                .then(function successCallback(response) {
                    if (response.data.error && response.data.error.code == "C001") { // use local storage
                        localStorage.setUserCart($scope.userCart);
                    }
                }, function errorCallback(response) {
                    console.log("ERROR");
                });

            // Calculation For receipt
            $scope.updatePrices($scope.userCart);
        };

        $scope.userInfo.cardIsShown = false;

        function checkPaymentResponse(callback) {
            function looper() {
                setTimeout(function () {
                    var helcim_message = document.getElementById("helcimResults");
                    var response_id = document.getElementById("response");
                    var response_message = document.getElementById("responseMessage");
                    var transaction_id = document.getElementById("transactionId");
                    var crd_lst4 = document.getElementById("cardNumber");
                    if (response_id || helcim_message.textContent != "CONNECTING...") {
                        if (response_id) {
                            if (response_id.value == 1) {
                                callback(response_id.value, response_message.value, transaction_id.value, crd_lst4.value.slice(15, 19));
                            } else if (response_id.value == 0) {
                                callback(response_id.value, response_message.value, 0, 0);
                            }
                        } else if (helcim_message.childNodes.length == 1) {
                            callback(0, 0, 0, 0);
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
            checkPaymentResponse(function (response_id, response_message, transaction_id, crd_lst4) {
                if (response_id == 1 && transaction_id) {
                    var userInfoToSend = {};

                    userInfoToSend.fname = $scope.userInfo.first_name;
                    userInfoToSend.lname = $scope.userInfo.last_name;
                    userInfoToSend.birth_year = $scope.userInfo.birth_year;
                    userInfoToSend.birth_month = date.convertMonth($scope.userInfo.birth_month);
                    userInfoToSend.birth_day = $scope.userInfo.birth_day;
                    userInfoToSend.phone = $scope.userInfo.phone_number.replace(/[() +-]/g, "");
                    userInfoToSend.email = $scope.userInfo.user_email;
                    userInfoToSend.address = checkout.address;
                    userInfoToSend.address_latitude = checkout.address_latitude;
                    userInfoToSend.address_longitude = checkout.address_longitude;
                    userInfoToSend.driver_instruction = $scope.userInfo.drInstruction;

                    $http({
                        method: 'POST',
                        url: '/api/checkout/placeorder',
                        data: {
                            user: userInfoToSend,
                            products: cartService.parseCartToSend($scope.userCart),
                            transaction_id: transaction_id,
                            crd_lst4: crd_lst4
                        }
                    }).then(function successCallback(response) {
                        $scope.paymentMessage_1 = "Thank You, ";
                        $scope.paymentMessage_2 = "Homit will take care!";
                        updateCheckoutModal("1");
                    }, function errorCallback(response) {
                        $scope.paymentMessage_1 = "We are sorry, ";
                        $scope.paymentMessage_2 = "Something went wrong while processing your order, please contact us at +1(403)40-Homit.";
                        updateCheckoutModal("10");
                        console.log("ERROR in order processing");
                    });
                } else if (response_id == 0 && response_message == 0 && transaction_id == 0 && crd_lst4 == 0) {
                    $scope.paymentMessage_1 = "Sorry, ";
                    $scope.paymentMessage_2 = "Card error, please try again.";
                    updateCheckoutModal("0");
                } else if (response_id == 0 && response_message == "Duplicate Payment") {
                    $scope.paymentMessage_1 = "Thank You, ";
                    $scope.paymentMessage_2 = "You order already processed.";
                    updateCheckoutModal("11");
                } else if (response_id == 0 && response_message == "ERROR - TERMINAL ID INACTIVE9405") {
                    $scope.paymentMessage_1 = "Sorry, ";
                    $scope.paymentMessage_2 = "Your card has been declined.";
                    updateCheckoutModal("01");
                }
            });
        };

        function activateCheckoutModal() {
            $('#checkoutModal').modal('toggle');
            $('#checkoutModal').modal('show');
        }

        function updateCheckoutModal(type) {
            $scope.paymentResult = type;
            $('#checkoutModal').modal();
            if (type == "0" || type == "01") {
                sessionStorage.setCheckoutUserInfo($scope.userInfo);
            }
            setTimeout(function(){
                $scope.$apply();            
            }, 100);
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
            var deliveryFee;
            if (totalAmount > 100) {
                deliveryFee = deliveryFee1 + deliveryFee2;
            } else if (totalAmount > 0 && totalAmount < 100) {
                deliveryFee = deliveryFee1;
            } else {
                deliveryFee = 0.00;
            }
            totalTax = Math.round((totalTax + deliveryFee * albertaGst) * 100) / 100;
            var totalPrice = totalAmount + deliveryFee + totalTax;

            // Updating display variables
            totalTax = totalTax.toFixed(2);
            totalAmount = totalAmount.toFixed(2);
            totalPrice = totalPrice.toFixed(2);
            deliveryFee = deliveryFee.toFixed(2);

            $scope.delFee = deliveryFee;
            $scope.totalAmount = totalAmount;
            $scope.GST = totalTax;
            $scope.receipt = totalPrice;
        };

        $scope.updateBDays = function () {
            $scope.b_days = date.getDays($scope.userInfo.birth_month, $scope.userInfo.birth_year);
        };

        $scope.checkUserAge = function () {
            if ($scope.userInfo.birth_day && $scope.userInfo.birth_month && $scope.userInfo.birth_year) {
                $scope.userInfo.dob_valid = date.isOver18Years($scope.userInfo.birth_day, $scope.userInfo.birth_month, $scope.userInfo.birth_year);
                if (!$scope.userInfo.dob_valid) {
                    $scope.userInfo.dob_diff = date.dayDifference($scope.userInfo.birth_day, $scope.userInfo.birth_month, $scope.userInfo.birth_year);
                }
            }
            readyToHomeIt();
        };

        $scope.sanitizeInput = function (text, type) {
            var pattern = { "fname": /^[a-zA-Z]*$/, "lname": /^[a-zA-Z]*$/, "email": /^.+@.+\..+$/, "phone": /^[0-9()+ -]*$/, "cd_1": /^[0-9]*$/, "cd_2": /^[0-9]*$/, "cd_3": /^[0-9]*$/, "drInstruction": /^[a-zA-Z0-9 -]*$/ };
            if (text && type) {
                if (text.match(pattern[type])) {
                    $scope.userInfo[type + "_valid"] = true;
                }
                else {
                    $scope.userInfo[type + "_valid"] = false;
                }
            }else if(text == undefined){
                $scope.userInfo[type + "_valid"] = false;
            }
            readyToHomeIt();
        };

        $scope.gotAddressResults = function () {
            var latLng = $scope.autocomplete.getLatLng();
            if (mapServices.isPlaceInsidePolygon(latLng, $scope.coveragePolygon)) {
                sessionStorage.setAddress($scope.autocomplete.getPlace());
                sessionStorage.setAddressLat(latLng.lat());
                sessionStorage.setAddressLng(latLng.lng());
                checkout.address_latitude = latLng.lat();
                checkout.address_longitude = latLng.lng();
                checkout.address = $scope.autocomplete.getText();
                $scope.userInfo.address_valid = true;
            } else {
                $scope.userInfo.address_valid = false;
            }
            readyToHomeIt();
        };

        jQuery(function ($) {
            $("#gP_number").mask("(999) 999-9999");
        });

        $scope.clearText = function () {
            $scope.userInfo.address_valid = undefined;
        };

        function readyToHomeIt() {
            if ($scope.userInfo.fname_valid && $scope.userInfo.lname_valid && ($scope.userInfo.dob_valid || !$scope.userInfo.hasLiquor) && $scope.userInfo.email_valid && $scope.userInfo.phone_valid && $scope.userInfo.cd_1_valid && $scope.userInfo.cd_2_valid && $scope.userInfo.address_valid && ($scope.userInfo.drInstruction_valid == false || $scope.userInfo.drInstruction_valid == undefined)) {
                $scope.userInfo.HomeIt = true;
            } else {
                $scope.userInfo.HomeIt = false;
            }
        }

        $scope.clearPage = function () {
            if ($scope.paymentResult != "0") {
                $scope.userInfo = {};
                $scope.userCart = {};
                $scope.clearCart();
                $scope.delFee = 0;
            }
            location.reload();
        }

        function updateUserCart(cart) {
            $scope.userCart = cart;
            $scope.userCartToView = cartService.getViewUserCart($scope.super_category, $scope.userCart);
        }

        $scope.init();
    });