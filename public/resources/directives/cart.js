app.directive("cart", function ($timeout, user, $window, cartService, localStorage, notification, googleAnalytics, helpers, $rootScope) {

    var pScope;
    var publicFunctions = {};

    publicFunctions.addItem = function (product) {
        var tmpQuantity = 1;
        var store_products = {};

        product.product_url = helpers.buildProductPagePath(product);

        if(!pScope.userCart.hasOwnProperty(product.store.name)){
            $rootScope.$broadcast("showSchedulerModal");
        }

        if (pScope.userCart.hasOwnProperty(product.store.name)) {
            store_products = pScope.userCart[product.store.name];
        }

        if (store_products.hasOwnProperty(product.selected.UID)) {
            tmpQuantity = store_products[product.selected.UID].selected.quantity;
            tmpQuantity++;

            if (tmpQuantity > 10) {
                tmpQuantity = 10;
                notification.addWarningMessage("Limit of a kind is 10.");
            } else {
                pScope.numberOfItemsInCart++;
                notification.addCartItem(product);
            }
            store_products[product.selected.UID].selected.quantity = tmpQuantity;
            pScope.totalAmount = pScope.totalAmount + product.selected.price;
            pScope.totalAmount = Math.round(pScope.totalAmount * 100) / 100;
        } else {
            pScope.increaseCartItemIndexes(product.store.name);
            product.orderIndex = 0;
            store_products[product.selected.UID] = product;
            store_products[product.selected.UID].selected.quantity = tmpQuantity;
            pScope.numberOfItemsInCart++;
            pScope.totalAmount = pScope.totalAmount + product.price;
            pScope.totalAmount = Math.round(pScope.totalAmount * 100) / 100;
            notification.addCartItem(product);
        }
        pScope.userCart[product.store.name] = store_products;
        pScope.updateUserCart(pScope.userCart, product.store.name, false);
        pScope.prepareItemForDB(product.selected.UID, pScope.userCart[product.store.name][product.selected.UID].selected.quantity);

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
            storeTypeName: "<?storeTypeName",
            onCartLoad: "<?onCartLoad",// method to be called once cart is loaded 
            onPriceChange: "<?onPriceChange" // method to be called once cart is updated
        },
        templateUrl: '/resources/templates/cart.html',
        link: function (scope, element, attrs) {
            $timeout(function () {
                scope.refreshCart = function(){
                    scope.userCart = localStorage.getUserCart() || {};
                    cartService.getCart()
                        .then(function successCallback(response) {
                            scope.numberOfItemsInCart = 0;
                            scope.totalAmount = 0;
                            if (response.data.success === true) {
                                scope.updateUserCart(cartService.mergeCarts(scope.userCart, response.data.cart), scope.storeTypeName, true, true);
                                localStorage.setUserCart({});
                            } else {
                                scope.updateUserCart(cartService.mergeCarts(localStorage.getUserCart(), {}), scope.storeTypeName, true); //REQUIRED to convert to new convention with store_type_name
                            }
                            if (scope.onCartLoad) {
                                scope.onCartLoad();
                            }
                        }, function errorCallback(response) {
                            scope.updateUserCart(localStorage.getUserCart());
                            console.error("Couldn't retrieve your cart");
                        });
                };

                // public variables
                scope.cartCtrl = publicFunctions;
                pScope = scope;

                //Call dummy function when the function not passed to directive
                if (!scope.onPriceChange){
                    scope.onPriceChange = function(){};
                }

                //controller variables
                scope.numberOfItemsInCart = 0;
                scope.totalAmount = 0;

                scope.refreshCart();
                // window.addEventListener('focus', scope.refreshCart);

                /**
                 * Finds nested product object including size
                 * 
                 * @param {Object} product  document from Mongo DB
                 * @param {string} UID
                 */
                scope.findNestedProductPrice = function (product, UID) {
                    let idArray = UID.split("-");
                    if (product && idArray && product.variance && product.tax) {
                        let selectedvariances = product.variance;
                        for (let k in selectedvariances) {
                            let variance = selectedvariances[k];
                            let searchId = idArray[0] + '-' + idArray[1] + "-" + idArray[2];
                            if (variance._id == searchId && variance.packs) {
                                let packs = variance.packs;
                                let localSize = variance.preffered_unit_size + variance.preffered_unit;
                                searchId += '-' + idArray[3];
                                for (let l in packs) {
                                    let pack = packs[l];
                                    if (pack._id == searchId && pack.price) {
                                        pack.size = localSize;
                                        return pack;
                                    }
                                }
                            }
                        }
                    }
                    return false;
                };

                /* Helper functions */
                scope.plusItem = function (product) {
                    if (scope.userCart.hasOwnProperty(product.store.name) && scope.userCart[product.store.name].hasOwnProperty(product.selected.UID)) {
                        var currentQuantity = scope.userCart[product.store.name][product.selected.UID].selected.quantity;
                        if (currentQuantity < 10) {
                            currentQuantity++;

                            scope.userCart[product.store.name][product.selected.UID].selected.quantity = currentQuantity;
                            scope.numberOfItemsInCart++;
                            scope.totalAmount = scope.totalAmount + product.selected.price;
                            scope.totalAmount = Math.round(scope.totalAmount * 100) / 100;

                            scope.updateUserCart(scope.userCart);
                            scope.prepareItemForDB(product.selected.UID, currentQuantity);

                            googleAnalytics.addEvent('plus_cart_item', {
                                "event_label": product.brand + " " + product.name,
                                "event_category": googleAnalytics.eventCategories.cart_actions
                            });
                        }
                    }
                };

                scope.minusItem = function (product) {
                    if (scope.userCart.hasOwnProperty(product.store.name) && scope.userCart[product.store.name].hasOwnProperty(product.selected.UID)) {
                        var currentQuantity = scope.userCart[product.store.name][product.selected.UID].selected.quantity;
                        if (currentQuantity > 1) {
                            currentQuantity--;

                            scope.userCart[product.store.name][product.selected.UID].selected.quantity = currentQuantity;
                            scope.numberOfItemsInCart--;
                            scope.totalAmount = scope.totalAmount - product.selected.price;
                            scope.totalAmount = Math.round(scope.totalAmount * 100) / 100;

                            scope.updateUserCart(scope.userCart);
                            scope.prepareItemForDB(product.selected.UID, currentQuantity);

                            googleAnalytics.addEvent('minus_cart_item', {
                                "event_label": product.brand + " " + product.name,
                                "event_category": googleAnalytics.eventCategories.cart_actions
                            });
                        }
                    }
                };

                scope.removeItem = function (product) {
                    if (scope.userCart.hasOwnProperty(product.store.name) && scope.userCart[product.store.name].hasOwnProperty(product.selected.UID)) {
                        // delete item and reorder indexes of other items
                        var index = scope.userCart[product.store.name][product.selected.UID].orderIndex;
                        var super_c = product.store.name;
                        delete scope.userCart[product.store.name][product.selected.UID];
                        scope.decreaseCartItemIndexes(super_c, index);
                        // if store_type_name doesn't contain objects, then remove from list
                        if (Object.entries(scope.userCart[product.store.name]).length == 0) {
                            delete scope.userCart[product.store.name];
                        }
                        scope.updateUserCart(scope.userCart);
                        scope.numberOfItemsInCart = scope.numberOfItemsInCart - product.selected.quantity;
                        scope.totalAmount = scope.totalAmount - (product.selected.price * product.selected.quantity);
                        scope.totalAmount = Math.round(scope.totalAmount * 100) / 100;
                        scope.prepareItemForDB(product.selected.UID, 0);

                        googleAnalytics.addEvent('remove_from_cart', {
                            "event_label": product.brand + " " + product.name,
                            "event_category": googleAnalytics.eventCategories.cart_actions,
                            "items": [
                                {
                                    name: product.name,
                                    brand: product.brand,
                                    price: product.selected.price,
                                    category: product.selected.pack,
                                    variant: product.selected.size
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

                scope.updateUserCart = function (cart, store_name, initialise, user_signed) {
                    scope.userCart = cart;
                    if(initialise){
                        for (var store in scope.userCart) {
                            for (let a in scope.userCart[store]) {
                                let pack = scope.findNestedProductPrice(scope.userCart[store][a], a);
                                scope.userCart[store][a].selected.price = pack.price;
                                scope.userCart[store][a].selected.pack = pack.h_value;
                                scope.userCart[store][a].selected.size = pack.size;
                                scope.totalAmount = scope.totalAmount + (scope.userCart[store][a].selected.quantity * scope.userCart[store][a].selected.price);
                                scope.numberOfItemsInCart = scope.numberOfItemsInCart + scope.userCart[store][a].selected.quantity;
                                scope.totalAmount = Math.round(scope.totalAmount * 100) / 100;
                                if(user_signed){
                                    scope.prepareItemForDB(a, scope.userCart[store][a].selected.quantity);
                                }

                            }
                        }
                    }
                    scope.userCartToView = cartService.getViewUserCart(store_name, scope.userCart);
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
