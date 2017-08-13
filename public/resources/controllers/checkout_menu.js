app.controller("cartController", function ($scope, $sce, $rootScope, $http, advancedStorage) {

    $scope.userCart = advancedStorage.getUserCart() || {};
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
        if ($scope.userCart.hasOwnProperty(args.addedProduct.product_variants[args.addedProduct.variant_i].depot_id)) {
            tmp = $scope.userCart[args.addedProduct.product_variants[args.addedProduct.variant_i].depot_id]["quantity"];
            tmp++;
            if (tmp >= 10) tmp = 10;
            else {
                $scope.userCart[args.addedProduct.product_variants[args.addedProduct.variant_i].depot_id]["quantity"] = tmp;
                $scope.numberOfItemsInCart++;
                $scope.totalAmount = $scope.totalAmount + args.addedProduct.product_variants[args.addedProduct.variant_i].price;
            }
        } else {
            $scope.userCart[args.addedProduct.product_variants[args.addedProduct.variant_i].depot_id] = args.addedProduct;
            $scope.userCart[args.addedProduct.product_variants[args.addedProduct.variant_i].depot_id]["quantity"] = tmp;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + args.addedProduct.product_variants[args.addedProduct.variant_i].price;
        }
        $scope.prepareItemForDB(args.addedProduct.product_variants[args.addedProduct.variant_i].depot_id, tmp, args.addedProduct.variant_i);
    })

    $scope.plusItem = function (product) {
        var tmp = 1;
        if ($scope.userCart.hasOwnProperty(product.product_variants[product.variant_i].depot_id)) {
            tmp = $scope.userCart[product.product_variants[product.variant_i].depot_id]["quantity"];
            tmp++;
            if (tmp >= 10) tmp = 10;
            else {
                $scope.userCart[product.product_variants[product.variant_i].depot_id]["quantity"] = tmp;
                $scope.numberOfItemsInCart++;
                $scope.totalAmount = $scope.totalAmount + product.product_variants[product.variant_i].price;
            }
        }
        $scope.prepareItemForDB(product.product_variants[product.variant_i].depot_id, tmp, product.variant_i);
    }

    $scope.minusItem = function (product) {
        var tmp = 1;
        if ($scope.userCart.hasOwnProperty(product.product_variants[product.variant_i].depot_id) && $scope.userCart[product.product_variants[product.variant_i].depot_id]["quantity"] >= 1) {
            tmp = $scope.userCart[product.product_variants[product.variant_i].depot_id]["quantity"];
            tmp--;
            if (tmp < 1) tmp = 1;
            else {
                $scope.userCart[product.product_variants[product.variant_i].depot_id]["quantity"] = tmp;
                $scope.numberOfItemsInCart--;
                if ($scope.numberOfItemsInCart < 0) $scope.numberOfItemsInCart = 0;
                $scope.totalAmount = $scope.totalAmount - product.product_variants[product.variant_i].price;
                if ($scope.totalAmount < 1) $scope.totalAmount = 0;
            }
        }

        $scope.prepareItemForDB(product.product_variants[product.variant_i].depot_id, tmp, product.variant_i);
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
        if ($scope.userCart.hasOwnProperty(product.product_variants[product.variant_i].depot_id)) {
            var tmp = 0;
            delete $scope.userCart[product.product_variants[product.variant_i].depot_id];
            $scope.numberOfItemsInCart = $scope.numberOfItemsInCart - product.quantity;
            $scope.totalAmount = $scope.totalAmount - product.product_variants[product.variant_i].price * product.quantity;
            if ($scope.totalAmount < 1) $scope.totalAmount = 0;
            $scope.prepareItemForDB(product.product_variants[product.variant_i].depot_id, tmp, product.variant_i);
        }
    }

    $scope.prepareItemForDB = function (depot_id, itemQuantity, variant_i, action) {
        $scope.addItemToUserDB = {};
        $scope.addItemToUserDB["depot_id"] = depot_id;
        $scope.addItemToUserDB["quantity"] = itemQuantity;
        $scope.addItemToUserDB["variant_i"] = variant_i;
        $scope.addItemToUserDB["action"] = action;

        $http({
            method: 'POST',
            url: '/api/cart/modifyitem',
            data: {
                depot_id: $scope.addItemToUserDB["depot_id"],
                quantity: $scope.addItemToUserDB["quantity"],
                variant_i: $scope.addItemToUserDB["variant_i"]
            }
        }).then(function successCallback(response) {
            if (!response.data["error"]) {
            } else {
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