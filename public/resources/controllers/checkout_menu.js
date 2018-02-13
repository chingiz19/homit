app.controller("cartController", 
function ($scope, $sce, $rootScope, $http, localStorage, cartService,$timeout, $mdSidenav, $log, $location, notification, googleAnalytics) {

    $scope.userCart = localStorage.getUserCart() || {};
    $scope.numberOfItemsInCart = 0;
    $scope.totalAmount = 0;
    $scope.super_category = $location.path().split("/")[2];

   cartService.getCart()
        .then(function successCallback(response) {
                if (response.data.success === true) {                                
                    updateUserCart(cartService.mergeCarts($scope.userCart, response.data.cart));
                } else {
                    updateUserCart(cartService.mergeCarts(localStorage.getUserCart(), {})); //REQUIRED to convert to new convention with super_category
                }
                localStorage.setUserCart({});    

                for(var super_category in $scope.userCart){
                    for (var a in $scope.userCart[super_category]){
                        $scope.totalAmount = $scope.totalAmount + ($scope.userCart[super_category][a].quantity * $scope.userCart[super_category][a].price);
                        $scope.numberOfItemsInCart = $scope.numberOfItemsInCart + $scope.userCart[super_category][a].quantity;
                        $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
                        $scope.prepareItemForDB(a, $scope.userCart[super_category][a].quantity);
                    }
                }
            }, function errorCallback(response) {
                updateUserCart(localStorage.getUserCart());
                alert("Couldn't retrieve your cart. If error persists contact customer service");
            });

    $scope.$on("addToCart", function (event, product) {
        var tmpQuantity = 1;
        var super_category = {};
        if ($scope.userCart.hasOwnProperty(product.super_category)) {
            super_category = $scope.userCart[product.super_category];
        }

        if (super_category.hasOwnProperty(product.depot_id)){
            tmpQuantity = super_category[product.depot_id].quantity;
            tmpQuantity++;

            if (tmpQuantity > 10) {
                tmpQuantity = 10;
                $scope.numberOfItemsInCart = $scope.numberOfItemsInCart;
            } else{
                $scope.numberOfItemsInCart ++;
                notification.addCartItem(product);
            }
            super_category[product.depot_id].quantity = tmpQuantity;
            $scope.totalAmount = $scope.totalAmount + product.price;
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;
        } else {
            increaseCartItemIndexes(product.super_category);
            product.orderIndex = 0;
            super_category[product.depot_id] = product;
            super_category[product.depot_id].quantity = tmpQuantity;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + product.price;
            $scope.totalAmount = Math.round($scope.totalAmount * 100) / 100;   
            notification.addCartItem(product);         
        }
        $scope.userCart[product.super_category] = super_category;
        updateUserCart($scope.userCart);
        $scope.prepareItemForDB(product.depot_id,  $scope.userCart[product.super_category][product.depot_id].quantity);
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
        if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
            var currentQuantity = $scope.userCart[product.super_category][product.depot_id].quantity;
            if (currentQuantity < 10) {              
                currentQuantity++;
                
                $scope.userCart[product.super_category][product.depot_id].quantity = currentQuantity;
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
        if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
            var currentQuantity = $scope.userCart[product.super_category][product.depot_id].quantity;
            if (currentQuantity > 1) {              
                currentQuantity--;
                
                $scope.userCart[product.super_category][product.depot_id].quantity = currentQuantity;
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
        if ($scope.userCart.hasOwnProperty(product.super_category) && $scope.userCart[product.super_category].hasOwnProperty(product.depot_id)) {
            // delete item and reorder indexes of other items
            var index = $scope.userCart[product.super_category][product.depot_id].orderIndex;
            var super_c = product.super_category;
            delete $scope.userCart[product.super_category][product.depot_id];
            decreaseCartItemIndexes(super_c, index);

            // if super_category doesn't contain objects, then remove from list
            if (Object.entries($scope.userCart[product.super_category]).length == 0){
                delete $scope.userCart[product.super_category];
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



    /**
     * Logic for increase/decrease order indexes of Cart items
     * @param {*} increase
     */
    function updateCartItemIndexes(increase, super_category, deletedItemIndex){
        if (!$scope.userCart[super_category]){
            return;
        }

        var depot_ids = Object.keys($scope.userCart[super_category]);
        for (var i = 0; i < depot_ids.length; i++){
            var depot_id = depot_ids[i];
            var currentIndex = $scope.userCart[super_category][depot_id].orderIndex;
            if (increase){
                // increase
                $scope.userCart[super_category][depot_id].orderIndex = currentIndex + 1;
            } else {
                // decrease
                if (currentIndex > deletedItemIndex){
                    $scope.userCart[super_category][depot_id].orderIndex = currentIndex - 1;
                }
            }
        }
    }

    /**
     * Helper method to increase order indexes of Cart items
     */
    function increaseCartItemIndexes(super_category){
        updateCartItemIndexes(true, super_category);
    }

    /**
     * Helper method to decrease order indexes of Cart items
     */
    function decreaseCartItemIndexes(super_category, deletedItemIndex){
        updateCartItemIndexes(false, super_category, deletedItemIndex);
    }


});

