var app = angular.module('mainModule', []);

app.controller("LoginController", function($scope, $http) {
    console.log("in the Log in controller");

    var modal = document.getElementById('sign_modal');
    var buttn = document.getElementById("sign");
    var span=document.getElementsByClassName("close")[0];

    buttn.onclick=function () {
        console.log("signin button clicked");
        modal.style.display="block";
    }
    span.onclick=function(){
        console.log("closed");
        modal.style.display="close";
    }
    window.onclick=function(event){
        if(event.target==modal){
            modal.style.display="none";
        }
    }

    $scope.signInClicked = function() {
        console.log("sign in clicked");

        console.log($scope.signin.email);

        // call to backend

        $http({
            method: 'GET',
            url: '/api/authentication/signin',
            params: {
                    email: $scope.signin.email,
                    password: $scope.signin.password
                }
            }).then(function successCallback(response) {
                console.log("SUCCESS");

                console.log(response);

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



// cart controller