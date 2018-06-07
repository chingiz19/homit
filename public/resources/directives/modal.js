app.directive("modal", function ($timeout, user, $window) {

    var publicFunctions = {};
    var pScope;
    var _scope = {};


    _scope._toggleModal = function () {
        pScope._showLogIn = !pScope._showLogIn;
    };

    _scope._close = function () {
        pScope._show = false;
    };

    _scope._login = function (valid) {
        if (!valid) return;
        user.login(pScope.login_email, pScope.login_password)
            .then(function successCallback(response) {
                if (response.data.success) {
                    $("#sucLogIn").removeClass("sucSign").addClass("sign-showSucMessage");
                    setTimeout(() => {
                        $window.location.reload();
                    }, 2000);
                } else {
                    $("#invalidLogIn").removeClass("invalidLogIn").addClass("sign-showErrorMessage messageIn");
                }
            }, function errorCallback(response) {
                pScope.logIn_message = "Couldn't connect. Please refresh the page and try again.";
                $("#emailNotification").addClass("sign-showErrorMessage");
                $("#invalidLogIn").removeClass("sign-showErrorMessage").addClass("invalidLogIn");
            });
    };

    _scope._forgotPassword = function (valid) {
        if (!valid) return;
        user.forgotPassword(pScope.login_email)
            .then(function successCallback(response) {
                if (response.data.success) {
                    pScope.logIn_message = "Reset email has been successifully sent to " + pScope.login_email;
                    $("#emailNotification").addClass("sign-showErrorMessage");
                    $("#invalidLogIn").removeClass("sign-showErrorMessage").addClass("invalidLogIn");
                } else {
                    pScope.logIn_message = "Fail to sent password reset email to " + pScope.login_email + ". Please, try again.";
                    $("#emailNotification").addClass("sign-showErrorMessage");
                    $("#invalidLogIn").removeClass("sign-showErrorMessage").addClass("invalidLogIn");
                }
            }, function errorCallback(response) {
                pScope.logIn_message = "ERROR in password reset. Please contact info@homit.ca";
                $("#emailNotification").addClass("sign-showErrorMessage");
                $("#invalidLogIn").removeClass("sign-showErrorMessage").addClass("invalidLogIn");
            });
    };

    _scope._signup = function (valid) {
        if (!valid) return;
        user.signup({
            email: pScope.signup_email,
            password: pScope.signup_password,
            fname: pScope.signup_fname,
            lname: pScope.signup_lname
        })
            .then(function successCallback(response) {
                if (response.data.success) {
                    $("#sucSignUp").removeClass("sucSign").addClass("sign-showSucMessage");
                    setTimeout(() => {
                        $window.location.reload();
                    }, 2000);
                } else {
                    pScope.logIn_message = "Fail to Sign Up. Please refresh page, and try again.";
                    $("#signUpNotification").removeClass("signUpNotification").addClass("sign-showErrorMessage messageIn");
                }
            }, function errorCallback(response) {
                pScope.logIn_message = "Fail to Sign Up. Please refresh page, and try again.";
                $("#signUpNotification").removeClass("signUpNotification").addClass("sign-showErrorMessage messageIn");
            });
    };

    _scope._tryAgainLogIn = function () {
        pScope.login_email = "";
        pScope.login_password = "";
        $("#invalidLogIn").addClass("messageOut").removeClass("messageIn");
        setTimeout(() => {
            $("#invalidLogIn").addClass("invalidLogIn").removeClass("sign-showErrorMessage messageOut");
        }, 400);
    };

    return {
        restrict: "E", // restrict to element
        scope: {
            _show: "=show", // To show/hide modal
            _showLogIn: "=showLogin" // To show Login or Signup
        },
        templateUrl: '/resources/templates/modal.html',
        link: function (scope, element, attrs) {
            // waits for DOM load
            // Need let google APIs to load
            $timeout(function () {
                //variable assignment
                for (var func in _scope) {
                    scope[func] = _scope[func];
                }
                pScope = scope;
                scope.passPattern = '^(?:([^\ ]))*$';
            }, 0);
        }
    };
});
