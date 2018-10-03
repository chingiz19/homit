app.controller("checkoutController",
    function ($scope, $http, $location, $rootScope, $cookies, $window, $mdSidenav,
        $log, localStorage, cartService, sessionStorage, date, mapServices, $sce, $interval, googleAnalytics, $timeout, user, $injector, notification) {

        $scope.userInfo = {};

        $scope.init = function () {
            $scope.totalAmount = 0;
            $scope.delFee = 0;
            $scope.GST = 0;
            $scope.receipt = 0;
            $scope.userAppliedCoupons = [];
            $scope.userSignedIn = false;
            $scope.dob_not_valid = undefined;
            $scope.showCart = false;
            $scope.paymentProcessed = false;
            $scope.payment_btn_txt = "Secure Payment";
            $scope.loading_spin = "none";

            $scope.paymentResult = "";
            $scope.paymentMessage_1 = "";
            $scope.paymentMessage_2 = "";
            $scope.co_cart_show_icon = "";
            $scope.email_check_message = "";

            $scope.stripeToken = $("#stripeToken").val();

            $scope.checkout = this;

            $scope.checkout.getCheckoutUserInfo = sessionStorage.getCheckoutUserInfo();
            if ($scope.checkout.getCheckoutUserInfo != "undefined" && $scope.checkout.getCheckoutUserInfo != null && $scope.checkout.getCheckoutUserInfo != "") {
                $scope.userInfo = $scope.checkout.getCheckoutUserInfo;
            }

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

            $scope.handler = StripeCheckout.configure({
                key: $scope.stripeToken,
                image: '/resources/images/non-catalog-image/homit_logo/H-logo_stripe.png',
                locale: 'auto',
                token: function (token) {
                    if (token.id) {
                        updateCheckoutBtn("Payment Success", "none");
                        $scope.paymentProcessed = true;
                        $scope.HomeIt(token.id);
                    }
                },
                opened: function () {
                    updateCheckoutBtn("Payment..", "none");
                },
                closed: function () {
                    if (!$scope.paymentProcessed) {
                        updateCheckoutBtn("Secure Payment", "none");
                    }
                }
            });

            /**
             * Clears email suggestion message upon focus
             */
            $('#email-input-co').on('focusin', function () {
                $scope.email_check_message = "";
            });

            /**
             * Email syntax check implementation
             */
            $('#email-input-co').on('blur', function () {
                $(this).mailcheck({
                    suggested: function (element, suggestion) {
                        $scope.email_check_message = "email-check-grow";
                        $scope.suggestion = suggestion.full;
                    },
                    empty: function (element) {
                        $scope.email_check_message = "";
                    }
                });
            });

            /**
             * Updates input email to suggested value
             * @param {string} email 
             */
            $scope.subEmailToSuggested = function (email) {
                $scope.userInfo.user_email = email;
                $scope.email_check_message = "";
            };

            $scope.stores = [];
            $timeout(function () {
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
                $("#date_of_birth").blur();
                return;
            }

            if (!($scope.userInfo.address && $scope.userInfo.address_latitude && $scope.userInfo.address_longitude)) {
                if (!$scope.userInfo.withinCoverage) {
                    $("#autocompleteAddressInputBox").blur();
                    return;
                }
            }

            if (valid) {

                updateCheckoutBtn("In Process..", "update-spin-co");

                let scheduled_delivery = localStorage.getOrderDeliveryHrs();
                let order_scheduled_time = {};

                for (let store in scheduled_delivery) {
                    order_scheduled_time[store] = scheduled_delivery[store].value;
                }

                $http({
                    method: 'POST',
                    url: '/api/checkout/check',
                    data: {
                        "products": cartService.parseCartToSend($scope.cart.getCart()),
                        "schedule_details": order_scheduled_time,
                        "email": $scope.userInfo.user_email
                    }
                }).then(function successCallback(response) {
                    if (!response.data.success) {
                        return updateCheckoutModal("warning", true, "We are sorry", (response.data.ui_message || "Something went wrong while processing your order, please contact us at info@homit.ca"));
                    }

                    if ($scope.receipt === 0) {
                        return $scope.HomeIt(0);
                    }

                    if ($scope.useDefaultCard) {
                        $scope.HomeIt(1); // 1 for default payment option, TODO: could be better implemented
                        return;
                    }

                    // Open Checkout with further options:
                    $scope.handler.open({
                        name: 'Homit Payment',
                        currency: 'cad',
                        amount: $scope.receipt * 100,
                        allowRememberMe: false,
                        zipCode: true,
                        email: $scope.userInfo.user_email
                    });

                }, function errorCallback(error) {
                    // for 4xx, 5xx response calls
                    if (error) {
                        return updateCheckoutModal("warning", true, "We are sorry", "Something went wrong while processing your order, please contact us at info@homit.ca");
                    }
                });
            }

            // Close Checkout on page navigation:
            window.addEventListener('popstate', function () {
                handler.close();
                $scope.loading_spin = "none";
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
            let coupon_details = localStorage.getUserCoupons();
            let order_scheduled_time = {};
            for (let store in scheduled_delivery) {
                order_scheduled_time[store] = scheduled_delivery[store].value;
            }
            $http({
                method: 'POST',
                url: '/api/checkout/placeorder',
                data: {
                    "user": userInfoToSend,
                    "products": cartService.parseCartToSend($scope.cart.getCart()),
                    "token_id": tokenID,
                    "schedule_details": order_scheduled_time,
                    "coupon_details": coupon_details
                }
            }).then(function successCallback(response) {
                if (!response.data.success) {
                    return updateCheckoutModal("warning", true, "We are sorry", (response.data.ui_message || "Something went wrong while processing your order, please contact us at info@homit.ca"));
                }

                localStorage.clearAfterCheckout();
                sessionStorage.clearAfterCheckout();
                updateCheckoutBtn("Thank You!", "none");
                updateCheckoutModal("success", true, "Thank You", "Homit will take care!", "ASAP orders will be delivered in 30 - 45 mins");


            }, function errorCallback(error) {
                // for 4xx, 5xx response calls
                if (error) {
                    updateCheckoutBtn("Secure Payment", "none");
                    return updateCheckoutModal("warning", true, "We are sorry", "Something went wrong while processing your order, please contact us at info@homit.ca");
                }
            });
        };

        function activateCheckoutModal() {
            $('#checkoutModal').modal('toggle');
            $('#checkoutModal').modal('show');
        }

        function updateCheckoutModal(type, displayUserName, primaryMessage, secondaryMessage, tertiaryMessage) {
            $scope.modalType = type;
            $scope.primaryMessage = (primaryMessage || "") + (displayUserName ? (", " + $scope.userInfo.first_name) : "");
            $scope.secondaryMessage = secondaryMessage || "";
            $scope.tertiaryMessage = tertiaryMessage || "";

            $('#checkoutModal').modal();

            if (type === "warning") { sessionStorage.setCheckoutUserInfo($scope.userInfo); }

            setTimeout(function () {
                $scope.$apply();
            }, 100);
        }

        $scope.updatePrices = function () {
            let coupon_details = localStorage.getUserCoupons();

            $http({
                method: 'POST',
                url: '/api/checkout/calculate',
                data: {
                    "products": cartService.parseCartToSend($scope.cart.getCart()),
                    "coupon_details": coupon_details
                }
            }).then(function successCallback(response) {
                if (response.data.success) {
                    let prices = response.data.prices;

                    // Updating display variables
                    $scope.delFee = prices.delivery_fee;
                    $scope.totalAmount = prices.cart_amount;
                    $scope.GST = prices.total_tax;
                    $scope.receipt = prices.total_price;


                    if (prices.coupons_used.length != 0) {
                        $scope.userAppliedCoupons = prices.coupons_used;

                        if ($scope.receipt === 0) {
                            updateCheckoutBtn("Submit Order!", "none");
                        }
                    }

                } else {
                    alert("Refresh your page");
                }
            }, function errorCallback(error) {
                alert("Error, check your internet and refresh your page");
            });
        };

        $scope.keyedCoupon = function (code) {
            if (code && code != "") {
                $http({
                    method: 'POST',
                    url: '/api/checkout/applykeyedcoupon',
                    data: { "code": code, "products": cartService.parseCartToSend($scope.cart.getCart()) }
                }).then(function successCallback(response) {
                    if (response.data.success) {
                        let isCouponApplied = response.data.is_coupon_applied;
                        let isCouponOk = response.data.is_coupon_ok;
                        let assignedBy = response.data.assigned_by;
                        let canBeApplied = response.data.can_be_applied;
                        let userSignedIn = response.data.is_signed_in;
                        let serverMessage = response.data.message;

                        if (!isCouponOk) {
                            return updateCheckoutModal("warning", false, "We are sorry to say", (serverMessage || "Coupon is not valid or expired"));
                        }

                        if (userSignedIn) {
                            if (isCouponApplied) {
                                notification.addSuccessMessage("Coupon has been successfully applied!");
                                $scope.couponCode = "";
                                $scope.updatePrices();
                            } else {
                                return notification.addErrorMessage("Already applied. Check MyAccount");
                            }
                        } else if (canBeApplied) {
                            let userCoupons = localStorage.getUserCoupons();
                            userCoupons[assignedBy] = code;
                            if (localStorage.setUserCoupons(userCoupons)) {
                                notification.addSuccessMessage("Coupon has been successfully applied!");
                                $scope.couponCode = "";
                                $scope.updatePrices();
                            }
                        } else {
                            return notification.addErrorMessage("Coupon already acquired, check My Account");
                        }
                    } else {
                        return notification.addErrorMessage("Error while applying coupon");
                    }
                }, function errorCallback(error) {
                    alert("Error, check your internet and refresh your page");
                });
            }
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

        jQuery(function ($) {
            $("#gP_number").mask("(999) 999-9999");
            $("#date_of_birth").mask("99-99-9999");
        });

        $scope.onCartLoad = function () {
            let storeKeys = Object.keys($scope.cart.getCart());
            for (let i = 0; i < storeKeys.length; i++) {
                if (!_.some($scope.stores, { "type": storeKeys[i] })) {
                    $scope.stores.push({
                        type: storeKeys[i]
                    });
                }
            }
        };

        $scope.onPriceChange = function () {
            $scope.updatePrices($scope.cart.getCart());
        };

        /**
         * Shows and hides cart section
         */
        $scope.showUserCart = function () {
            if (!$scope.showCart) {
                $scope.co_cart_show_icon = "icon-rot-1";
                $(".co-cart-sec").toggleClass("cart-sec-grow");
                $(".cart-items-content").toggleClass("display-content");
            } else {
                $scope.co_cart_show_icon = "icon-rot-2";
                $(".co-cart-sec").toggleClass("cart-sec-grow");
                $(".cart-items-content").toggleClass("display-content");
            }
            $scope.showCart = !$scope.showCart;
        };

        $scope.emailBluredIn = false;

        $scope.checkEmail = function () {

        };

        $scope.clearPage = function () {
            if ($scope.modalType == "success") {
                $scope.userInfo = {};
                $scope.cart.clear();
                sessionStorage.setAddress("");
                sessionStorage.setAddressUnitNumber("");
                $window.location.href = $window.location.origin + "/main";
            } else {
                location.reload();
            }
        };

        /**
         * Adds or removes spin, updates button text
         * @param {string} message 
         * @param {string} spin_class 
         */
        function updateCheckoutBtn(message, spin_class) {
            $timeout(function () {
                $scope.loading_spin = spin_class;
                $scope.payment_btn_txt = message;
            }, 0);
        }

        $timeout($scope.init, 0);

    });