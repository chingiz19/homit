var app = angular.module('mainModule', []);

app.controller("LogoSearchController", function($scope, $http) {

});

app.controller("LoginController", function($scope, $http, $sce) {
    var _nextState = "next",
        _signinState = "signin",
        _signupState = "signup";

    var _currentButtonState;

    var login = this;
    login.reset = function(){
        login.modalTitle = "Sign...";
        login.mainButtonText = "Next";
        login.goToSignIn = false;
        login.goToSignUp = false;
        login.error = false;
        _currentButtonState = _nextState;

        login.email = "";
        login.password = "";
        login.fname = "";
        login.lname = "";
        login.phone = "";
        login.npassword = "";
        login.cpassword = "";
        login.dob = "";
    }

    login.reset();

    //check Email -> either go to sign in, or prompt sign up
    login.checkState = function(){
        switch (_currentButtonState){
            case _nextState: _checkEmail(); break
            case _signinState: _signIn(); break;
            case _signupState: _signUp(); break;
            default: login.email = "error occured@checkStage";
        }
    }

    // Used to show sign in form
    login.goToLogInForm = function(){
        login.error = false;
        login.goToSignIn = true;
        login.modalTitle = "Sign in";
        login.mainButtonText = "Sign in";
        _currentButtonState = _signinState;
    }

    // Used to show sign up form
    login.goToSignUpForm = function(){
        login.error = false;
        login.goToSignUp = true;
        login.modalTitle = "Sign up";
        login.mainButtonText = "Sign up";
        _currentButtonState = _signupState;
    }

    // Check email 
    var _checkEmail = function() {
        $http({
            method: 'GET',
            url: '/api/authentication/userexists',
            params: {
                email: login.email,
            }
        }).then(function successCallback(response) {
            if (response.data["success"] === "true") {
                login.goToLogInForm();
            } else {
                login.error = true;
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    };

    //Sign In 
    var _signIn = function() {
        $http({
            method: 'GET',
            url: '/api/authentication/signin',
            params: {
                email: login.email,
                password: login.password,
            }
        }).then(function successCallback(response) {
            if (response.data["success"] === "true") {
                alert("Login");
            } else {
                alert("No login");
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }

    //Sign Up
    var _signUp = function() {
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
            if (response.data["success"] === "true") {
                console.log("100% SUCCESS");
            } else {
                console.log("DEYIL");
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }
});

app.controller("NavigationController", function($scope, $http) {

});