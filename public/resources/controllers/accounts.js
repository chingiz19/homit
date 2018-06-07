app.controller("accountsController", function ($scope, $window, $timeout, user) {
    $scope.init = function () {
        if ($window.location.href.split('=')[1] == "login") {
            $scope.isReqLogIn = true;
        } else {
            $scope.isReqLogIn = false;
        }

        $scope.passPattern = '^(?:([^\ ]))*$';
    };

    $scope.loginMob = function (valid) {
        if (!valid) return;
        user.login($scope.login_email_mob, $scope.login_password_mob)
            .then(function successCallback(response) {
                if (response.data.success) {
                    $("#sucLogIn-mob").removeClass("sucSign-mob").addClass("sign-showSucMessage-mob");
                    setTimeout(() => {
                        $window.location.href = $window.location.origin + "/main";
                    }, 1100);
                } else {
                    $("#invalidLogIn-mob").removeClass("invalidLogIn-mob").addClass("sign-showErrorMessage-mob messageIn-mob");
                }
            }, function errorCallback(response) {
                $scope.sign_message_mob = "Couldn't connect. Please refresh the page and try again.";
                $("#emailNotification-mob").addClass("sign-showErrorMessage-mob invalidLogIn-mob messageIn-mob");
                $("#invalidLogIn-mob").removeClass("sign-showErrorMessage-mob");
            });
    };

    $scope.forgotPasswordMob = function (valid) {
        if (!valid) return;
        user.forgotPassword($scope.login_email_mob)
            .then(function successCallback(response) {
                if (response.data.success) {
                    $scope.sign_message_mob = "Reset email has been successifully sent to " + $scope.login_email_mob;
                    $("#invalidLogIn-mob").removeClass("sign-showErrorMessage-mob").addClass("invalidLogIn-mob");
                    $("#emailNotification-mob").addClass("sign-showErrorMessage-mob messageIn-mob");
                } else {
                    $scope.sign_message_mob = "Fail to sent password reset email to " + $scope.login_email_mob + ". Please, try again.";
                    $("#invalidLogIn-mob").removeClass("sign-showErrorMessage-mob").addClass("invalidLogIn-mob");
                    $("#emailNotification-mob").addClass("sign-showErrorMessage-mob messageIn-mob");
                }
            }, function errorCallback(response) {
                $scope.sign_message_mob = "ERROR in password reset. Please contact info@homit.ca";
                $("#invalidLogIn-mob").removeClass("sign-showErrorMessage-mob").addClass("invalidLogIn-mob");
                $("#emailNotification-mob").addClass("sign-showErrorMessage-mob messageIn-mob");
            });
    };

    $scope.signupMob = function (valid) {
        if (!valid) return;
        user.signup({
            email: $scope.signup_email_mob,
            password: $scope.signup_password_mob,
            fname: $scope.signup_fname_mob,
            lname: $scope.signup_lname_mob
        })
            .then(function successCallback(response) {
                if (response.data.success) {
                    $("#sucSignUp-mob").removeClass("sucSign-mob").addClass("sign-showSucMessage-mob");
                    setTimeout(() => {
                        $window.location.href = $window.location.origin + "/main";
                    }, 1000);
                } else {
                    $scope.sign_message_mob = "Failed to Sign Up. Please refresh page, and try again.";
                    $("#signUpNotification-mob").removeClass("signUpNotification-mob").addClass("sign-showErrorMessage-mob messageIn-mob");
                }
            }, function errorCallback(response) {
                pScope.sign_message_mob = "Fail to Sign Up. Please refresh page, and try again.";
                $("#signUpNotification-mob").removeClass("signUpNotification-mob").addClass("sign-showErrorMessage-mob messageIn-mob");
            });
    };

    $scope.tryAgainLogIn = function () {
        $scope.login_email_mob = "";
        $scope.login_password_mob = "";
        $("#invalidLogIn-mob").addClass("messageOut-mob").removeClass("messageIn-mob");
        setTimeout(() => {
            $("#invalidLogIn-mob").addClass("invalidLogIn-mob").removeClass("sign-showErrorMessage-mob foldOut-mob");
        }, 600);
        $scope.$apply();
    };

    $scope.toggleSign = function () {
        $scope.isReqLogIn = !$scope.isReqLogIn;
    };

    $scope.init();
});