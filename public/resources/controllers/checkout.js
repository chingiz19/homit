app.controller("checkoutController", function($scope, $http, $location, $rootScope, $cookies) {

    $scope.userCart = {};
    $scope.numberOfItemsInCart = 0;
    $scope.totalAmount = 0;
    $scope.delFee=3.99;
    $scope.GST=0;
    $scope.receipt=0;
    $scope.userInfo = JSON.parse( $cookies.get("user").replace("j:", ""));
    $scope.orderer = {};

    $http({
        method: 'GET',
        url: 'api/cart/usercart'
    }).then(function successCallback(response) {
        if (response.data['success'] === true) {
            $scope.userCart = response.data['cart'];
            for (var a in $scope.userCart) {
                $scope.tempTotalAmount = $scope.userCart[a]['quantity'] * $scope.userCart[a]['price'];
                $scope.totalAmount = $scope.totalAmount + $scope.tempTotalAmount;
                $scope.tempNumberOfItemsInCart = $scope.userCart[a]['quantity'];
                $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.tempNumberOfItemsInCart;
            }
            console.log($scope.userCart);
            // Calculation For receipt
            $scope.GST=(($scope.totalAmount+$scope.delFee)*0.05).toFixed(2);
            $scope.receipt=(($scope.totalAmount+$scope.delFee)*1.05).toFixed(2);
        } else {
        }
    }, function errorCallback(response) {
        console.log("error");
        console.log(response);
    });

    $scope.$on("addToCart", function (event, args) {
        var tmp = 1;
        if ($scope.userCart.hasOwnProperty(args.addedProduct.warehouse_id)) {
            tmp = $scope.userCart[args.addedProduct.warehouse_id]["quantity"];
            tmp++;
            if (tmp >= 10) tmp = 10;
            else {
                $scope.userCart[args.addedProduct.warehouse_id]["quantity"] = tmp;
                $scope.numberOfItemsInCart++;
                $scope.totalAmount = $scope.totalAmount + args.addedProduct.price;
            }
        } else {
            $scope.userCart[args.addedProduct.warehouse_id] = args.addedProduct;
            $scope.userCart[args.addedProduct.warehouse_id]["quantity"] = tmp;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + args.addedProduct.price;
        }
        $scope.prepareItemForDB(args.addedProduct.depot_ids[args.addedProduct.i], tmp);
    })

    $scope.plusItem = function (product) {
        var tmp = 1;
        if ($scope.userCart.hasOwnProperty(product.warehouse_id)) {
            tmp = $scope.userCart[product.warehouse_id]["quantity"];
            tmp++;
            if (tmp >= 10) tmp = 10;
            else {
                $scope.userCart[product.warehouse_id]["quantity"] = tmp;
                $scope.numberOfItemsInCart++;
                $scope.totalAmount = $scope.totalAmount + product.price;
            }
        }
        $scope.prepareItemForDB(args.addedProduct.depot_ids[args.addedProduct.i], tmp);
    }

    $scope.minusItem = function (product) {
        var tmp = 1;
        if ($scope.userCart.hasOwnProperty(product.warehouse_id) && $scope.userCart[product.warehouse_id]["quantity"] >= 1) {
            tmp = $scope.userCart[product.warehouse_id]["quantity"];
            tmp--;
            if (tmp < 1) tmp = 1;
            else {
                $scope.userCart[product.warehouse_id]["quantity"] = tmp;
                $scope.numberOfItemsInCart--;
                if ($scope.numberOfItemsInCart < 0) $scope.numberOfItemsInCart = 0;
                $scope.totalAmount = $scope.totalAmount - product.price;
                if ($scope.totalAmount < 0) $scope.totalAmount = 0;
            }
        }
        $scope.prepareItemForDB(args.addedProduct.depot_ids[args.addedProduct.i]d, tmp);
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
        if ($scope.userCart.hasOwnProperty(product.warehouse_id)) {
            var tmp = 0;
            delete $scope.userCart[product.warehouse_id];
            $scope.numberOfItemsInCart = $scope.numberOfItemsInCart - product.quantity;
            $scope.totalAmount = $scope.totalAmount - product.price * product.quantity;
            $scope.prepareItemForDB(args.addedProduct.depot_ids[args.addedProduct.i], tmp);
        }
    }

    $scope.prepareItemForDB = function (warehouse_id, itemQuantity, action) {
        $scope.addItemToUserDB = {};
        $scope.addItemToUserDB["warehouse_id"] = warehouse_id;
        $scope.addItemToUserDB["quantity"] = itemQuantity;
        $scope.addItemToUserDB["action"] = action;

        $http({
            method: 'POST',
            url: '/api/cart/modifyitem',
            data: {
                warehouse_id: $scope.addItemToUserDB["warehouse_id"],
                quantity: $scope.addItemToUserDB["quantity"],
            }
        }).then(function successCallback(response) {
            if (!response.data["error"]) {
            } else {
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });     
        // Calculation For receipt
        $scope.GST=(($scope.totalAmount+$scope.delFee)*0.05).toFixed(2);
        $scope.receipt=(($scope.totalAmount+$scope.delFee)*1.05).toFixed(2);
    }

$scope.PaimentProcessed=function(){

    if ($scope.userInfo){
        $scope.customer=[
            {fname:$scope.userInfo.first_name},
            {lname:$scope.userInfo.last_name},
            {pnumber:$scope.userInfo.phone_number},
            {eaddress:$scope.userInfo.user_email},
            {daddress:$scope.orderer.newDeliveryAddress}
        ];
    }
    else{
        $scope.customer=[
            {fname:$scope.orderer.first_name},
            {lname:$scope.orderer.last_name},
            {pnumber:$scope.orderer.phone_number},
            {eaddress:$scope.orderer.user_email},
            {daddress:$scope.orderer.DeliveryAddress}
        ];
    }
};

});