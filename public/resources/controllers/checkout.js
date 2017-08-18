app.controller("checkoutController", 
function($scope, $http, $location, $rootScope, $cookies, advancedStorage, cartService) {

    $scope.localCartName = "bizim_userCart";
    $scope.userCart = advancedStorage.getUserCart() || {};
    $scope.numberOfItemsInCart = 0;
    $scope.totalAmount = 0;
    $scope.delFee=3.99;
    $scope.GST=0;
    $scope.receipt=0;
    $scope.userInfo = {};
    $scope.orderer = {};

    $scope.init = function(){
        try{
            $scope.userInfo = JSON.parse( $cookies.get("user").replace("j:", ""));
        }catch(e){
            $scope.userInfo = {};
        }
    }

     cartService.getCart()
        .then(function successCallback(response) {
            if (response.data['success'] === true) {
                if (Object.entries($scope.userCart).length == 0){
                    $scope.userCart = response.data['cart'];
                } else {
                    advancedStorage.setUserCart({});
                    $scope.userCart = cartService.mergeCarts($scope.userCart, response.data['cart']);
                }
            }

            for(var a in $scope.userCart){
                $scope.totalAmount = $scope.totalAmount + ($scope.userCart[a]['quantity'] * $scope.userCart[a]['price']);
                $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.userCart[a]['quantity'];
                $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                $scope.prepareItemForDB(a, $scope.userCart[a].quantity);
            }

            // Calculation For receipt
            $scope.GST=(($scope.totalAmount+$scope.delFee)*0.05).toFixed(2);
            $scope.receipt=(($scope.totalAmount+$scope.delFee)*1.05).toFixed(2);

        }, function errorCallback(response) {
            $scope.userCart = advancedStorage.getUserCart($scope);
            console.log("error");
            console.log(response);
        });

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

        cartService.clearCart()
            .then(function successCallback(response) {
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
        cartService.modifyCartItem(depot_id, itemQuantity)
            .then(function successCallback(response) {
                if (response.data["error"] && response.data["error"].code == "C001") { // use local storage
                    advancedStorage.setUserCart($scope.userCart);
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

$scope.init();

});