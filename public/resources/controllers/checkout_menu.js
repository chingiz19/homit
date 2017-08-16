app.controller("cartController", function ($scope, $sce, $rootScope, $http, advancedStorage) {

    $scope.userCart = advancedStorage.getUserCart() || {};
    $scope.numberOfItemsInCart = 0;
    $scope.totalAmount = 0;

    $http({
        method: 'GET',
        url: 'api/cart/usercart'
    }).then(function successCallback(response) {
        if (response.data['success'] === true) {
            if (Object.entries($scope.userCart).length == 0){
                $scope.userCart = response.data['cart'];
            } else {
                advancedStorage.setUserCart({});
                var remoteCart = Object.entries(response.data['cart']);
                for (var i=0; i < remoteCart.length; i++){
                    var item = remoteCart[i];
                    var depot_id = item[0];
                    if ($scope.userCart.hasOwnProperty(depot_id)){
                        // add to quantity, not exceeding 10
                        var tmpQuantity = $scope.userCart[depot_id].quantity;
                        tmpQuantity += item[1].quantity;
                        
                        if (tmpQuantity >= 10) tmpQuantity = 10;

                        $scope.userCart[depot_id].quantity = tmpQuantity;
                    } else {
                        $scope.userCart[depot_id] = item[1];
                    }
                }
            }
        }

        for(var a in $scope.userCart){
            $scope.totalAmount = $scope.totalAmount + ($scope.userCart[a]['quantity'] * $scope.userCart[a]['price']);
            $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.userCart[a]['quantity'];
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
            $scope.prepareItemForDB(a, $scope.userCart[a].quantity);
        }
    }, function errorCallback(response) {
        $scope.userCart = advancedStorage.getUserCart($scope);
        console.log("error");
        console.log(response);
    });

    $scope.$on("addToCart", function (event, product) {
        var tmpQuantity = 1;
        if ($scope.userCart.hasOwnProperty(product.depot_id)) {
            tmpQuantity = $scope.userCart[product.depot_id]["quantity"];
            tmpQuantity++;

            if (tmpQuantity >= 10) tmpQuantity = 10;

            $scope.userCart[product.depot_id]["quantity"] = tmpQuantity;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + product.price;
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
        } else {
            $scope.userCart[product.depot_id] = product;
            $scope.userCart[product.depot_id]["quantity"] = tmpQuantity;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + product.price;
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
        }
        $scope.prepareItemForDB(product.depot_id,  $scope.userCart[product.depot_id].quantity);
    })

    $scope.plusItem = function (product) {
        var tmpQuantity = 1;
        if ($scope.userCart.hasOwnProperty(product.depot_id) && $scope.userCart[product.depot_id]["quantity"] < 10) {
            tmpQuantity = $scope.userCart[product.depot_id]["quantity"];
            tmpQuantity++;
            
            $scope.userCart[product.depot_id]["quantity"] = tmpQuantity;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + product.price;
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
        }
        $scope.prepareItemForDB(product.depot_id, $scope.userCart[product.depot_id].quantity);
    }

    $scope.minusItem = function (product) {
        var tmpQuantity = 1;
        if ($scope.userCart.hasOwnProperty(product.depot_id) && $scope.userCart[product.depot_id]["quantity"] > 1) {
            tmpQuantity = $scope.userCart[product.depot_id]["quantity"];
            tmpQuantity--;

            $scope.userCart[product.depot_id]["quantity"] = tmpQuantity;
            $scope.numberOfItemsInCart--;

            $scope.totalAmount = $scope.totalAmount - product.price;
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
        }

        $scope.prepareItemForDB(product.depot_id, $scope.userCart[product.depot_id].quantity);
    }

    $scope.clearCart = function (product) {
        $scope.userCart = {};
        $scope.numberOfItemsInCart = 0;
        $scope.totalAmount = 0;

        $http({
            method: 'POST',
            url: '/api/cart/clear',
        }).then(function successCallback(response) {
            if (response.data["error"] && response.data["error"].code == "C001") { // use local storage
                advancedStorage.setUserCart($scope.userCart);
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }

    $scope.removeFromCart = function (product) {
        if ($scope.userCart.hasOwnProperty(product.depot_id)) {
            delete $scope.userCart[product.depot_id];
            $scope.numberOfItemsInCart = $scope.numberOfItemsInCart - product.quantity;
            $scope.totalAmount = $scope.totalAmount - (product.price * product.quantity);
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
            $scope.prepareItemForDB(product.depot_id, 0);
        }
    }

    $scope.prepareItemForDB = function (depot_id, itemQuantity, action) {
        $scope.addItemToUserDB = {};
        $scope.addItemToUserDB["depot_id"] = depot_id;
        $scope.addItemToUserDB["quantity"] = itemQuantity;
        $scope.addItemToUserDB["action"] = action;

        $http({
            method: 'POST',
            url: '/api/cart/modifyitem',
            data: {
                depot_id: $scope.addItemToUserDB["depot_id"],
                quantity: $scope.addItemToUserDB["quantity"]
            }
        }).then(function successCallback(response) {
            if (response.data["error"] && response.data["error"].code == "C001") { // use local storage
                advancedStorage.setUserCart($scope.userCart);
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });

        // $http({
        //     method: 'GET',
        //     url: 'api/cart/usercart'
        // }).then(function successCallback(response) {
        //     if (response.data['success'] === true) {
        //         $scope.userCart = response.data['cart'];
        //     } else {
        //     }
        // }, function errorCallback(response) {
        //     console.log("error");
        //     console.log(response);
        // });

    }
});

$("#cart").click(function(){
    $(".sideMenu").toggleClass("show");
})