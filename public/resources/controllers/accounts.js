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
                    $("#sucLogIn-mob").removeClass("sucSign-mob");
                    $("#sucLogIn-mob").addClass("sign-showSucMessage-mob foldIn-mob");
                    setTimeout(() => {
                        $window.location.href = $window.location.origin + "/main";
                    }, 1100);
                } else {
                    $("#invalidLogIn-mob").removeClass("invalidLogIn-mob");
                    $("#invalidLogIn-mob").addClass("sign-showErrorMessage-mob foldIn-mob");
                }
            }, function errorCallback(response) {
                $scope.sign_message_mob = "Couldn't connect. Please refresh the page and try again.";
                $("#emailNotification-mob").addClass("sign-showErrorMessage-mob");
                $("#invalidLogIn-mob").removeClass("sign-showErrorMessage-mob");
                $("#emailNotification-mob").addClass("invalidLogIn-mob foldIn-mob");
            });
    };

    $scope.forgotPasswordMob = function (valid) {
        if (!valid) return;
        user.forgotPassword($scope.signup_email_mob)
            .then(function successCallback(response) {
                if (response.data.success) {
                    pScope.sign_message_mob = "Reset email has been successifully sent to " + $scope.signup_email_mob;
                    $("#emailNotification-mob").addClass("sign-showErrorMessage");
                    $("#invalidLogIn-mob").removeClass("sign-showErrorMessage-mob");
                    $("#invalidLogIn-mob").addClass("invalidLogIn-mob");
                } else {
                    pScope.sign_message_mob = "Fail to sent password reset email to " + $scope.signup_email_mob + ". Please, try again.";
                    $("#emailNotification-mob").addClass("sign-showErrorMessage-mob");
                    $("#invalidLogIn-mob").removeClass("sign-showErrorMessage-mob");
                    $("#invalidLogIn-mob").addClass("invalidLogIn-mob");
                }
            }, function errorCallback(response) {
                pScope.sign_message_mob = "ERROR in password reset. Please contact info@homit.ca";
                $("#emailNotification-mob").addClass("sign-showErrorMessage-mob");
                $("#invalidLogIn-mob").removeClass("sign-showErrorMessage-mob");
                $("#invalidLogIn-mob").addClass("invalidLogIn-mob foldIn-mob");
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
                    $("#sucSignUp-mob").removeClass("sucSign-mob");
                    $("#sucSignUp-mob").addClass("sign-showSucMessage-mob foldIn-mob");
                    setTimeout(() => {
                        $window.location.href = $window.location.origin + "/main";
                    }, 1000);
                } else {
                    $scope.sign_message_mob = "Failed to Sign Up. Please refresh page, and try again.";
                    $("#signUpNotification-mob").removeClass("signUpNotification-mob");
                    $("#signUpNotification-mob").addClass("sign-showErrorMessage-mob foldIn");
                }
            }, function errorCallback(response) {
                pScope.sign_message_mob = "Fail to Sign Up. Please refresh page, and try again.";
                $("#signUpNotification-mob").removeClass("signUpNotification-mob");
                $("#signUpNotification-mob").addClass("sign-showErrorMessage-mob foldIn");
            });
    };

    $scope.tryAgainLogIn = function () {
        $scope.login_email_mob = "";
        $scope.login_password_mob = "";
        $("#invalidLogIn-mob").addClass("foldOut-mob");
        $("#invalidLogIn-mob").removeClass("foldIn-mob");
        setTimeout(() => {
            $("#invalidLogIn-mob").removeClass("sign-showErrorMessage-mob foldOut-mob");
            $("#invalidLogIn-mob").addClass("invalidLogIn-mob");
        }, 600);
        $scope.$apply();
    };

    $scope.toggleSign = function () {
        $scope.isReqLogIn = !$scope.isReqLogIn;
    };

    $scope.init();
});