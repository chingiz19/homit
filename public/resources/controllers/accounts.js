app.controller("accountsController", function ($scope, $window, $timeout, user, localStorage, notification) {
    $scope.init = function () {
        $scope.loading_spin = "none";
        $scope.login_success = "none";
        $scope.login_text = "lognin-text";
        $scope.login_message = "none";
        $scope.signup_success = "none";
        $scope.signup_message = "none";
        $scope.signup_text = "signup-text";
        $scope.email_check_message = "";
        

        $scope.message_type = 0;

        if ($window.location.href.split('=')[1] == "login") {
            $scope.isReqLogIn = true;
        } else {
            $scope.isReqLogIn = false;
        }

        $scope.passPattern = '^(?:([^\ ]))*$';

        /**
         * Clears email suggestion message upon focus
         */
        $('#mob-login-email, #mob-signup-email').on('focusin', function () {
            $scope.email_check_message = "";
        });

        /**
         * Email syntax check implementation
         */
        $('#mob-login-email, #mob-signup-email').on('blur', function () {
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
    };

    $scope.loginMob = function (valid) {
        if (!valid) return;
        user.login($scope.login_email_mob, $scope.login_password_mob)
            .then(function successCallback(response) {
                if (response.data.success) {
                    $scope.loading_spin = "none";
                    $scope.login_success = "";
                    setTimeout(() => {
                        $window.location.href = $window.location.origin + "/main";
                    }, 1100);
                    localStorage.setUserCoupons({});
                    localStorage.clearUserPushNotifications();
                } else {
                    $scope.message_type = 1;
                    $scope.loading_spin = "none";
                    $scope.login_message = "sign-showErrorMessage-mob";
                }
            }, function errorCallback(response) {
                notification.addErrorMessage("Couldn't connect. Please refresh the page and try again");
            });
    };

    $scope.forgotPasswordMob = function (valid) {
        if (!valid) return;
        $scope.message_type = 2;
        user.forgotPassword($scope.login_email_mob)
            .then(function successCallback(response) {
                if (response.data.success) {
                    $scope.sign_message_mob = "Reset email has been successifully sent to " + $scope.login_email_mob;
                    $scope.login_message = "sign-showErrorMessage-mob";
                } else {
                    $scope.sign_message_mob = "Fail to sent password reset email to " + $scope.login_email_mob + ". Please, try again.";
                    $scope.login_message = "sign-showErrorMessage-mob";
                }
            }, function errorCallback(response) {
                $scope.sign_message_mob = "ERROR in password reset. Please contact info@homit.ca";
                $scope.login_message = "sign-showErrorMessage-mob";
            });
    };

    $scope.signupMob = function (valid) {
        if (!valid) return;
        $scope.signup_text = "none";
        $scope.loading_spin = "login-spin";
        user.signup({
            email: $scope.signup_email_mob,
            password: $scope.signup_password_mob,
            fname: $scope.signup_fname_mob,
            lname: $scope.signup_lname_mob
        })
            .then(function successCallback(response) {
                if (response.data.success) {
                    $scope.loading_spin = "none";
                    $scope.signup_success = "";
                    setTimeout(() => {
                        $window.location.href = $window.location.origin + "/main";
                    }, 1000);
                    localStorage.clearUserPushNotifications();
                } else {
                    $scope.sign_message_mob = "Failed to Sign Up. Please refresh page, and try again.";
                    $scope.signup_message = "sign-showErrorMessage-mob";
                }
            }, function errorCallback(response) {
                pScope.sign_message_mob = "Fail to Sign Up. Please refresh page, and try again.";
                $scope.signup_message = "sign-showErrorMessage-mob";
            });
    };

    $scope.tryAgainLogIn = function () {
        $scope.login_message = "none";
        $scope.login_text = "lognin-text";
        $("#logIn_mob")[0].reset();
    };

    $scope.toggleSign = function () {
        $scope.isReqLogIn = !$scope.isReqLogIn;
    };

    /**
    * Updates input email to suggested value
    * @param {string} email 
    */
    $scope.subEmailToSuggested = function (email, login) {
        $scope.email_check_message = "";

        if (login) {
            $scope.login_email_mob = email;
        } else {
            $scope.signup_email_mob = email;
        }
    };

    $scope.init();
});