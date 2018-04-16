app.controller("myaccountController", function ($scope, $window, sessionStorage, user, notification) {

    var confirmMessage = "Changes will be lost. Would you like to proceed?";

    var selectors_section0 = "[ng-model='fname'], [ng-model='lname'], [ng-model='dob'], [ng-model='email'], [ng-model='phone']";
    var selectors_section1 = "[ng-model='address']";
    var selectors_section2 = "[ng-model='card_name'], [ng-model='card_num'], [ng-model='card_exp'], [ng-model='card_cvc'], [ng-model='card_addr']";
    var selectors_section3 = "[ng-model='old_pass'], [ng-model='new_pass'], [ng-model='confirm_pass']";

    var modifiedFlag = "modified";

    /**
     * Initialization
     * Contains logic for getting started with this controller
     */
    $scope.init = function () {
        $scope.dobPattern = /^((0[13578]|1[02])[-.](29|30|31)[-.](18|19|20)[0-9]{2})|((01|0[3-9]|1[1-2])[-.](29|30)[-.](18|19|20)[0-9]{2})|((0[1-9]|1[0-2])[-.](0[1-9]|1[0-9]|2[0-8])[-.](18|19|20)[0-9]{2})|((02)[\/.]29[-.](((18|19|20)(04|08|[2468][048]|[13579][26]))|2000))$/;

        $scope.editEnabled = false;
        let selectedSection = sessionStorage.getAccountSection();

        if(selectedSection){
            try{
                $scope.section = parseInt(selectedSection);
                if ($scope.section == 4) loadOrders();
            } catch(e){
                $scope.section = 0; // Default to 0    
            }
        } else {
            $scope.section = 0;           
        }

        $("input").keydown(function(){
            $(this).addClass(modifiedFlag);
        });

        user.user().then(function success(res){
            if (res.data.success){
                $scope.fname = res.data.user.first_name;
                $scope.lname = res.data.user.last_name;
                $scope.email = res.data.user.user_email;
                $scope.phone = res.data.user.phone_number;

                $scope.dob = res.data.user.dob;
                $scope.card = res.data.user.card;
                $scope.user = res.data.user;
            } else {
                //show error through notification
            }
        }, function error(){
            console.log("debug");
            // Show error through notification
        });

        /* Stripe setup */
        $scope.stripe = Stripe($("#stripeToken").val());
        var elements = $scope.stripe.elements();    
        $scope.cardElement = elements.create('card', {
            hidePostalCode: false
        });
        $scope.cardElement.mount("#card");

        jQuery(function ($) {
            $("#phone-number").mask("(999) 999-9999");
            $("#date_of_birth").mask("99-99-9999");
            $("#card_numb").mask("9999 9999 9999 9999");
            $("#card_exp").mask("99/99");
        });


        $(window).on('resize', function(){
            if ($(window).width() > 1000){
                $scope.openSidebar();
            } else {
                $scope.closeSidebar();
            }
        });
    };

    /**
     * Helper method called when selection is made.
     * Method contains selection related logic
     */
    $scope.selectSection = function(selection){
        var cancelChanges = true;
        
        // prompt user to save progress or it will be lost
        switch($scope.section){
            case 0:
                if (checkInputIfModified(selectors_section0)){
                    cancelChanges = confirm(confirmMessage);
                    if (cancelChanges){
                        $scope.resetProfileSection();
                    }
                }
                break;
            case 1:
                //TODO: might change if we use addressAutocomplete instead of input
                if (checkInputIfModified(selectors_section1)){
                    cancelChanges = confirm(confirmMessage);
                    if (cancelChanges){
                        $scope.resetDeliveryAddressSection();
                    }
                }
                break;
            case 2:
                if (checkInputIfModified(selectors_section2)){
                    cancelChanges = confirm(confirmMessage);
                    if (cancelChanges){
                        $scope.resetPaymentMethodsSection();
                    }
                }
                break;
            case 3:
                if (checkInputIfModified(selectors_section3)){
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
        if (cancelChanges){
            $scope.closeSidebar();
            $scope.section = selection;
            sessionStorage.setAccountSection(selection);

            $scope.editEnabled = false;

            if (!$scope.orders && selection == 4){
                loadOrders();
            }
        }
    };

    /**
     * Called to update user profile information
     */
    $scope.updateProfile = function(valid){
        // Do nothing if nothing was modified
        if (!checkInputIfModified(selectors_section0) || !valid){
            $scope.editEnabled = false;
            resetValues();
            return;
        }

        // convert mm-dd-yyyy to yyyy-mm-dd
        var birth_date = "remove";
        try{
            if ($scope.dob && $scope.dob != ""){
                birth_date = $scope.dob.split("-");
                birth_date = birth_date[2] + '-' + birth_date[0] + '-' + birth_date[1];
            } else {
                birth_date = "remove";
            }
        } catch(e){
            // nothing to do, won't send to backend
            birth_date = undefined;
        }
        var phone;
        try{
            if ($scope.phone && $scope.phone != ""){
                phone = $scope.phone.replace("(","");
                phone = phone.replace(")", "");
                phone = phone.replace(" ", "");
                phone = phone.replace("-", "");
            } else {
                phone = "remove";
            }
        } catch(e){
            // nothing to do, won't send to backend
            phone = undefined;
        }

        user.update({
            first_name: $scope.fname,
            last_name: $scope.lname,
            user_email: $scope.email,
            phone_number: phone,
            birth_date: birth_date
        }).then(function success(res){
            if (res.data.success){
                notification.addSuccessMessage("Updated");
                $window.location.reload();
            } else {
                notification.addErrorMessage(res.data.ui_message || "Operation wasn't successful");
            }
        }, function error(err){
            notification.addErrorMessage("Something went wrong while updating, please try again later");
        });
    };

    /**
     * Called to update user delivery address
     */
    $scope.updateDeliveryAddress = function(valid){
        if(!valid) return;
    };

    /**
     * Called to update user payment method
     */
    $scope.updatePaymentMethod = function(valid){
        if(!valid) return;

        $scope.stripe.createToken($scope.cardElement, {
            name: $scope.card_name
        }).then(function(result){
            if (result.error || !result.token.id){
                //TODO: notify user that something is wrong, and they should try again
                alert("Card false");
                return;
            }

            user.updateCardInfo(result.token.id).then(function success(res){
                if (res.data.success){
                    notification.addSuccessMessage("Updated");
                    $window.location.reload();
                } else {
                    notification.addErrorMessage(res.data.ui_message || "Operation wasn't successful");
                }
            }, function(err){
                notification.addErrorMessage("Something went wrong while updating, please try again later");
            });
        });
    };

    /**
     * Called to update user security settings
     */
    $scope.updateSecuritySettings = function(valid){
        if(!valid) return;

        user.updatePassword($scope.security_set.current_pass.$modelValue, $scope.security_set.new_pass.$modelValue).then(function success(res){
            if(res.data.success){
                notification.addSuccessMessage("Updated");
                $window.location.reload();
            } else {
                notification.addErrorMessage(res.data.ui_message || "Operation wasn't successful");
            }
        }, function(error){
            notification.addErrorMessage("Something went wrong while updating, please try again later");
        });
    };

    /**
     * Resets input values for Profile section
     */
    $scope.resetProfileSection = function(){
        $scope.fname = $scope.user.first_name;
        $scope.lname = $scope.user.last_name;
        $scope.email = $scope.user.user_email;
        $scope.phone = $scope.user.phone_number;

        resetInputMofiedFlag(selectors_section0);
        $scope.editEnabled = false;
    };

    /**
     * Resets input values for Delivery Address section
     */
    $scope.resetDeliveryAddressSection = function(){
        $scope.address = "";
        resetInputMofiedFlag(selectors_section1);
        $scope.editEnabled = false;
    };

    /**
     * Resets input values for Payment Methods section
     */
    $scope.resetPaymentMethodsSection = function(){
        $scope.card_name = "";
        $scope.cardElement.clear();
        resetInputMofiedFlag(selectors_section2);
        $scope.editEnabled = false;
    };

    /**
     * Resets input values for Security Settings section
     */
    $scope.resetSecuritySettingsSection = function(){
        $scope.old_pass = "";
        $scope.new_pass = "";
        $scope.confirm_pass = "";
        resetInputMofiedFlag(selectors_section3);
        $scope.editEnabled = false;
    };

    /**
     * Close sidebar for mobile
     */
    $scope.openSidebar = function(){
        $(".sidebar-default").removeClass("hidden");
    };

    /**
     * Open sidebar for mobile
     */
    $scope.closeSidebar = function(){
        var el = $(".sidebar-default");
        if (el.css("display") != "flex"){
            el.addClass("hidden");
        }
    };

    /**
     * Resets selector modified flag
     */
    function resetInputMofiedFlag(selector){
        $(selector).removeClass(modifiedFlag);
    }

    /**
     * Checks given selector(s) for ng-dirty class
     * 
     * @param {*} selector 
     * @returns boolean
     */
    function checkInputIfModified(selector){
        return $(selector).hasClass(modifiedFlag);
    }

    /**
     * Helper method to load orders
     */
    function loadOrders(){
        $scope.orderSectionText = "Loading...";
        user.orders().then(function success(res){
            if(res.data.success){
                $scope.orders = res.data.orders;
                $scope.orderSectionText = "No Orders"; //won;t be shown if orders contains something                        
            }
        }, function(error){
            $scope.orderSectionText = "Something went wrong while retrieving orders, please refresh the page";
        });
    }

    /**
     * Resets user data
     */
    function resetValues(){
        $scope.fname = $scope.user.first_name;
        $scope.lname = $scope.user.last_name;
        $scope.email = $scope.user.user_email;
        $scope.phone = $scope.user.phone_number;

        $scope.dob = $scope.user.dob;
        $scope.card = $scope.user.card;
    }

    // Initialize at the end of file!
    $scope.init();
});

