app.controller("myaccountController", function ($scope, $window, $timeout, localStorage, sessionStorage, user, notification, googleAnalytics, mapServices, helpers) {

    var confirmMessage = "Changes will be lost. Would you like to proceed?";

    var selectors_section1 = "[ng-model='fname'], [ng-model='lname'], [ng-model='dob'], [ng-model='email'], [ng-model='phone']";
    var selectors_section2 = "[ng-model='address']";
    var selectors_section3 = "[ng-model='card_name'], [ng-model='card_num'], [ng-model='card_exp'], [ng-model='card_cvc'], [ng-model='card_addr']";
    var selectors_section4 = "[ng-model='old_pass'], [ng-model='new_pass'], [ng-model='confirm_pass']";

    var modifiedFlag = "modified";

    /**
     * Initialization
     * Contains logic for getting started with this controller
     */
    $scope.init = function () {
        $scope.loading_spin = "none";
        $scope.update_btn_txt = "Update";
        $scope.dobPattern = /^((0[13578]|1[02])[-.](29|30|31)[-.](18|19|20)[0-9]{2})|((01|0[3-9]|1[1-2])[-.](29|30)[-.](18|19|20)[0-9]{2})|((0[1-9]|1[0-2])[-.](0[1-9]|1[0-9]|2[0-8])[-.](18|19|20)[0-9]{2})|((02)[\/.]29[-.](((18|19|20)(04|08|[2468][048]|[13579][26]))|2000))$/;
        $scope.passPattern = '^(?:([^\ ]))*$';
        $scope.email_check_message = "";

        $scope.modified = false;
        let selectedSection = sessionStorage.getAccountSection();
        $scope.sidebarOpen = false;
        $scope.infoLoaded = false;

        if (selectedSection) {
            try {
                $scope.section = parseInt(selectedSection);
                if ($scope.section == 5) loadOrders();
            } catch (e) {
                $scope.section = 0; // Default to 0    
            }
        } else {
            $scope.section = 0;
        }

        $("input").keydown(function () {
            $(this).addClass(modifiedFlag);
            $scope.modified = true;
            $scope.$apply();
        });

        user.user().then(function success(res) {
            $scope.infoLoaded = true;
            if (res.data.success) {
                $scope.fname = res.data.user.first_name;
                $scope.lname = res.data.user.last_name;
                $scope.email = res.data.user.user_email;
                $scope.phone = res.data.user.phone_number;
                $scope.coupons = helpers.formatCoupons(res.data.user.coupons);

                if (!res.data.user.address_unit_number) {
                    res.data.user.address_unit_number = "";
                }
                $timeout(function () {
                    if (res.data.user.address) {
                        $scope.displayAddress = _.trim(_.trimStart((res.data.user.address_unit_number + " " + res.data.user.address)));
                        $scope.autocomplete.setText($scope.displayAddress);
                    } else {
                        $scope.displayAddress = false;
                    }
                    $scope.address = res.data.user.address;
                }, 100);

                $scope.dob = res.data.user.dob;
                $scope.card = res.data.user.card;
                $scope.user = res.data.user;

                if ($scope.dob) {
                    $scope.requireDOB = true;
                }

                if ($scope.phone) {
                    $scope.requirePhone = true;
                }
            } else {
                notification.addErrorMessage("Couldn't retrieve user information. Please try again later");
            }

            jQuery(function ($) {
                $("#phone-number").mask("(999) 999-9999");
                $("#date_of_birth").mask("99-99-9999");
                $("#card_numb").mask("9999 9999 9999 9999");
                $("#card_exp").mask("99/99");
                $("[data-phone]").mask("(999) 999-9999");
                $scope.$apply();
            });
        }, function error() {
            notification.addErrorMessage("Couldn't retrieve user information. Please try again later");
        });

        /* Stripe setup */
        $scope.stripe = Stripe($("#stripeToken").val());
        var elements = $scope.stripe.elements();
        $scope.cardElement = elements.create('card', {
            hidePostalCode: false
        });
        $scope.cardElement.mount("#card");


        /* Clears email suggestion message upon focus  */
        $('#myaccount-email-input').on('focusin', function () {
            $scope.email_check_message = "";
        });

        /* Email syntax check implementation */
        $('#myaccount-email-input').on('blur', function () {
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

        $timeout(function () {
            mapServices.createCoveragePolygon().then(function (polygon) {
                if (polygon) {
                    $scope.coveragePolygon = polygon;
                    //TODO: change to dynamic
                    $scope.bounds = new google.maps.LatLngBounds({ lat: 50.862122, lng: -114.173317 }, { lat: 51.172396, lng: -113.925171 });
                    //Checks if address within coverage area
                    var latLng = $scope.autocomplete.getLatLng();
                    $scope.withinCoverage = mapServices.isPlaceInsidePolygon(latLng, polygon);
                }
            });
        }, 500);
    };

    /**
     * Helper method called when selection is made.
     * Method contains selection related logic
     */
    $scope.selectSection = function (selection) {
        var cancelChanges = true;

        // prompt user to save progress or it will be lost
        switch ($scope.section) {
            case 1:
                if (checkInputIfModified(selectors_section1)) {
                    cancelChanges = confirm(confirmMessage);
                    if (cancelChanges) {
                        $scope.resetProfileSection();
                    }
                }
                break;
            case 2:
                //TODO: might change if we use addressAutocomplete instead of input
                if (checkInputIfModified(selectors_section2)) {
                    cancelChanges = confirm(confirmMessage);
                    if (cancelChanges) {
                        $scope.resetDeliveryAddressSection();
                    }
                }
                break;
            case 3:
                if (checkInputIfModified(selectors_section3)) {
                    cancelChanges = confirm(confirmMessage);
                    if (cancelChanges) {
                        $scope.resetPaymentMethodsSection();
                    }
                }
                break;
            case 4:
                if (checkInputIfModified(selectors_section4)) {
                    cancelChanges = confirm(confirmMessage);
                    if (cancelChanges) {
                        $scope.resetSecuritySettingsSection();
                    }
                }
                break;
            default:
                break;
        }

        // only proceed if fields are not modified
        if (cancelChanges) {
            $scope.section = selection;
            // $scope.hideSidebarForMobile();
            sessionStorage.setAccountSection(selection);

            $scope.modified = false;

            if (!$scope.orders && selection == 4) {
                loadOrders();
            }

            googleAnalytics.addEvent('section_selected', {
                "event_label": selection,
                "event_category": googleAnalytics.eventCategories.myaccount_actions
            });
        }
    };

    /**
     * Called to update user profile information
     */
    $scope.updateProfile = function (valid) {
        // Do nothing if nothing was modified
        if (!checkInputIfModified(selectors_section1) || !valid) {
            $scope.editEnabled = false;
            resetValues();
            return;
        }
        showLoadSpinner();
        var objToSend = {
            first_name: $scope.fname,
            last_name: $scope.lname,
            user_email: $scope.email
        };

        // convert mm-dd-yyyy to yyyy-mm-dd
        try {
            if ($scope.dob && $scope.dob != "") {
                birth_date = $scope.dob.split("-");
                birth_date = birth_date[2] + '-' + birth_date[0] + '-' + birth_date[1];
                objToSend.birth_date = birth_date;
            } else {
                objToSend.birth_date = undefined;
            }
        } catch (e) {
            // nothing to do, won't send to backend
            objToSend.birth_date = undefined;
        }
        var phone;
        try {
            if ($scope.phone && $scope.phone != "") {
                phone = $scope.phone.replace("(", "");
                phone = phone.replace(")", "");
                phone = phone.replace(" ", "");
                phone = phone.replace("-", "");
                objToSend.phone_number = phone;
            }
        } catch (e) {
            // nothing to do, won't send to backend
            objToSend.phone_number = undefined;
        }

        user.update(objToSend).then(defaultSuccessCallback, defaultErrorCallback);
        googleAnalytics.addEvent('update_account', {
            "event_label": "Account",
            "event_category": googleAnalytics.eventCategories.myaccount_actions
        });
    };

    /**
     * Called to update user delivery address
     */
    $scope.updateDeliveryAddress = function () {
        if (!$scope.withinCoverage) {
            notification.addErrorMessage("Not within coverage");
            return;
        }
        showLoadSpinner();
        var addr, addr_lng, addr_lat;
        if (!$scope.address || $scope.address.text == "") {
            addr = "remove";
            addr_lng = "remove";
            addr_lat = "remove";
        } else {
            addr = $scope.address.text;
            addr_lat = $scope.address.lat;
            addr_lng = $scope.address.lng;
        }

        var addr_unit = sessionStorage.getAddressUnitNumber();
        if (addr_unit) {
            addr = _.trim(_.trimStart(addr, addr_unit));
        } else {
            addr_unit = "remove";
        }

        user.update({
            address: addr,
            address_unit_number: addr_unit,
            address_longitude: addr_lng,
            address_latitude: addr_lat
        }).then(defaultSuccessCallback, defaultErrorCallback);
        googleAnalytics.addEvent('update_delivery_address', {
            "event_label": "Delivery address",
            "event_category": googleAnalytics.eventCategories.myaccount_actions
        });
    };

    /**
     * Called to update user payment method
     */
    $scope.updatePaymentMethod = function (valid) {
        if (!valid) return;
        showLoadSpinner();
        $scope.stripe.createToken($scope.cardElement, {
            name: $scope.card_name
        }).then(function (result) {
            if (result.error || !result.token.id) {
                notification.addErrorMessage("False Card");
                return;
            }

            user.updateCardInfo(result.token.id).then(defaultSuccessCallback, defaultErrorCallback);
            googleAnalytics.addEvent('update_payment_method', {
                "event_label": "Payment method",
                "event_category": googleAnalytics.eventCategories.myaccount_actions
            });
        });
    };

    $scope.removePaymentMethod = function () {
        user.removeCard().then(defaultSuccessCallback, defaultErrorCallback);
    };

    /**
     * Called to update user security settings
     */
    $scope.updateSecuritySettings = function (valid) {
        if (!valid) return;
        showLoadSpinner();
        user.updatePassword($scope.security_set.current_pass.$modelValue, $scope.security_set.new_pass.$modelValue)
            .then(defaultSuccessCallback, defaultErrorCallback);
        googleAnalytics.addEvent('update_security_settings', {
            "event_label": "Security settings",
            "event_category": googleAnalytics.eventCategories.myaccount_actions
        });
    };

    /**
     * Resets input values for Profile section
     */
    $scope.resetProfileSection = function () {
        $scope.fname = $scope.user.first_name;
        $scope.lname = $scope.user.last_name;
        $scope.email = $scope.user.user_email;
        $scope.phone = $scope.user.phone_number;

        resetInputMofiedFlag(selectors_section1);
        $scope.editEnabled = false;
    };

    /**
     * Resets input values for Delivery Address section
     */
    $scope.resetDeliveryAddressSection = function () {
        $scope.address = "";
        resetInputMofiedFlag(selectors_section2);
        $scope.editEnabled = false;
    };

    /**
     * Resets input values for Payment Methods section
     */
    $scope.resetPaymentMethodsSection = function () {
        $scope.card_name = "";
        $scope.cardElement.clear();
        resetInputMofiedFlag(selectors_section3);
        $scope.editEnabled = false;
    };

    /**
     * Resets input values for Security Settings section
     */
    $scope.resetSecuritySettingsSection = function () {
        $scope.old_pass = "";
        $scope.new_pass = "";
        $scope.confirm_pass = "";
        resetInputMofiedFlag(selectors_section4);
        $scope.editEnabled = false;
    };

    /**
     * Close and Open sidebar
     */
    $scope.openCloseSidebar = function () {
        if (!$scope.sidebarOpen) {
            $('.sidebar-div').addClass('sidebar-div-grow');
        } else {
            $('.sidebar-div').removeClass('sidebar-div-grow');
        }
        $scope.sidebarOpen = !$scope.sidebarOpen;
    };

    $scope.gotAddressResults = function () {
        var latLng = $scope.autocomplete.getLatLng();
        var place = $scope.autocomplete.getPlace();
        if (mapServices.isPlaceInsidePolygon(latLng, $scope.coveragePolygon)) {
            $scope.address = {
                text: $scope.autocomplete.getText(),
                lat: $scope.autocomplete.getLatLng().lat(),
                lng: $scope.autocomplete.getLatLng().lng(),
            };
            $scope.withinCoverage = true;
        } else {
            $scope.withinCoverage = false;
            googleAnalytics.addEvent('out_of_coverage', {
                "event_label": place.formatted_address,
                "event_category": googleAnalytics.eventCategories.myaccount_actions
            });
        }
    };

    $scope.validateConfirmPass = function () {
        var valid;
        if (!$scope.confirm_pass || $scope.confirm_pass == "") {
            valid = true;
        } else if ($scope.confirm_pass != $scope.new_pass) {
            valid = false;
        } else {
            valid = true;
        }

        $scope.security_set.confirm_pass.$setValidity("confirm_pass", valid);
    };

    $scope.resendVerificationEmail = function () {
        user.resendVerificationEmail().then(defaultSuccessCallback, defaultErrorCallback);
    };

    /**
     * Updates input email to suggested value
     * @param {string} email 
     */
    $scope.subEmailToSuggested = function (email) {
        $scope.email_check_message = "";
        $scope.email = email;
    };

    /**
     * Show loading spinner in "Update" button
     */
    function showLoadSpinner() {
        $scope.loading_spin = "update-spin-ma";
        $scope.update_btn_txt = "Updating..";
    }

    /**
     * Resets selector modified flag
     */
    function resetInputMofiedFlag(selector) {
        $(selector).removeClass(modifiedFlag);
    }

    /**
     * Checks given selector(s) for ng-dirty class
     * 
     * @param {*} selector 
     * @returns boolean
     */
    function checkInputIfModified(selector) {
        return $(selector).hasClass(modifiedFlag);
    }

    /**
     * Helper method to load orders
     */
    function loadOrders() {
        $scope.orderSectionText = "Loading...";
        user.orders().then(function success(res) {
            if (res.data.success) {
                $scope.orders = res.data.orders;
                $scope.orderSectionText = "No Orders"; //won't be shown if orders contains something                        
                for(let i=0; i<$scope.orders.length; i++){
                    if($scope.orders[i].date_delivered != "Pending..."){
                        $scope.orders[i]["date_delivered"] = helpers.mm_dd_yyyy($scope.orders[i].date_delivered);
                    }
                }
            }
        }, function (error) {
            $scope.orderSectionText = "Something went wrong while retrieving orders, please refresh the page";
        });
    }

    /**
     * Resets user data
     */
    function resetValues() {
        $scope.fname = $scope.user.first_name;
        $scope.lname = $scope.user.last_name;
        $scope.email = $scope.user.user_email;
        $scope.phone = $scope.user.phone_number;

        $scope.dob = $scope.user.dob;
        $scope.card = $scope.user.card;
    }

    /**
     * Returns default response handler that notifies of operation success
     */
    function defaultSuccessCallback(res) {
        if (res.data.success) {
            notification.addSuccessMessage(res.data.ui_message || "Successfully Updated");     //Jey let me know what you think about this implementation
            setTimeout(() => {
                $window.location.reload();
            }, 1000);
            localStorage.setHeaderNotificationCleared(false);
        } else {
            notification.addErrorMessage(res.data.ui_message || "Operation wasn't successful");
        }
        $scope.loading_spin = "none";
        $scope.update_btn_txt = "Updated";
    }

    /**
     * Returns default response handler that notifies of operation error 
     */
    function defaultErrorCallback(err) {
        notification.addErrorMessage("Something went wrong, please try again later");
        $scope.loading_spin = "none";
        $scope.update_btn_txt = "Ups..";
    }

    /**
     * Sets user redeemed coupon
     * @param {string} coupon 
     */
    $scope.updateCoupon = function (code, index) {
        let requestObject = {};
        requestObject[code] = !$scope.coupons[index].applied;
        user.updateUserCoupons(requestObject).then(function (response) {
            if (response.data.success) {
                notification.addSuccessMessage(response.data.ui_message);
                $timeout(function () {
                    $scope.coupons[index].applied = !$scope.coupons[index].applied;
                }, 0);
            } else {
                notification.addErrorMessage(response.data.ui_message || "Sorry, couldn't apply coupon");
            }

        }, function (error) {
            notification.addErrorMessage("Sorry, couldn't apply coupon");
        });
    };

    // Initialize at the end of file!
    $scope.init();
});

