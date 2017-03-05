var app = angular.module('mainModule', []);

app.controller("mainController", function($scope, $http) {
    console.log("in the controller");
    $scope.a = "burdaki a";
    $scope.allProducts = "asasas";
    $scope.wines = "hyg";
    var scopsuz = "scopsuz";

    $scope.shabnamClicked = function() {
        // console.log("clicked on button 1 in angular - Shabnam");
        $http({
            method: 'GET',
            url: '/api/getAllProducts/beers/'
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                console.log(response);
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    }

    $scope.alslka = function() {
        console.log(data);
    
    }

    //f1


    //f2


    //f3
});

// var button1 = function(){
//     console.log("in button");
//     $.get('/api/getAllProducts/beers', function(data){
//         console.log("All beers are: " + data);
//     });
// }