app.controller("cartController", 
function ($scope, $sce, $rootScope, $http, advancedStorage, cartService,$timeout, $mdSidenav, $log, $location) {

    $scope.userCart = advancedStorage.getUserCart() || {};
    $scope.numberOfItemsInCart = 0;
    $scope.totalAmount = 0;
    $scope.super_category = $location.path().split("/")[2];

   cartService.getCart()
        .then(function successCallback(response) {
                if (response.data['success'] === true) {                                
                    updateUserCart(cartService.mergeCarts($scope.userCart, response.data['cart']))
                } else {
                    updateUserCart(cartService.mergeCarts(advancedStorage.getUserCart(), {})); //REQUIRED to convert to new convention with super_category
                }
                advancedStorage.setUserCart({});    

                for(var super_category in $scope.userCart){
                    for (var a in $scope.userCart[super_category]){
                        $scope.totalAmount = $scope.totalAmount + ($scope.userCart[super_category][a]['quantity'] * $scope.userCart[super_category][a]['price']);
                        $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.userCart[super_category][a]['quantity'];
                        $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                        $scope.prepareItemForDB(a, $scope.userCart[super_category][a].quantity);
                    }
                }
            }, function errorCallback(response) {
                updateUserCart(advancedStorage.getUserCart());
                alert("Couldn't retrieve your cart. If error persists contact customer service");
            });

    $scope.$on("addToCart", function (event, product) {
        var tmpQuantity = 1;
        var super_category = {};
        if ($scope.userCart.hasOwnProperty(product.super_category)) {
            var super_category = $scope.userCart[product.super_category];
        }

        if (super_category.hasOwnProperty(product.depot_id)){
            tmpQuantity = super_category[product.depot_id]["quantity"];
            tmpQuantity++;

            if (tmpQuantity >= 10) tmpQuantity = 10;

            super_category[product.depot_id]["quantity"] = tmpQuantity;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + product.price;
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
        } else {
            super_category[product.depot_id] = product;
            super_category[product.depot_id]["quantity"] = tmpQuantity;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + product.price;
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
        }
        $scope.userCart[product.super_category] = super_category;
        updateUserCart($scope.userCart);
        $scope.prepareItemForDB(product.depot_id,  $scope.userCart[product.super_category][product.depot_id].quantity);
    })

    $scope.plusItem = function (product) {
        if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
            var currentQuantity = $scope.userCart[product.super_category][product.depot_id]["quantity"];
            if (currentQuantity < 10) {              
                currentQuantity++;
                
                $scope.userCart[product.super_category][product.depot_id]["quantity"] = currentQuantity;
                $scope.numberOfItemsInCart++;
                $scope.totalAmount = $scope.totalAmount + product.price;
                $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                
                updateUserCart($scope.userCart);
                $scope.prepareItemForDB(product.depot_id,  currentQuantity);
            }
        }
    }

    $scope.minusItem = function (product) {
        if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
            var currentQuantity = $scope.userCart[product.super_category][product.depot_id]["quantity"];
            if (currentQuantity > 1) {              
                currentQuantity--;
                
                $scope.userCart[product.super_category][product.depot_id]["quantity"] = currentQuantity;
                $scope.numberOfItemsInCart--;
                $scope.totalAmount = $scope.totalAmount - product.price;
                $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                
                updateUserCart($scope.userCart);
                $scope.prepareItemForDB(product.depot_id,  currentQuantity);
            }
        }
    }

    $scope.clearCart = function (product) {
        updateUserCart({});
        $scope.numberOfItemsInCart = 0;
        $scope.totalAmount = 0;

        cartService.clearCart()
            .then(function successCallback(response) {
                if (response.data["error"] && response.data["error"].code == "C001") { // use local storage
                    advancedStorage.setUserCart($scope.userCart);
                }
            }, function errorCallback(response) {
                Logger.log("ERROR");
            });
    }

    $scope.removeFromCart = function (product) {
        if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
            delete $scope.userCart[product.super_category][product.depot_id];
            
            // if super_category doesn't contain objects, then remove from list
            if (Object.entries($scope.userCart[product.super_category]).length == 0){
                delete $scope.userCart[product.super_category];
            }

            updateUserCart($scope.userCart);
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
                Logger.log("ERROR");
            });
    }

    function updateUserCart(cart){
        $scope.userCart = cart;
        $scope.userCartToView = cartService.getViewUserCart($scope.super_category, $scope.userCart);
    }
    
    // User Cart right-SideNav functionality
    // Start
    $scope.toggleRight = buildToggler('right');
    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };
    function debounce(func, wait, context) {
      var timer;
      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }
    function buildToggler(navID) {
      return function() {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      };
    }
    $scope.close = function () {
      $mdSidenav('right').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };
    // End


});

