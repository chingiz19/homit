var app = angular.module('mainModule', []);

app.controller("LoginController", function($scope, $http) {
    console.log("in the Log in controller");

    $scope.signEmail=false;
    $scope.ifcheckedEmailFalse=false;
    $scope.ifsignUpTrue=false;
    $scope.reeneteredPasswordFalse=false;

//Sign Modal
    var next_modal = document.getElementById('next-sign_modal');
    var buttn = document.getElementById("sign");
    var span=document.getElementsByClassName("close")[0];

    buttn.onclick=function () {
        console.log("signin button clicked");
        next_modal.style.display="block";
    }
    
    span.onclick=function(){
        console.log("closed");
        next_modal.style.display="close";
    }
    window.onclick=function(event){
        if(event.target==next_modal){
            next_modal.style.display="none";
        }
    }

//Check Email
    $scope.signClicked = function() {
    $http({
        method: 'GET',
        url: '/api/authentication/userexists',
        params: {
                email: $scope.sign.email,
            }
        }).then(function successCallback(response) {
            if (response.data["success"] === "true") {
                console.log("100% SUCCESS");
                $scope.signEmail=true;
                $scope.ifcheckedEmailFalse=false;
            } else {
                console.log("DEYIL");
                $scope.signEmail=false;
                $scope.ifcheckedEmailFalse=true;
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }   

    $scope.gotosingUpClicked = function()  {
       $scope.ifsignUpTrue=true;
    } 

//Sign In
    $scope.signInClicked = function() {
    $http({
        method: 'GET',
        url: '/api/authentication/signin',
        params: {
                email: $scope.sign.email,
                password: $scope.signin.password,
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
        if($scope.signup.password==$scope.signup.PasswordCheck){
            $http({
                method: 'POST',
                url: '/api/authentication/signup',
                params: {
                        email: $scope.sign.email,
                        fname: $scope.signup.fname,
                        lname: $scope.signup.lname,
                        phone: $scope.signup.phone,
                        password: $scope.signup.PasswordCheck,
                        dob: $scope.signup.dob,
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
        $scope.reeneteredPasswordFalse=false;
        }
        else{
            $scope.reeneteredPasswordFalse=true;
        }
    }

});