app.controller("checkoutController", function($scope, $http, $location, $rootScope) {

    $scope.userCart = {};
    $scope.numberOfItemsInCart = 0;
    $scope.totalAmount = 0;

    if (1 == 1) { console.log("Payment Page") };

    $http({
        method: 'GET',
        url: 'api/cart/usercart'
    }).then(function successCallback(response) {
        if (response.data['success'] === true) {
            $scope.userCart = response.data['cart'];
            console.log(response.data['cart']);
            for (var a in $scope.userCart) {
                $scope.tempTotalAmount = $scope.userCart[a]['quantity'] * $scope.userCart[a]['price'];
                $scope.totalAmount = $scope.totalAmount + $scope.tempTotalAmount;
                $scope.tempNumberOfItemsInCart = $scope.userCart[a]['quantity'];
                $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.tempNumberOfItemsInCart;
            }
        } else {
        }
    }, function errorCallback(response) {
        console.log("error");
        console.log(response);
    });

});