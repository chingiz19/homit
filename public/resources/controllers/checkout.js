app.controller("checkoutController",
    function ($scope, $http, $location, $rootScope, $cookies, $window, $mdSidenav,
        $log, localStorage, cartService, sessionStorage, date, mapServices, $sce, $interval, googleAnalytics, $timeout, user, $injector) {

        $scope.userInfo = {};

        $scope.init = function () {
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
                    if (res.data.user.address && res.data.user.address_latitude && res.data.user.address_longitude) {
                        if (!res.data.user.address_unit_number) {
                            res.data.user.address_unit_number = "";
                        }

                        $scope.userInfo.address = res.data.user.address;
                        $scope.userInfo.address_unit_number = res.data.user.address_unit_number;
                        if (!$scope.userInfo.address_unit_number) {
                            $scope.userInfo.address_unit_number = "";
                        }
                    }

                    $scope.userInfo.dateOfBirth = res.data.user.dob;

                    if ($scope.userInfo.card) {
                        $scope.useDefaultCard = true;
                    }
                }
                $scope.userInfo.hasLiquor = hasLiquor;

                if (sessionStorage.getAddress()) {
                    if (sessionStorage.getAddressUnitNumber()) {
                        $scope.userInfo.address_unit_number = sessionStorage.getAddressUnitNumber();
                    } else {
                        $scope.userInfo.address_unit_number = "";
                    }
                    $scope.userInfo.address = sessionStorage.getAddress().formatted_address;
                    $scope.userInfo.address_latitude = sessionStorage.getAddressLat();
                    $scope.userInfo.address_longitude = sessionStorage.getAddressLng();
                }

                var addrInterval = $interval(function () {
                    if ($injector.has('addressAutocompleteDirective')) {
                        $interval.cancel(addrInterval);
                        if ($scope.userInfo.address) {
                            // formatted_address from google returns 
                            if (_.startsWith($scope.userInfo.address, $scope.userInfo.address_unit_number)) {
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

            $scope.stores = [];
            $timeout(function(){
                if ($scope.cart.getCart().hasOwnProperty("liquor-station")) {
                    $scope.userInfo.hasLiquor = true;
                } else {
                    $scope.userInfo.dob_not_valid = false;
                }

                // Calculation For receipt
                $scope.updatePrices($scope.cart.getCart());
            }, 250);
        };

        $scope.submitCheckout = function (valid) {
            if ($scope.userInfo.dob_not_valid) {
                $("#date_of_birth").click();
                return;
            }

            if (!($scope.userInfo.address && $scope.userInfo.address_latitude && $scope.userInfo.address_longitude)) {
                if (!$scope.userInfo.withinCoverage) {
                    $("#autocompleteAddressInputBox").click();
                    return;
                }
            }

            if (valid) {
                if ($scope.useDefaultCard) {
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
                if (sessionStorage.getAddressUnitNumber()) {
                    $scope.userInfo.address_unit_number = sessionStorage.getAddressUnitNumber();
                } else {
                    $scope.userInfo.address_unit_number = "";
                }
                $scope.userInfo.address = sessionStorage.getAddress().formatted_address;
                $scope.userInfo.address_latitude = sessionStorage.getAddressLat();
                $scope.userInfo.address_longitude = sessionStorage.getAddressLng();
            }

            if ($scope.userInfo.address_unit_number && $scope.userInfo.address_unit_number != "") {
                userInfoToSend.unit_number = $scope.userInfo.address_unit_number;
                userInfoToSend.address = _.trim(_.trimStart($scope.userInfo.address, userInfoToSend.unit_number));
                userInfoToSend.address_latitude = $scope.userInfo.address_latitude;
                userInfoToSend.address_longitude = $scope.userInfo.address_longitude;
                if ($scope.userInfo.drInstruction) {
                    userInfoToSend.driver_instruction = $scope.userInfo.drInstruction + "; Unit Number: " + userInfoToSend.unit_number;
                } else if (userInfoToSend.unit_number && userInfoToSend.unit_number != "") {
                    userInfoToSend.driver_instruction = "Unit Number: " + userInfoToSend.unit_number;
                }
            } else {
                userInfoToSend.driver_instruction = $scope.userInfo.drInstruction;
                userInfoToSend.address = $scope.userInfo.address;
                userInfoToSend.address_latitude = $scope.userInfo.address_latitude;
                userInfoToSend.address_longitude = $scope.userInfo.address_longitude;
            }

            let scheduled_delivery = localStorage.getOrderDeliveryHrs();
            let order_scheduled_time = {};
            for (let store in scheduled_delivery) {
                order_scheduled_time[store] = scheduled_delivery[store].value;
            }
            $http({
                method: 'POST',
                url: '/api/checkout/placeorder',
                data: {
                    user: userInfoToSend,
                    products: cartService.parseCartToSend($scope.cart.getCart()),
                    token_id: tokenID,
                    schedule_details: order_scheduled_time
                }
            }).then(function successCallback(response) {
                if (!response.data.success) {
                    $scope.paymentMessage_1 = "We are sorry, ";
                    $scope.paymentMessage_2 = response.data.ui_message;
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
            $http({
                method: 'POST',
                url: '/api/checkout/calculate',
                data: {
                    products: cartService.parseCartToSend($scope.cart.getCart()),
                }
            }).then(function successCallback(response) {
              if (response.data.success) {
                let prices = response.data.prices;

                // Updating display variables
                $scope.delFee = prices.delivery_fee;
                $scope.totalAmount = prices.cart_amount;
                $scope.GST = prices.total_tax;
                $scope.receipt = prices.total_price;
              } else {
                alert("Refresh your page");
              }
            }, function errorCallback(error) {
                alert("Error, check your internet and refresh your page");
            });
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


        $scope.clearPage = function () {
            if ($scope.paymentResult == "11" || $scope.paymentResult == "1") {
                $scope.userInfo = {};
                $scope.cart.clear();
                sessionStorage.setAddress("");
                sessionStorage.setAddressUnitNumber("");
                $window.location.href = $window.location.origin + "/main";
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

        $scope.cardCheckbox = function () {
            $scope.useDefaultCard = !$scope.useDefaultCard;
        };

        $scope.onCartLoad = function(){
            let storeKeys = Object.keys($scope.cart.getCart());
            for (let i = 0; i < storeKeys.length; i++) {
                $scope.stores.push({
                    type: storeKeys[i]
                });
            }
        }

        $timeout($scope.init, 0);

    });