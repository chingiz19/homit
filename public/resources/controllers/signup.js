app.controller("LoginController", function ($scope, $http, $sce, $route, $rootScope, $mdToast) {
    $rootScope.isSigned = false; 
    
    var _nextState = "next",
        _signinState = "signin",
        _signupState = "signup",
        _forgotPasswordState = "forgotPassword";

    var _currentButtonState;

    var login = this;
    login.reset = function () {
        login.modalTitle = "";
        login.mainButtonText = "Next";
        login.goToSignIn = false;
        login.goToSignUp = false;
        login.goToForgotPassword = false;
        login.isLoading = false;
        login.signUpErrorAction = "Sign up?";
        login.passwordErrorAction = "Forgot password?";
        login.loadingMessage = "";
        _currentButtonState = _nextState;

        login.email = "";
        login.password = "";
        login.fname = "";
        login.lname = "";
        login.dob = "";
    }

    login.reset();

    login.showToast = function(message, action){
        var toast = $mdToast.simple()
                .textContent(message)
                .highlightAction(true)
                .highlightClass("md-accent")
                .toastClass("toast-white")
                .parent($("notification"))
                .position('top right');

        if (action) {
            toast.action(action);
            $mdToast.show(toast).then(function(response){
                if (response === 'ok'){
                    if (action == login.signUpErrorAction){
                        login.goToSignUpForm();
                    } else if (action == login.passwordErrorAction){
                        login.goToForgotPasswordForm();
                    } else {
                        console.error("ERROR");
                    }
                }
            })
        } else {
            $mdToast.show(toast);
        }
    };

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
        login.mainButtonText = "Sign up";
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
            method: 'POST',
            url: '/api/authentication/userexists',
            data: {
                email: login.email
            }
        }).then(function successCallback(response) {
            if (response.data["exists"]) {
                login.goToLogInForm();
            } else {
                login.showToast("Login doesn't exist", login.signUpErrorAction);
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    };

    //Sign In 
    var _signIn = function () {
        $http({
            method: 'POST',
            url: '/api/authentication/signin',
            params: {
                email: login.email,
                password: login.password,
            }
        }).then(function successCallback(response) {
            if (!response.data["error"]) {
                setLoading("Signing in...");
                setTimeout(function () {
                    window.location.reload();
                }, 4000);
            } else {
                login.showToast(response.data["error"].ui_message, login.passwordErrorAction);
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }

    var setLoading = function(message){
        login.reset();
        login.modalTitle = "";
        login.loadingMessage = message;
        login.isLoading = true;
    }

    //Sign Up
    var _signUp = function () {
        //TODO: find out why this is not working without reassignment
        login.password = login.password;
        var password = login.password;
        $http({
            method: 'POST',
            url: '/api/authentication/signup',
            data: {
                password: password,
                email: login.email,
                fname: login.fname,
                lname: login.lname,
                birth_day: login.birth_day,
                birth_month: login.birth_month,
                birth_year: login.birth_year
            }
        }).then(function successCallback(response) {
            if (!response.data["error"]) {
                setLoading("Signing in...");
                setTimeout(function () {
                    window.location.reload();
                }, 4000);
            } else {
                login.showToast(response.data["error"].ui_message);
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