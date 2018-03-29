/**
 * This directive is used to add google address autocomplete input box
 * 
 * Example usage:
 * <modal 
 *      show="true|false" // To show/hide modal (preferrably two way binded)
 * </modal>
 * 
 */
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
                    $("#sucLogIn").removeClass("sucSign");
                    $("#sucLogIn").addClass("sign-showSucMessage foldIn");
                    setTimeout(() => {
                        $window.location.reload();
                    }, 1000);
                } else {
                    $("#invalidLogIn").removeClass("invalidLogIn");
                    $("#invalidLogIn").addClass("sign-showErrorMessage foldIn");
                }
            }, function errorCallback(response) {
                pScope.logIn_message = "Couldn't connect. Please refresh the page and try again.";
                $("#emailNotification").addClass("sign-showErrorMessage");
                $("#invalidLogIn").removeClass("sign-showErrorMessage");
                $("#invalidLogIn").addClass("invalidLogIn");
            });
    };

    _scope._forgotPassword = function (valid) {
        if (!valid) return;
        user.forgotPassword(pScope.login_email)
            .then(function successCallback(response) {
                if (response.data.success) {
                    pScope.logIn_message = "Reset email has been successifully sent to " + pScope.login_email;
                    $("#emailNotification").addClass("sign-showErrorMessage");
                    $("#invalidLogIn").removeClass("sign-showErrorMessage");
                    $("#invalidLogIn").addClass("invalidLogIn");
                } else {
                    pScope.logIn_message = "Fail to sent password reset email to " + pScope.login_email + ". Please, try again.";
                    $("#emailNotification").addClass("sign-showErrorMessage");
                    $("#invalidLogIn").removeClass("sign-showErrorMessage");
                    $("#invalidLogIn").addClass("invalidLogIn");
                }
            }, function errorCallback(response) {
                pScope.logIn_message = "ERROR in password reset. Please contact info@homit.ca";
                $("#emailNotification").addClass("sign-showErrorMessage");
                $("#invalidLogIn").removeClass("sign-showErrorMessage");
                $("#invalidLogIn").addClass("invalidLogIn");
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
                    $("#sucSignUp").removeClass("sucSign");
                    $("#sucSignUp").addClass("sign-showSucMessage foldIn");
                    setTimeout(() => {
                        $window.location.reload();
                    }, 1000);
                } else {
                    pScope.logIn_message = "Fail to Sign Up. Please refresh page, and try again.";
                    $("#signUpNotification").removeClass("signUpNotification");
                    $("#signUpNotification").addClass("sign-showErrorMessage foldIn");
                }
            }, function errorCallback(response) {
                pScope.logIn_message = "Fail to Sign Up. Please refresh page, and try again.";
                $("#signUpNotification").removeClass("signUpNotification");
                $("#signUpNotification").addClass("sign-showErrorMessage foldIn");
            });
    };

    _scope._tryAgainLogIn = function () {
        pScope.login_email = "";
        pScope.login_password = "";
        $("#invalidLogIn").addClass("foldOut");
        $("#invalidLogIn").removeClass("foldIn");
        setTimeout(() => {
            $("#invalidLogIn").removeClass("sign-showErrorMessage foldOut");
            $("#invalidLogIn").addClass("invalidLogIn");
        }, 600);
    };

    return {
        restrict: "E", // restrict to element
        scope: {
            // _searchedAddress: "@", // itself, only used locally
            // addressChangeEvent: "<onAddressSelected", // required addressChanged event (one way binding)
            // autocomplete: "=", // public functions (two way binding)
            // inputClass: "@?inputClass",  // optional input element class(es) (as is biding)
            // iconClass: "@?iconClass", // optional x icon class(es) (as is biding)
            // inputDisabled: "@?inputDisabled", // optional input element
            // buttonClass: "@?buttonClass", // optional x button class(es) (as is biding)
            // bounds: "<autocompleteBounds" // autocomplete results in these bounds are shown first
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

                /* Helper functions */

            }, 0);
        }
    };
});
