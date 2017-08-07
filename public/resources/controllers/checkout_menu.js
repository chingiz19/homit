app.controller("cartController", function ($scope, $sce, $rootScope, $http) {
    $scope.userCart = {};
    $scope.numberOfItemsInCart = 0;
    $scope.totalAmount = 0;

    $http({
        method: 'GET',
        url: 'api/cart/usercart'
    }).then(function successCallback(response) {
        if (response.data['success'] === true) {
            $scope.userCart = response.data['cart'];
            for(var a in $scope.userCart){
                $scope.tempTotalAmount=$scope.userCart[a]['quantity']*$scope.userCart[a]['price'];
                $scope.totalAmount=$scope.totalAmount+$scope.tempTotalAmount;
                $scope.tempNumberOfItemsInCart=$scope.userCart[a]['quantity'];
                $scope.numberOfItemsInCart=$scope.numberOfItemsInCart+$scope.tempNumberOfItemsInCart;
            }
        } else {
        }
    }, function errorCallback(response) {
        console.log("error");
        console.log(response);
    });

    $scope.$on("addToCart", function (event, args) {
        var tmp = 1;
        if ($scope.userCart.hasOwnProperty(args.addedProduct.depot_ids)) {
            tmp = $scope.userCart[args.addedProduct.depot_ids]["quantity"];
            tmp++;
            if (tmp >= 10) tmp = 10;
            else {
                $scope.userCart[args.addedProduct.depot_ids]["quantity"] = tmp;
                $scope.numberOfItemsInCart++;
                $scope.totalAmount = $scope.totalAmount + args.addedProduct.pricing[args.addedProduct.i];
            }
        } else {
            $scope.userCart[args.addedProduct.depot_ids] = args.addedProduct;
            $scope.userCart[args.addedProduct.depot_ids]["quantity"] = tmp;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + args.addedProduct.pricing[args.addedProduct.i];
        }
        $scope.prepareItemForDB(args.addedProduct.depot_ids[args.addedProduct.i], tmp);
    })

    $scope.plusItem = function (product) {
        var tmp = 1;
        if ($scope.userCart.hasOwnProperty(product.depot_ids)) {
            tmp = $scope.userCart[product.depot_ids]["quantity"];
            tmp++;
            if (tmp >= 10) tmp = 10;
            else {
                $scope.userCart[product.depot_ids]["quantity"] = tmp;
                $scope.numberOfItemsInCart++;
                $scope.totalAmount = $scope.totalAmount + product.pricing[product.i];
            }
        }
        
        $scope.prepareItemForDB(args.addedProduct.depot_ids[args.addedProduct.i], tmp);
    }

    $scope.minusItem = function (product) {
        var tmp = 1;
        if ($scope.userCart.hasOwnProperty(product.depot_ids) && $scope.userCart[product.depot_ids]["quantity"] >= 1) {
            tmp = $scope.userCart[product.depot_ids]["quantity"];
            tmp--;
            if (tmp < 1) tmp = 1;
            else {
                $scope.userCart[product.depot_ids]["quantity"] = tmp;
                $scope.numberOfItemsInCart--;
                if ($scope.numberOfItemsInCart < 0) $scope.numberOfItemsInCart = 0;
                $scope.totalAmount = $scope.totalAmount - product.pricing[product.i];
                if ($scope.totalAmount < 0) $scope.totalAmount = 0;
            }
        }
        $scope.prepareItemForDB(args.addedProduct.depot_ids[args.addedProduct.i], tmp);
    }

    $scope.clearCart = function (product) {
        $scope.userCart = {};
        $scope.numberOfItemsInCart = 0;
        $scope.totalAmount = 0;

        $http({
            method: 'POST',
            url: '/api/cart/clear',
        }).then(function successCallback(response) {
            if (!response.data["error"]) {
            } else {
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }

    $scope.removeFromCart = function (product) {
        if ($scope.userCart.hasOwnProperty(product.depot_ids)) {
            var tmp = 0;
            delete $scope.userCart[product.depot_ids];
            $scope.numberOfItemsInCart = $scope.numberOfItemsInCart - product.quantity;
            $scope.totalAmount = $scope.totalAmount - product.pricing[product.i] * product.quantity;
            $scope.prepareItemForDB(args.addedProduct.depot_ids[args.addedProduct.i], tmp);
        }
    }

    $scope.prepareItemForDB = function (depot_ids, itemQuantity, action) {
        $scope.addItemToUserDB = {};
        $scope.addItemToUserDB["depot_ids"] = depot_ids;
        $scope.addItemToUserDB["quantity"] = itemQuantity;
        $scope.addItemToUserDB["action"] = action;

        $http({
            method: 'POST',
            url: '/api/cart/modifyitem',
            data: {
                warehouse_id: $scope.addItemToUserDB["depot_ids"],
                quantity: $scope.addItemToUserDB["quantity"],
            }
        }).then(function successCallback(response) {
            if (!response.data["error"]) {
            } else {
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });

        $http({
            method: 'GET',
            url: 'api/cart/usercart'
        }).then(function successCallback(response) {
            if (response.data['success'] === true) {
                $scope.userCart = response.data['cart'];
            } else {
            }
        }, function errorCallback(response) {
            console.log("error");
            console.log(response);
        });

    }
});

$("#cart").click(function(){
    $(".sideMenu").toggleClass("show");
})