app.controller("LogoSearchController", function ($scope, $http) {

});

app.controller("LoginController", function ($scope, $http, $sce, $route, $rootScope) {
    $rootScope.isSigned = false; 
    
    var _nextState = "next",
        _signinState = "signin",
        _signupState = "signup",
        _forgotPasswordState = "forgotPassword";

    var _currentButtonState;

    var login = this;
    login.reset = function () {
        login.modalTitle = "Sign...";
        login.mainButtonText = "Next";
        login.goToSignIn = false;
        login.goToSignUp = false;
        login.goToForgotPassword = false;
        login.error = 0;
        _currentButtonState = _nextState;

        login.email = "";
        login.password = "";
        login.fname = "";
        login.lname = "";
        login.phone = "";
        login.npassword = "";
        login.cpassword = "";
        login.dob = "";
        login.forgotPasswordEmail = "";
    }

    login.reset();

    //check Email -> either go to sign in, or prompt sign up
    login.checkState = function () {
        switch (_currentButtonState) {
            case _nextState: _checkEmail(); break
            case _signinState: _signIn(); break;
            case _signupState: _signUp(); break;
            case _forgotPasswordState: _forgotPassword(); break;
            default: login.email = "error occured@checkStage";
        }
    }

    // Used to show sign in form
    login.goToLogInForm = function () {
        var e = login.email;
        login.reset();
        login.email = e;
        login.goToSignIn = true;
        login.modalTitle = "Sign in";
        login.mainButtonText = "Sign in";
        _currentButtonState = _signinState;
    }

    // Used to show sign up form
    login.goToSignUpForm = function () {
        var tmp_email = login.email;
        login.reset();
        login.email = tmp_email;
        login.goToSignUp = true;
        login.modalTitle = "Sign up";
        login.mainBut7tonText = "Sign up";
        _currentButtonState = _signupState;
    }

    // Used to show forgot password form
    login.goToForgotPasswordForm = function () {
        login.reset();
        login.goToForgotPassword = true;
        login.modalTitle = "Forgot password";
        login.mainButtonText = "Reset";
        _currentButtonState = _forgotPasswordState;
    }

    // Check email 
    var _checkEmail = function () {
        $http({
            method: 'GET',
            url: '/api/authentication/userexists',
            params: {
                email: login.email,
            }
        }).then(function successCallback(response) {
            if (response.data["exists"]) {
                login.goToLogInForm();
            } else {
                login.error = 1;
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    };

    //Sign In 
    var _signIn = function () {
        $http({
            method: 'GET',
            url: '/api/authentication/signin',
            params: {
                email: login.email,
                password: login.password,
            }
        }).then(function successCallback(response) {
            $scope.trueFalse=false;
            if (!response.data["error"]) {
                login.hideModal();
                $rootScope.$broadcast("addNotification", { type: "alert-success", message: response.data["ui_message"] });
                setTimeout(function () {
                    window.location.reload();
                }, 2500);

                
            } else {
                login.error = 2;
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }

    //Sign Up
    var _signUp = function () {
        //TODO: find out why this is not working without reassignment
        login.npassword = login.npassword;
        var password = login.npassword;
        $http({
            method: 'POST',
            url: '/api/authentication/signup',
            data: {
                password: password,
                email: login.email,
                fname: login.fname,
                lname: login.lname,
                phone: login.phone,
                dob: login.dob
            }
        }).then(function successCallback(response) {
            if (!response.data["error"]) {
                login.hideModal();
                login.reset();
                $rootScope.$broadcast("addNotification", { type: "alert-success", message: response.data["ui_message"] });
            } else {
                $rootScope.$broadcast("addNotification", { type: "alert-error", message: response.data["error"].ui_message });
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }

    var _forgotPassword = function () {
        $http({
            method: 'POST',
            url: '/api/authentication/resetpassword',
            data: {
                email: login.forgotPasswordEmail
            }
        }).then(function successCallback(response) {
            if (response.data["success"] === "true") {
                console.log("password reset");
            } else {
                console.log("password not reset");
            }
        }, function errorCallback(response) {
            console.log("ERROR in password reset");
        });
    }

    login.hideModal = function () {
        $('#loginModal').modal('hide');
    }
});

app.controller("NavigationController", function ($scope, $http) {
});