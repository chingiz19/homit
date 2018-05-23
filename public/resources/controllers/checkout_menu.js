app.controller("cartController", 
function ($scope, $sce, $rootScope, $http, localStorage, cartService,$timeout, $mdSidenav, $log, $location, notification, googleAnalytics) {

    $scope.userCart = localStorage.getUserCart() || {};
    $scope.numberOfItemsInCart = 0;
    $scope.totalAmount = 0;
    $scope.store_type_api_name = $location.path().split("/")[2];

   cartService.getCart()
        .then(function successCallback(response) {
                if (response.data.success === true) {                                
                    updateUserCart(cartService.mergeCarts($scope.userCart, response.data.cart));
                } else {
                    updateUserCart(cartService.mergeCarts(localStorage.getUserCart(), {})); //REQUIRED to convert to new convention with store_type_api_name
                }
                localStorage.setUserCart({});    

                for(var store_type_api_name in $scope.userCart){
                    for (var a in $scope.userCart[store_type_api_name]){
                        $scope.totalAmount = $scope.totalAmount + ($scope.userCart[store_type_api_name][a].quantity * $scope.userCart[store_type_api_name][a].price);
                        $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.userCart[store_type_api_name][a].quantity;
                        $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                        $scope.prepareItemForDB(a, $scope.userCart[store_type_api_name][a].quantity);
                    }
                }
            }, function errorCallback(response) {
                updateUserCart(localStorage.getUserCart());
                alert("Couldn't retrieve your cart. If error persists contact customer service");
            });

    $scope.$on("addToCart", function (event, product) {
        var tmpQuantity = 1;
        var store_type_api_name = {};
        if ($scope.userCart.hasOwnProperty(product.store_type_api_name)) {
            store_type_api_name = $scope.userCart[product.store_type_api_name];
        }

        if (store_type_api_name.hasOwnProperty(product.depot_id)){
            tmpQuantity = store_type_api_name[product.depot_id].quantity;
            tmpQuantity++;

            if (tmpQuantity > 10) {
                tmpQuantity = 10;
                $scope.numberOfItemsInCart = $scope.numberOfItemsInCart;
            } else{
                $scope.numberOfItemsInCart ++;
                notification.addCartItem(product);
            }
            store_type_api_name[product.depot_id].quantity = tmpQuantity;
            $scope.totalAmount = $scope.totalAmount + product.price;
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
        } else {
            increaseCartItemIndexes(product.store_type_api_name);
            product.orderIndex = 0;
            store_type_api_name[product.depot_id] = product;
            store_type_api_name[product.depot_id].quantity = tmpQuantity;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + product.price;
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;   
            notification.addCartItem(product);         
        }
        $scope.userCart[product.store_type_api_name] = store_type_api_name;
        updateUserCart($scope.userCart);
        $scope.prepareItemForDB(product.depot_id,  $scope.userCart[product.store_type_api_name][product.depot_id].quantity);
        googleAnalytics.addEvent('add_to_cart', {
            "event_label": product.brand + " " + product.name,
            "event_category": googleAnalytics.eventCategories.cart_actions,
            "items": [
                {
                    name: product.name,
                    brand: product.brand,
                    quantity: tmpQuantity,
                    price: product.price,
                    category: product.packaging,
                    variant: product.volume,
                }
            ]
        });
    });

    $scope.plusItem = function (product) {
        if ($scope.userCart.hasOwnProperty(product.store_type_api_name) && $scope.userCart[product.store_type_api_name].hasOwnProperty(product.depot_id)) {
            var currentQuantity = $scope.userCart[product.store_type_api_name][product.depot_id].quantity;
            if (currentQuantity < 10) {              
                currentQuantity++;
                
                $scope.userCart[product.store_type_api_name][product.depot_id].quantity = currentQuantity;
                $scope.numberOfItemsInCart++;
                $scope.totalAmount = $scope.totalAmount + product.price;
                $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                
                updateUserCart($scope.userCart);
                $scope.prepareItemForDB(product.depot_id,  currentQuantity);
                googleAnalytics.addEvent('plus_cart_item', {
                    "event_label": product.brand + " " + product.name,
                    "event_category": googleAnalytics.eventCategories.cart_actions
                });
            }
        }
    };

    $scope.minusItem = function (product) {
        if ($scope.userCart.hasOwnProperty(product.store_type_api_name) && $scope.userCart[product.store_type_api_name].hasOwnProperty(product.depot_id)) {
            var currentQuantity = $scope.userCart[product.store_type_api_name][product.depot_id].quantity;
            if (currentQuantity > 1) {              
                currentQuantity--;
                
                $scope.userCart[product.store_type_api_name][product.depot_id].quantity = currentQuantity;
                $scope.numberOfItemsInCart--;
                $scope.totalAmount = $scope.totalAmount - product.price;
                $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                
                updateUserCart($scope.userCart);
                $scope.prepareItemForDB(product.depot_id,  currentQuantity);
                googleAnalytics.addEvent('minus_cart_item', {
                    "event_label": product.brand + " " + product.name,
                    "event_category": googleAnalytics.eventCategories.cart_actions
                });
            }
        }
    };

    $scope.clearCart = function (product) {
        updateUserCart({});
        $scope.numberOfItemsInCart = 0;
        $scope.totalAmount = 0;

        cartService.clearCart()
            .then(function successCallback(response) {
                if (response.data.error && response.data.error.code == "C001") { // use local storage
                    localStorage.setUserCart($scope.userCart);
                }
            }, function errorCallback(response) {
                Logger.log("ERROR");
            });
    };

    $scope.removeFromCart = function (product) {
        if ($scope.userCart.hasOwnProperty(product.store_type_api_name) && $scope.userCart[product.store_type_api_name].hasOwnProperty(product.depot_id)) {
            // delete item and reorder indexes of other items
            var index = $scope.userCart[product.store_type_api_name][product.depot_id].orderIndex;
            var super_c = product.store_type_api_name;
            delete $scope.userCart[product.store_type_api_name][product.depot_id];
            decreaseCartItemIndexes(super_c, index);
            // if store_type_api_name doesn't contain objects, then remove from list
            if (Object.entries($scope.userCart[product.store_type_api_name]).length == 0){
                delete $scope.userCart[product.store_type_api_name];
            }
            updateUserCart($scope.userCart);
            $scope.numberOfItemsInCart = $scope.numberOfItemsInCart - product.quantity;
            $scope.totalAmount = $scope.totalAmount - (product.price * product.quantity);
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
            $scope.prepareItemForDB(product.depot_id, 0);

            googleAnalytics.addEvent('remove_from_cart', {
                "event_label": product.brand + " " + product.name,
                "event_category": googleAnalytics.eventCategories.cart_actions,
                "items": [
                    {
                        name: product.name,
                        brand: product.brand,
                        price: product.price,
                        category: product.packaging,
                        variant: product.volume,
                    }
                ]
            });
        }
    };

    $scope.prepareItemForDB = function (depot_id, itemQuantity, action) {
        cartService.modifyCartItem(depot_id, itemQuantity)
            .then(function successCallback(response) {
                if (response.data.error && response.data.error.code == "C001") { // use local storage
                    localStorage.setUserCart($scope.userCart);
                }
            }, function errorCallback(response) {
                Logger.log("ERROR");
            });
    };

    function updateUserCart(cart){
        $scope.userCart = cart;
        $scope.userCartToView = cartService.getViewUserCart($scope.store_type_api_name, $scope.userCart);
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



    /**
     * Logic for increase/decrease order indexes of Cart items
     * @param {*} increase
     */
    function updateCartItemIndexes(increase, store_type_api_name, deletedItemIndex){
        if (!$scope.userCart[store_type_api_name]){
            return;
        }

        var depot_ids = Object.keys($scope.userCart[store_type_api_name]);
        for (var i = 0; i < depot_ids.length; i++){
            var depot_id = depot_ids[i];
            var currentIndex = $scope.userCart[store_type_api_name][depot_id].orderIndex;
            if (increase){
                // increase
                $scope.userCart[store_type_api_name][depot_id].orderIndex = currentIndex + 1;
            } else {
                // decrease
                if (currentIndex > deletedItemIndex){
                    $scope.userCart[store_type_api_name][depot_id].orderIndex = currentIndex - 1;
                }
            }
        }
    }

    /**
     * Helper method to increase order indexes of Cart items
     */
    function increaseCartItemIndexes(store_type_api_name){
        updateCartItemIndexes(true, store_type_api_name);
    }

    /**
     * Helper method to decrease order indexes of Cart items
     */
    function decreaseCartItemIndexes(store_type_api_name, deletedItemIndex){
        updateCartItemIndexes(false, store_type_api_name, deletedItemIndex);
    }


});

