app.controller("checkoutController",
    function ($scope, $http, $location, $rootScope, $cookies, $window, $timeout, $mdSidenav,
        $log, localStorage, cartService, sessionStorage, date, mapServices, $sce, $interval, googleAnalytics, $timeout) {

        $scope.init = function () {
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
                "billigAddresSame": true,
                "cardHolderName_valid": false,
                "cardHolderAddress_valid": false,
                "cardHolderPostalCode_valid": false,
                "phone_valid": false,
                "dob_valid": undefined,
                "cd_1_valid": false,
                "cd_2_valid": false,
                "cd_3_valid": false,
                "drInstruction_valid": undefined,
                "address_valid": undefined,
                "HomeIt": false
            };

            $scope.validCardInfo = undefined;

            $scope.userInfo.cardIsShown = false;

            $scope.paymentResult = "";
            $scope.paymentMessage_1 = "";
            $scope.paymentMessage_2 = "";


            /**** Stripe.js logic starts here ****/

            // Custom styling can be passed to options when creating an Element.
            var style = {
                base: {
                    color: '#32325d',
                    lineHeight: '18px',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#fa755a',
                    iconColor: '#fa755a'
                }
            };


            var stripeToken = $("#stripeToken").val();
            $scope.stripe = Stripe(stripeToken);
            var elements = $scope.stripe.elements();

            $scope.card = elements.create('card', {
                style: style,
                hidePostalCode: true
            });

            // Add an instance of the card Element into the `card-element` <div>.
            $scope.card.mount('#card');

            //To help our customers catch mistakes, we should listen to change events 
            //on the card "Element" and display any errors
            $scope.card.addEventListener('change', function (event) {
                var displayError = document.getElementById('card-errors');
                if (event.error) {
                    displayError.textContent = event.error.message;
                    $scope.validCardInfo = false;
                } else {
                    displayError.textContent = '';
                    $scope.validCardInfo = true;
                }
            });



            /**** Stripe.js logic ends here ****/


            $scope.orderer = {};

            $scope.checkout = this;

            $scope.b_years = date.getYears();
            $scope.b_months = date.getMonths();
            $scope.b_days = date.getDays($scope.userInfo.birth_month, $scope.userInfo.birth_year);


            $scope.checkout.getCheckoutUserInfo = sessionStorage.getCheckoutUserInfo();
            if ($cookies.get("user")) {
                $scope.userInfo = JSON.parse($cookies.get("user").replace("j:", ""));
                $scope.userSignedIn = true;
                //TODO sub if's with for loop
                if ($scope.userInfo.first_name)
                    $scope.userInfo.fname_valid = true;
                if ($scope.userInfo.last_name)
                    $scope.userInfo.lname_valid = true;
                if ($scope.userInfo.phone_number) {
                    $scope.userInfo.phone_valid = true;
                }
                if ($scope.userInfo.user_email)
                    $scope.userInfo.email_valid = true;
                if ($scope.userInfo.birth_day && $scope.userInfo.birth_month && $scope.userInfo.birth_year)
                    $scope.userInfo.dob_valid = true;
            } else {
                $scope.userSignedIn = false;
            }
            if ($scope.checkout.getCheckoutUserInfo != "undefined" && $scope.checkout.getCheckoutUserInfo != null) {
                $scope.userInfo = $scope.checkout.getCheckoutUserInfo;
                $scope.userInfo.cardIsShown = false;
            }
            if (sessionStorage.getAddress()) {
                $scope.checkout.address = sessionStorage.getAddress().formatted_address;
                $scope.checkout.address_latitude = sessionStorage.getAddressLat();
                $scope.checkout.address_longitude = sessionStorage.getAddressLng();
                $scope.userInfo.address_valid = true;
            }
            mapServices.createCoveragePolygon().then(function (polygon) {
                if (polygon) {
                    $scope.coveragePolygon = polygon;
                    //TODO: change to dynamic
                    $scope.bounds = new google.maps.LatLngBounds({ lat: 50.862122, lng: -114.173317 }, { lat: 51.172396, lng: -113.925171 });
                }
            });
            // readyToHomeIt();
        };

        cartService.getCart()
            .then(function successCallback(response) {
                if (response.data.success === true) {
                    updateUserCart(cartService.mergeCarts($scope.userCart, response.data.cart));
                } else {
                    updateUserCart(cartService.mergeCarts(localStorage.getUserCart(), {})); //REQUIRED to convert to new convention with store_type
                }
                localStorage.setUserCart({});

                for (var store_type in $scope.userCart) {
                    for (var a in $scope.userCart[store_type]) {
                        $scope.totalAmount = $scope.totalAmount + ($scope.userCart[store_type][a].quantity * $scope.userCart[store_type][a].price);
                        $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.userCart[store_type][a].quantity;
                        $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                        $scope.prepareItemForDB(a, $scope.userCart[store_type][a].quantity);
                    }
                    if (store_type == "liquor-station") {
                        $scope.userInfo.hasLiquor = true;
                    }
                }

                // Calculation For receipt
                $scope.updatePrices($scope.userCart);

            }, function errorCallback(response) {
                updateUserCart(localStorage.getUserCart());
            });

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

        $scope.clearCart = function (product) {
            updateUserCart({});
            $scope.numberOfItemsInCart = 0;
            $scope.totalAmount = 0;

            sessionStorage.setAddress(undefined);
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
            if ($scope.userCart.hasOwnProperty(product.store_type_api_name) && $scope.userCart[product.store_type_api_name].hasOwnProperty(product.depot_id)) {
                delete $scope.userCart[product.store_type_api_name][product.depot_id];

                // if store_type doesn't contain objects, then remove from list
                if (Object.entries($scope.userCart[product.store_type_api_name]).length == 0) {
                    delete $scope.userCart[product.store_type_api_name];
                }

                updateUserCart($scope.userCart);
                $scope.numberOfItemsInCart = $scope.numberOfItemsInCart - product.quantity;
                $scope.prepareItemForDB(product.depot_id, 0);

                $scope.updatePrices($scope.userCart);

                googleAnalytics.addEvent('remove_from_cart', {
                    "event_label": product.brand + " " + product.name,
                    "event_category": googleAnalytics.eventCategories.cart_actions,
                    "items": [
                        {
                            name: product.name,
                            brand: product.brand,
                            price: product.price,
                            category: product.packaging,
                            variant: product.volume,
                        }
                    ]
                });
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

        $scope.submitCheckout = function (valid) {
            if (valid) $scope.HomeIt();
        }


        $scope.HomeIt = function () {
            readyToHomeIt();

            if (!$scope.userInfo.HomeIt) return;

            googleAnalytics.addEvent('order_placed', {
                "event_label": "Homit pressed",
                "event_category": googleAnalytics.eventCategories.checkout_actions
            });

            if ($scope.userInfo.billigAddresSame) {
                $("#cardHolderName").val($scope.userInfo.first_name + " " + $scope.userInfo.last_name);
                $("#cardHolderAddress").val(sessionStorage.getAddress().address_components[0].long_name + sessionStorage.getAddress().address_components[1].long_name);
                $("#cardHolderPostalCode").val(sessionStorage.getAddress().address_components[7].long_name);
            }

            activateCheckoutModal();
            updateCheckoutModal("inProcess");

            //Submit Stripe Information
            $scope.stripe.createToken($scope.card, {
                name: $("#cardHolderName").val(),
                address_line1: $("#cardHolderAddress").val(),
                address_zip: $("#cardHolderPostalCode").val(),

            }).then(function (result) {
                if (result.error) {
                    $scope.paymentMessage_1 = "We are sorry, ";
                    $scope.paymentMessage_2 = result.error.message;
                    updateCheckoutModal("10");
                    return;
                }

                var userInfoToSend = {};
                userInfoToSend.fname = $scope.userInfo.first_name;
                userInfoToSend.lname = $scope.userInfo.last_name;
                userInfoToSend.birth_year = $scope.userInfo.birth_year;
                userInfoToSend.birth_month = date.convertMonth($scope.userInfo.birth_month);
                userInfoToSend.birth_day = $scope.userInfo.birth_day;
                userInfoToSend.phone = $scope.userInfo.phone_number.replace(/[() +-]/g, "");
                userInfoToSend.email = $scope.userInfo.user_email;
                userInfoToSend.address = $scope.checkout.address;
                userInfoToSend.address_latitude = $scope.checkout.address_latitude;
                userInfoToSend.address_longitude = $scope.checkout.address_longitude;
                userInfoToSend.driver_instruction = $scope.userInfo.drInstruction;

                $http({
                    method: 'POST',
                    url: '/api/checkout/placeorder',
                    data: {
                        user: userInfoToSend,
                        products: cartService.parseCartToSend($scope.userCart),
                        token_id: result.token.id
                    }
                }).then(function successCallback(response) {
                    if (!response.data.success) {
                        $scope.paymentMessage_1 = "We are sorry, ";
                        $scope.paymentMessage_2 = response.data.error.message;
                        updateCheckoutModal("10");
                        return;
                    }

                    $scope.paymentMessage_1 = "Thank You, ";
                    $scope.paymentMessage_2 = "Homit will take care!";
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
                deliveryFee = deliveryFee1 + Math.floor(parseInt(totalAmount / 100)) * deliveryFee2;
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
        };

        $scope.sanitizeInput = function (text, type) {
            var pattern = { "fname": /^[a-zA-Z]*$/, "lname": /^[a-zA-Z]*$/, "email": /^.+@.+\..+$/, "phone": /^[0-9()+ -]*$/, "cd_1": /^[0-9]*$/, "cd_2": /^[0-9]*$/, "cd_3": /^[0-9]*$/, "drInstruction": /^[a-zA-Z0-9 -]*$/, "cardHolderName": /^[a-zA-Z ]*$/, "cardHolderAddress": /^[a-zA-Z0-9 -,.]*$/, "cardHolderPostalCode": /^[a-zA-Z0-9 ]*$/ };
            if (text && type) {
                if (text.match(pattern[type])) {
                    $scope.userInfo[type + "_valid"] = true;
                }
                else {
                    $scope.userInfo[type + "_valid"] = false;
                }
            } else if (text == undefined) {
                if ($("#driverInstruction").val() == "") {
                    $scope.userInfo[type + "_valid"] = true;
                } else {
                    $scope.userInfo[type + "_valid"] = false;
                }
            } else if (text == "" && type == "drInstruction") {
                $scope.userInfo[type + "_valid"] = true;
            }
        };

        $scope.gotAddressResults = function () {
            var latLng = $scope.autocomplete.getLatLng();
            if (mapServices.isPlaceInsidePolygon(latLng, $scope.coveragePolygon)) {
                sessionStorage.setAddress($scope.autocomplete.getPlace());
                sessionStorage.setAddressLat(latLng.lat());
                sessionStorage.setAddressLng(latLng.lng());
                $scope.checkout.address_latitude = latLng.lat();
                $scope.checkout.address_longitude = latLng.lng();
                $scope.checkout.address = $scope.autocomplete.getText();
                $scope.userInfo.address_valid = true;
            } else {
                $scope.userInfo.address_valid = false;
            }
        };

        jQuery(function ($) {
            $("#gP_number").mask("(999) 999-9999");
        });

        $scope.clearText = function () {
            $scope.userInfo.address_valid = undefined;
        };

        $scope.showCardInfo = function () {
            $scope.userInfo.cardIsShown = !$scope.userInfo.cardIsShown;
            $('#cardInfoBox').slideToggle(500);
        }

        function readyToHomeIt() {
            //TODO: rewrite
            if ($scope.userInfo.fname_valid && $scope.userInfo.lname_valid &&
                ($scope.userInfo.dob_valid || !$scope.userInfo.hasLiquor) &&
                $scope.userInfo.email_valid && $scope.userInfo.phone_valid && $scope.userInfo.address_valid &&
                ($scope.userInfo.drInstruction_valid == true || $scope.userInfo.drInstruction_valid == undefined) &&
                $scope.validCardInfo &&
                ($scope.userInfo.billigAddresSame || ($scope.userInfo.cardHolderName_valid && $scope.userInfo.cardHolderAddress_valid && $scope.userInfo.cardHolderPostalCode_valid))) {

                $scope.userInfo.HomeIt = true;

            } else {
                $scope.userInfo.HomeIt = false;
            }

            if ($scope.userInfo.fname_valid && $scope.userInfo.lname_valid && $scope.userInfo.email_valid && !$scope.userInfo.cardIsShown) {
                $scope.showCardInfo();
            }
        }

        $scope.clearPage = function () {
            if ($scope.paymentResult == "11" || $scope.paymentResult == "1") {
                $scope.userInfo = {};
                $scope.userCart = {};
                $scope.clearCart();
                $scope.delFee = 0;
                $window.location.href = $window.location.origin + "/main";
            } else {
                location.reload();
            }
        };

        $scope.toggleCardInfo = function () {
            googleAnalytics.addEvent('pressed_cardinfo_button', {
                "event_label": "Card info button pressed",
                "event_category": googleAnalytics.eventCategories.checkout_actions
            });
            $scope.showCardInfo();
        }

        /* Helper functions */

        function updateUserCart(cart) {
            $scope.userCart = cart;
            $scope.userCartToView = cartService.getViewUserCart($scope.store_type, $scope.userCart);
        }

        $scope.cardHolder = function () {
            if ($scope.userInfo.billigAddresSame) {
                $scope.userInfo.cardHolderName = "";
                $scope.userInfo.cardHolderAddress = "";
                $scope.userInfo.cardHolderPostalCode = "";
            } else {
                var addr = sessionStorage.getAddress();
                if (!addr) return;
                $scope.userInfo.cardHolderName = $scope.userInfo.first_name + " " + $scope.userInfo.last_name;
                $scope.userInfo.cardHolderAddress = addr.address_components[0].long_name + addr.address_components[1].long_name;
                $scope.userInfo.cardHolderPostalCode = addr.address_components[7].long_name
            }
        }

        $scope.init();
    });