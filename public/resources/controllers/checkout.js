app.controller("checkoutController",
    function ($scope, $http, $location, $rootScope, $cookies, $window, $mdSidenav,
        $log, localStorage, cartService, sessionStorage, date, mapServices, $sce, $interval, googleAnalytics, $timeout, user, $injector) {

        $scope.userInfo = {};


        $scope.init = function () {
            $scope.userCart = localStorage.getUserCart() || {};

            $scope.numberOfItemsInCart = 0;
            $scope.totalAmount = 0;
            $scope.delFee = 0;
            $scope.GST = 0;
            $scope.receipt = 0;
            $scope.userSignedIn = false;
            $scope.dob_not_valid = undefined;

            $scope.paymentResult = "";
            $scope.paymentMessage_1 = "";
            $scope.paymentMessage_2 = "";

            $scope.stripeToken = $("#stripeToken").val();

            $scope.checkout = this;

            $scope.checkout.getCheckoutUserInfo = sessionStorage.getCheckoutUserInfo();
            if ($scope.checkout.getCheckoutUserInfo != "undefined" && $scope.checkout.getCheckoutUserInfo != null && $scope.checkout.getCheckoutUserInfo != "") {
                $scope.userInfo = $scope.checkout.getCheckoutUserInfo;
            }

            // TODO: Jeyhun, Elnar please take a look. this gives an error 
            // Check for user, if logged in populate 
            user.user().then(function (res) {
                let hasLiquor = $scope.userInfo.hasLiquor;
                if (res.data.success) {
                    $scope.userInfo = res.data.user;
                    if ($scope.userInfo.phone_number) {
                        $scope.userInfo.phone_number = $scope.userInfo.phone_number.replace(/^(\d{3})(\d{3})(\d{4}).*/, '($1) $2-$3');
                    }
                    $scope.userSignedIn = true;
                    if (res.data.user.address && res.data.user.address_latitude && res.data.user.address_longitude){
                        if (!res.data.user.address_unit_number){
                            res.data.user.address_unit_number = "";
                        }

                        $scope.userInfo.address = res.data.user.address;
                        $scope.userInfo.address_unit_number = res.data.user.address_unit_number;
                        if (!$scope.userInfo.address_unit_number){
                            $scope.userInfo.address_unit_number = "";
                        }
                    }

                    $scope.userInfo.dateOfBirth = res.data.user.dob;

                    if ($scope.userInfo.card){
                        $scope.useDefaultCard = true;
                    }
                }
                $scope.userInfo.hasLiquor = hasLiquor;

                if (sessionStorage.getAddress()) {
                    if(sessionStorage.getAddressUnitNumber()){
                        $scope.userInfo.address_unit_number = sessionStorage.getAddressUnitNumber();
                    } else{
                        $scope.userInfo.address_unit_number = "";
                    }
                    $scope.userInfo.address = sessionStorage.getAddress().formatted_address;
                    $scope.userInfo.address_latitude = sessionStorage.getAddressLat();
                    $scope.userInfo.address_longitude = sessionStorage.getAddressLng();
                }

                var addrInterval = $interval(function(){
                    if ($injector.has('addressAutocompleteDirective')){
                        $interval.cancel(addrInterval);
                        if ($scope.userInfo.address){
                            // formatted_address from google returns 
                            if (_.startsWith($scope.userInfo.address, $scope.userInfo.address_unit_number)){
                                $scope.userInfo.address = _.trimStart(_.replace($scope.userInfo.address, $scope.userInfo.address_unit_number, ""));
                            }
                            $scope.autocomplete.setText(_.trimStart($scope.userInfo.address_unit_number + " " + $scope.userInfo.address));
                        }
                    }
                }, 100);
            }, function (err) {
                // Nothing to do
            });


            $timeout(function () {
                mapServices.createCoveragePolygon().then(function (polygon) {
                    if (polygon) {
                        $scope.coveragePolygon = polygon;
                        //TODO: change to dynamic
                        $scope.bounds = new google.maps.LatLngBounds({ lat: 50.862122, lng: -114.173317 }, { lat: 51.172396, lng: -113.925171 });
                        //Checks if address within coverage area
                        var latLng = $scope.autocomplete.getLatLng();
                        $scope.userInfo.withinCoverage = mapServices.isPlaceInsidePolygon(latLng, polygon);
                    }
                });
            }, 500);

            cartService.getCart()
            .then(function successCallback(response) {
                if (response.data.success === true) {
                    updateUserCart(cartService.mergeCarts($scope.userCart, response.data.cart));
                } else {
                    updateUserCart(cartService.mergeCarts(localStorage.getUserCart(), {})); //REQUIRED to convert to new convention with store_type
                }
                localStorage.setUserCart({});

                $scope.stores = [];
                let storeKeys = Object.keys($scope.userCart);
                for (let i = 0; i < storeKeys.length; i++){
                    $scope.stores.push({
                        type: storeKeys[i]
                    });
                }

                $http({
                    method: 'POST',
                    url: "/api/checkout/checkout",
                    data: {
                        products: Object.keys(cartService.parseCartToSend($scope.userCart))
                    }
                }).then(function successCallback(response) {
                    var checkedItems = response.data;
                    for (var store_type in $scope.userCart) {
                        for (var a in $scope.userCart[store_type]) {
                            $scope.totalAmount = $scope.totalAmount + ($scope.userCart[store_type][a].quantity * $scope.userCart[store_type][a].price);
                            $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.userCart[store_type][a].quantity;
                            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                            $scope.prepareItemForDB(a, $scope.userCart[store_type][a].quantity);

                            $scope.userCart[store_type][a]["store_open"] = checkedItems.products[store_type][a];
                        }
                    }
                    if ($scope.userCart.hasOwnProperty("liquor-station")) {
                        $scope.userInfo.hasLiquor = true;
                    } else {
                        $scope.userInfo.dob_not_valid = false;
                    }

                }, function errorCallback(response) {
                });

                // Calculation For receipt
                $scope.updatePrices($scope.userCart);

            }, function errorCallback(response) {
                updateUserCart(localStorage.getUserCart());
            });
        };

        $scope.plusItem = function (product) {
            var tmpQuantity = 1;
            if ($scope.userCart.hasOwnProperty(product.store_type_api_name) && $scope.userCart[product.store_type_api_name].hasOwnProperty(product.depot_id)) {
                var currentQuantity = $scope.userCart[product.store_type_api_name][product.depot_id].quantity;
                if (currentQuantity < 10) {
                    currentQuantity++;
                    $scope.userCart[product.store_type_api_name][product.depot_id].quantity = currentQuantity;
                    $scope.numberOfItemsInCart++;

                    updateUserCart($scope.userCart);
                    $scope.prepareItemForDB(product.depot_id, currentQuantity);
                    $scope.updatePrices($scope.userCart);
                    googleAnalytics.addEvent('plus_cart_item', {
                        "event_label": product.brand + " " + product.name,
                        "event_category": googleAnalytics.eventCategories.cart_actions
                    });
                }
            }
        };

        $scope.minusItem = function (product) {
            if ($scope.userCart.hasOwnProperty(product.store_type_api_name) && $scope.userCart[product.store_type_api_name].hasOwnProperty(product.depot_id)) {
                var currentQuantity = $scope.userCart[product.store_type_api_name][product.depot_id].quantity;
                if (currentQuantity > 1) {
                    currentQuantity--;

                    $scope.userCart[product.store_type_api_name][product.depot_id].quantity = currentQuantity;
                    $scope.numberOfItemsInCart--;
                    updateUserCart($scope.userCart);
                    $scope.prepareItemForDB(product.depot_id, currentQuantity);

                    $scope.updatePrices($scope.userCart);
                    googleAnalytics.addEvent('minus_cart_item', {
                        "event_label": product.brand + " " + product.name,
                        "event_category": googleAnalytics.eventCategories.cart_actions
                    });
                }
            }
        };

        $scope.prepareItemForDB = function (depot_id, itemQuantity) {
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

        $scope.submitCheckout = function (valid) {
            if ($scope.userInfo.dob_not_valid) {
                $("#date_of_birth").click();
                return;
            } 
            
            if (!($scope.userInfo.address && $scope.userInfo.address_latitude && $scope.userInfo.address_longitude)){
                if (!$scope.userInfo.withinCoverage) {
                    $("#autocompleteAddressInputBox").click();
                    return;
                }
            }

            if (valid) {
                if ($scope.useDefaultCard){ 
                    $scope.HomeIt(1); // 1 for default payment option, TODO: could be better implemented
                    return;
                }

                var handler = StripeCheckout.configure({
                    key: $scope.stripeToken,
                    image: '/resources/images/non-catalog-image/homit_logo/H-logo_stripe.png',
                    locale: 'auto',
                    token: function (token) {
                        if (token.id) {
                            $scope.HomeIt(token.id);
                        }
                    }
                });

                // Open Checkout with further options:
                handler.open({
                    name: 'Homit Payment',
                    currency: 'cad',
                    amount: $scope.receipt * 100,
                    allowRememberMe: false,
                    zipCode: true,
                    email: $scope.userInfo.user_email
                });

            }

            // Close Checkout on page navigation:
            window.addEventListener('popstate', function () {
                handler.close();
            });
        };

        $scope.HomeIt = function (tokenID) {

            googleAnalytics.addEvent('order_placed', {
                "event_label": "Homit pressed",
                "event_category": googleAnalytics.eventCategories.checkout_actions
            });

            activateCheckoutModal();
            updateCheckoutModal("inProcess");

            var userInfoToSend = {};

            userInfoToSend.fname = $scope.userInfo.first_name;
            userInfoToSend.lname = $scope.userInfo.last_name;
            userInfoToSend.phone = $scope.userInfo.phone_number.replace(/[() +-]/g, "");
            userInfoToSend.email = $scope.userInfo.user_email;
            if ($scope.userInfo.hasLiquor) {
                userInfoToSend.birth_month = parseInt($scope.userInfo.dateOfBirth.split("-")[0]);
                userInfoToSend.birth_day = parseInt($scope.userInfo.dateOfBirth.split("-")[1]);
                userInfoToSend.birth_year = parseInt($scope.userInfo.dateOfBirth.split("-")[2]);
            }


            if (sessionStorage.getAddress()) {
                if(sessionStorage.getAddressUnitNumber()){
                    $scope.userInfo.address_unit_number = sessionStorage.getAddressUnitNumber();
                } else{
                    $scope.userInfo.address_unit_number = "";
                }
                $scope.userInfo.address = sessionStorage.getAddress().formatted_address;
                $scope.userInfo.address_latitude = sessionStorage.getAddressLat();
                $scope.userInfo.address_longitude = sessionStorage.getAddressLng();
            } 

            if($scope.userInfo.address_unit_number && $scope.userInfo.address_unit_number != ""){
                userInfoToSend.unit_number = $scope.userInfo.address_unit_number;
                userInfoToSend.address = _.trim(_.trimStart($scope.userInfo.address, userInfoToSend.unit_number));
                userInfoToSend.address_latitude = $scope.userInfo.address_latitude;
                userInfoToSend.address_longitude = $scope.userInfo.address_longitude;
                if ($scope.userInfo.drInstruction) {
                    userInfoToSend.driver_instruction = $scope.userInfo.drInstruction + "; Unit Number: " + userInfoToSend.unit_number;
                } else if(userInfoToSend.unit_number && userInfoToSend.unit_number != "") {
                    userInfoToSend.driver_instruction = "Unit Number: " + userInfoToSend.unit_number;
                }
            } else{
                userInfoToSend.driver_instruction = $scope.userInfo.drInstruction;
                userInfoToSend.address = $scope.userInfo.address;
                userInfoToSend.address_latitude = $scope.userInfo.address_latitude;
                userInfoToSend.address_longitude = $scope.userInfo.address_longitude;
            }

            let scheduled_delivery = localStorage.getOrderDeliveryHrs();
            let order_scheduled_time = {};
            for(let store in scheduled_delivery){
                order_scheduled_time[store] = scheduled_delivery[store].value;
            }
            $http({
                method: 'POST',
                url: '/api/checkout/placeorder',
                data: {
                    user: userInfoToSend,
                    products: cartService.parseCartToSend($scope.userCart),
                    token_id: tokenID,
                    schedule_details: order_scheduled_time
                }
            }).then(function successCallback(response) {
                if (!response.data.success) {
                    $scope.paymentMessage_1 = "We are sorry, ";
                    $scope.paymentMessage_2 = response.data.error.message;
                    updateCheckoutModal("10");
                    return;
                }

                localStorage.clearAfterCheckout();
                sessionStorage.clearAfterCheckout();

                $scope.paymentMessage_1 = "Thank You, ";
                $scope.paymentMessage_2 = "Homit will take care!";
                $scope.paymentMessage_3 = "ASAP orders will be delivered in 30 - 45 mins";
                updateCheckoutModal("1");

            }, function errorCallback(error) {
                // for 4xx, 5xx response calls
                if (error) {
                    $scope.paymentMessage_1 = "We are sorry, ";
                    $scope.paymentMessage_2 = "Something went wrong while processing your order, please contact us at +1(403) 800-3460.";
                    updateCheckoutModal("10");
                    return;
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
            if (type == "0" || type == "01" || type == "02") {
                sessionStorage.setCheckoutUserInfo($scope.userInfo);
            }
            setTimeout(function () {
                $scope.$apply();
            }, 100);
        }

        $scope.updatePrices = function (products) {
            var prices = $scope.calculatePrice(products);

            // Updating display variables
            $scope.delFee = prices.delivery_fee.toFixed(2);
            $scope.totalAmount = prices.cart_amount.toFixed(2);
            $scope.GST = prices.total_tax.toFixed(2);
            $scope.receipt = prices.total_price.toFixed(2);
        };

        $scope.gotAddressResults = function () {
            var latLng = $scope.autocomplete.getLatLng();
            var place = $scope.autocomplete.getPlace();
            if (mapServices.isPlaceInsidePolygon(latLng, $scope.coveragePolygon)) {
                sessionStorage.setAddress(place);
                sessionStorage.setAddressLat(latLng.lat());
                sessionStorage.setAddressLng(latLng.lng());
                $scope.checkout.address_latitude = latLng.lat();
                $scope.checkout.address_longitude = latLng.lng();
                $scope.checkout.address = $scope.autocomplete.getText();
                $scope.userInfo.withinCoverage = true;
            } else {
                $scope.userInfo.withinCoverage = false;
                googleAnalytics.addEvent('out_of_coverage', {
                    "event_label": place.formatted_address,
                    "event_category": googleAnalytics.eventCategories.address_actions
                });
            }
        };

        $scope.clearText = function () {
            $scope.userInfo.address_valid = undefined;
        };

        /* Helper functions */
        $scope.checkDOB = function (dob) {
            if (!date.isOver18Years(dob)) {
                $scope.userInfo.dob_not_valid = true;
            } else {
                $scope.userInfo.dob_not_valid = false;
            }
        };

        function updateUserCart(cart) {
            $scope.userCart = cart;
            $scope.userCartToView = cartService.getViewUserCart($scope.store_type, $scope.userCart);
        }

        $scope.clearPage = function () {
            if ($scope.paymentResult == "11" || $scope.paymentResult == "1") {
                $scope.userInfo = {};
                updateUserCart({});
                sessionStorage.setAddress("");
                sessionStorage.setAddressUnitNumber("");
                cartService.clearCart()
                .then(function successCallback(response) {
                    if (response.data.error && response.data.error.code == "C001") { // use local storage
                        localStorage.setUserCart($scope.userCart);
                    }
                    $window.location.href = $window.location.origin + "/main";
                }, function errorCallback(response) {
                    console.log.log("ERROR");
                });
            } else {
                location.reload();
            }
        };

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

        jQuery(function ($) {
            $("#gP_number").mask("(999) 999-9999");
            $("#date_of_birth").mask("99-99-9999");
        });

        /*
         * These variables are taken from B.E.
         * Do NOT modify them
        */
        const ALBERTA_GST = 0.05;
        const DELIVERY_FEE_1 = 4.99;
        const DELIVERY_FEE_2 = 2.99;

        /**
         * This method is same as the one in B.E.
         * This method should NOT be modified
         * 
         * @param {*} products 
         */
        $scope.calculatePrice = function (products) {
            var pricesPerOrder = {};

            var totalAmount = 0;
            var totalTax = 0;
            var totalDelivery = 0;
            var totalPrice = 0;

            for (let storeType in products) {
                var tmpAmount = 0;
                var tmpTax = 0;
                for (let item in products[storeType]) {
                    tmpAmount = tmpAmount + parseFloat(products[storeType][item].price) * products[storeType][item].quantity;
                    if (products[storeType][item].tax) {
                        tmpTax = tmpTax + parseFloat(products[storeType][item].price) * products[storeType][item].quantity * ALBERTA_GST;
                    }
                }
                var tmpDelivery = DELIVERY_FEE_1 + Math.floor(parseInt(tmpAmount / 100)) * DELIVERY_FEE_2;
                tmpTax = Math.round((tmpTax + tmpDelivery * ALBERTA_GST) * 100) / 100;

                tmpTax = parseFloat(tmpTax.toFixed(2));
                tmpAmount = parseFloat(tmpAmount.toFixed(2));
                tmpDelivery = parseFloat(tmpDelivery.toFixed(2));

                var tmpTotalPrice = tmpTax + tmpAmount + tmpDelivery;

                pricesPerOrder[storeType] = {
                    "cart_amount": tmpAmount,
                    "delivery_fee": tmpDelivery,
                    "total_tax": tmpTax,
                    "total_price": tmpTotalPrice
                };

                totalAmount = totalAmount + tmpAmount;
                totalTax = totalTax + tmpTax;
                totalDelivery = totalDelivery + tmpDelivery;
                totalPrice = totalPrice + tmpTotalPrice;
            }

            var finalPrices = {
                "cart_amount": totalAmount,
                "delivery_fee": totalDelivery,
                "total_tax": totalTax,
                "total_price": totalPrice,
                "order_prices": pricesPerOrder
            };

            return finalPrices;
        };

        $scope.cardCheckbox = function(){
            $scope.useDefaultCard = !$scope.useDefaultCard;
        };

        $scope.init();

    });