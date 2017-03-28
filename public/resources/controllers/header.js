var app = angular.module('mainModule', []);

app.controller("LogoSearchController", function($scope, $http) {

});

app.controller("LoginController", function($scope, $http) {
    $scope.signEmail = false;
    $scope.signEmailCorrect = false;
    $scope.ifcheckedEmailFalse = false;
    $scope.ifsignUpTrue = false;
    $scope.reeneteredPasswordFalse = false;

    //Sign Modal
    var next_modal = document.getElementById('next-sign_modal');
    var buttn = document.getElementById("sign");
    var span = document.getElementsByClassName("close")[0];

    buttn.onclick = function() {
        console.log("signin button clicked");
        next_modal.style.display = "block";
    }

    span.onclick = function() {
        console.log("closed");
        next_modal.style.display = "close";
    }
    window.onclick = function(event) {
        if (event.target == next_modal) {
            next_modal.style.display = "none";
        }
    }

    //Check Email
    $scope.nextClicked = function() {
        $http({
            method: 'GET',
            url: '/api/authentication/userexists',
            params: {
                email: $scope.emailSign,
            }
        }).then(function successCallback(response) {
            if (response.data["success"] === "true") {
                console.log("100% SUCCESS");
                $scope.signEmail = true;
                $scope.signEmailCorrect = true;
                $scope.ifcheckedEmailFalse = false;
            } else {
                console.log("DEYIL");
                $scope.signEmail = true;
                $scope.ifcheckedEmailFalse = true;
                $scope.signEmailCorrect = false;
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }

    $scope.gotosingUpClicked = function() {
        $scope.ifsignUpTrue = true;
    }

    //Sign In
    $scope.signInClicked = function() {
        $http({
            method: 'GET',
            url: '/api/authentication/signin',
            params: {
                email: $scope.emailSign,
                password: $scope.passwordSignIn,
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

    //Sign Up
    $scope.signUpClicked = function() {
        if ($scope.signup.password == $scope.signup.PasswordCheck) {
            $http({
                method: 'POST',
                url: '/api/authentication/signup',
                params: {
                    email: $scope.emailSignUp,
                    fname: $scope.fNameSignUp,
                    lname: $scope.lNameSignUp,
                    phone: $scope.phoneSignUp,
                    password: $scope.passwordCheckSignUp,
                    dob: $scope.dobSignUp,
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
            $scope.reeneteredPasswordFalse = false;
        } else {
            $scope.reeneteredPasswordFalse = true;
        }
    }

});

app.controller("NavigationController", function($scope, $http) {

});