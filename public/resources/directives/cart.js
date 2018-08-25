app.directive("cart", function ($timeout, user, $window, cartService, localStorage, notification, googleAnalytics) {

    var pScope;
    var publicFunctions = {};

    publicFunctions.addItem = function (product) {
        var tmpQuantity = 1;
        var store_products = {};
        if (pScope.userCart.hasOwnProperty(product.store_type_name)) {
            store_products = pScope.userCart[product.store_type_name];
        }

        if (store_products.hasOwnProperty(product.UID)) {
            tmpQuantity = store_products[product.UID].quantity;
            tmpQuantity++;

            if (tmpQuantity > 10) {
                tmpQuantity = 10;
                pScope.numberOfItemsInCart = pScope.numberOfItemsInCart;
                notification.addWarningMessage("Limit of a kind is 10.");
            } else {
                pScope.numberOfItemsInCart++;
                notification.addCartItem(product);
            }
            store_products[product.UID].quantity = tmpQuantity;
            pScope.totalAmount = pScope.totalAmount + product.price;
            pScope.totalAmount = Math.round(pScope.totalAmount * 100) / 100;
        } else {
            pScope.increaseCartItemIndexes(product.store_type_name);
            product.orderIndex = 0;
            store_products[product.UID] = product;
            store_products[product.UID].quantity = tmpQuantity;
            pScope.numberOfItemsInCart++;
            pScope.totalAmount = pScope.totalAmount + product.price;
            pScope.totalAmount = Math.round(pScope.totalAmount * 100) / 100;
            notification.addCartItem(product);
        }
        pScope.userCart[product.store_type_name] = store_products;
        pScope.updateUserCart(pScope.userCart, product.store_type_name);
        pScope.prepareItemForDB(product.UID, pScope.userCart[product.store_type_name][product.UID].quantity);
    };

    publicFunctions.clear = function () {
        pScope.updateUserCart({});
        pScope.numberOfItemsInCart = 0;
        pScope.totalAmount = 0;

        cartService.clearCart()
            .then(function successCallback(response) {
                // nothing
            }, function errorCallback(response) {
                localStorage.setUserCart(pScope.userCart);  // use local storage
            });
    };

    publicFunctions.totalCartPrice = function () {
        return pScope.totalAmount;
    };

    publicFunctions.numberOfItems = function () {
        return pScope.numberOfItemsInCart;
    };

    publicFunctions.getCart = function () {
        return pScope.userCart;
    };

    return {
        restrict: "E",
        scope: {
            canRemove: "<canRemove",
            cartCtrl: "=cartCtrl",
            storeTypeNameName: "<?storeTypeNameName",
            onCartLoad: "<?onCartLoad",// method to be called once cart is loaded 
            onPriceChange: "<?onPriceChange" // method to be called once cart is updated
        },
        templateUrl: '/resources/templates/cart.html',
        link: function (scope, element, attrs) {
            $timeout(function () {
                // public variables
                scope.cartCtrl = publicFunctions;
                pScope = scope;

                if (!scope.onPriceChange) {
                    scope.onPriceChange = function () { }; //dummy function
                }

                //controller variables
                scope.numberOfItemsInCart = 0;
                scope.totalAmount = 0;

                scope.userCart = localStorage.getUserCart() || {};
                cartService.getCart()
                    .then(function successCallback(response) {
                        if (response.data.success === true) {
                            scope.updateUserCart(cartService.mergeCarts(scope.userCart, response.data.cart), scope.storeTypeName);
                        } else {
                            scope.updateUserCart(cartService.mergeCarts(localStorage.getUserCart(), {}), scope.storeTypeName); //REQUIRED to convert to new convention with store_type_name
                        }
                        localStorage.setUserCart({});
                        if (scope.onCartLoad) {
                            scope.onCartLoad();
                        }

                        for (var store_type_name in scope.userCart) {
                            for (let a in scope.userCart[store_type_name]) {
                                scope.totalAmount = scope.totalAmount + (scope.userCart[store_type_name][a].quantity * scope.userCart[store_type_name][a].price);
                                scope.numberOfItemsInCart = scope.numberOfItemsInCart + scope.userCart[store_type_name][a].quantity;
                                scope.totalAmount = Math.round(scope.totalAmount * 100) / 100;
                                scope.prepareItemForDB(a, scope.userCart[store_type_name][a].quantity);
                            }
                        }
                    }, function errorCallback(response) {
                        scope.updateUserCart(localStorage.getUserCart());
                        console.error("Couldn't retrieve your cart");
                    });


                /* Helper functions */

                scope.plusItem = function (product) {
                    if (scope.userCart.hasOwnProperty(product.store_type_name) && scope.userCart[product.store_type_name].hasOwnProperty(product.UID)) {
                        var currentQuantity = scope.userCart[product.store_type_name][product.UID].quantity;
                        if (currentQuantity < 10) {
                            currentQuantity++;

                            scope.userCart[product.store_type_name][product.UID].quantity = currentQuantity;
                            scope.numberOfItemsInCart++;
                            scope.totalAmount = scope.totalAmount + product.price;
                            scope.totalAmount = Math.round(scope.totalAmount * 100) / 100;

                            scope.updateUserCart(scope.userCart);
                            scope.prepareItemForDB(product.UID, currentQuantity);

                            googleAnalytics.addEvent('plus_cart_item', {
                                "event_label": product.brand + " " + product.name,
                                "event_category": googleAnalytics.eventCategories.cart_actions
                            });
                        }
                    }
                };

                scope.minusItem = function (product) {
                    if (scope.userCart.hasOwnProperty(product.store_type_name) && scope.userCart[product.store_type_name].hasOwnProperty(product.UID)) {
                        var currentQuantity = scope.userCart[product.store_type_name][product.UID].quantity;
                        if (currentQuantity > 1) {
                            currentQuantity--;

                            scope.userCart[product.store_type_name][product.UID].quantity = currentQuantity;
                            scope.numberOfItemsInCart--;
                            scope.totalAmount = scope.totalAmount - product.price;
                            scope.totalAmount = Math.round(scope.totalAmount * 100) / 100;

                            scope.updateUserCart(scope.userCart);
                            scope.prepareItemForDB(product.UID, currentQuantity);

                            googleAnalytics.addEvent('minus_cart_item', {
                                "event_label": product.brand + " " + product.name,
                                "event_category": googleAnalytics.eventCategories.cart_actions
                            });
                        }
                    }
                };

                scope.removeItem = function (product) {
                    if (scope.userCart.hasOwnProperty(product.store_type_name) && scope.userCart[product.store_type_name].hasOwnProperty(product.UID)) {
                        // delete item and reorder indexes of other items
                        var index = scope.userCart[product.store_type_name][product.UID].orderIndex;
                        var super_c = product.store_type_name;
                        delete scope.userCart[product.store_type_name][product.UID];
                        scope.decreaseCartItemIndexes(super_c, index);
                        // if store_type_name doesn't contain objects, then remove from list
                        if (Object.entries(scope.userCart[product.store_type_name]).length == 0) {
                            delete scope.userCart[product.store_type_name];
                        }
                        scope.updateUserCart(scope.userCart);
                        scope.numberOfItemsInCart = scope.numberOfItemsInCart - product.quantity;
                        scope.totalAmount = scope.totalAmount - (product.price * product.quantity);
                        scope.totalAmount = Math.round(scope.totalAmount * 100) / 100;
                        scope.prepareItemForDB(product.UID, 0);

                        googleAnalytics.addEvent('remove_from_cart', {
                            "event_label": product.brand + " " + product.name,
                            "event_category": googleAnalytics.eventCategories.cart_actions,
                            "items": [
                                {
                                    name: product.name,
                                    brand: product.brand,
                                    price: product.price,
                                    category: product.packaging,
                                    variant: product.size,
                                }
                            ]
                        });
                    }
                };

                scope.prepareItemForDB = function (UID, itemQuantity, action) {
                    cartService.modifyCartItem(UID, itemQuantity)
                        .then(function successCallback(response) {
                            // nothing
                        }, function errorCallback(response) {
                            localStorage.setUserCart(scope.userCart); // use local storage
                        });
                    scope.onPriceChange();
                };

                scope.updateUserCart = function (cart, store_type_name) {
                    scope.userCart = cart;
                    scope.userCartToView = cartService.getViewUserCart(store_type_name, scope.userCart);
                };

                /**
                 * Logic for increase/decrease order indexes of Cart items
                 * @param {*} increase
                 */
                function updateCartItemIndexes(increase, store_type_name, deletedItemIndex) {
                    if (!scope.userCart[store_type_name]) {
                        return;
                    }

                    var UIDs = Object.keys(scope.userCart[store_type_name]);
                    for (var i = 0; i < UIDs.length; i++) {
                        var UID = UIDs[i];
                        var currentIndex = scope.userCart[store_type_name][UID].orderIndex;
                        if (increase) {
                            // increase
                            scope.userCart[store_type_name][UID].orderIndex = currentIndex + 1;
                        } else {
                            // decrease
                            if (currentIndex > deletedItemIndex) {
                                scope.userCart[store_type_name][UID].orderIndex = currentIndex - 1;
                            }
                        }
                    }
                }

                /**
                 * Helper method to increase order indexes of Cart items
                 */
                scope.increaseCartItemIndexes = function (store_type_name) {
                    updateCartItemIndexes(true, store_type_name);
                };

                /**
                 * Helper method to decrease order indexes of Cart items
                 */
                scope.decreaseCartItemIndexes = function (store_type_name, deletedItemIndex) {
                    updateCartItemIndexes(false, store_type_name, deletedItemIndex);
                };

            }, 100);
        }
    };
});
