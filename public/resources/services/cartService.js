app.service('cartService', function ($http, localStorage, $cookies) {

    var _modifyCartItem = function (depot_id, itemQuantity) {
        return $http.post('/api/cart/modifyitem', {
                depot_id: depot_id,
                quantity: itemQuantity,                
        });
    };

    var _clearCart = function () {
        localStorage.setUserCart({});
        return $http.post('/api/cart/clear');
    };

    var _getCart = function () {
        return $http.get('/api/cart/usercart');
    };

    var _mergeCarts = function (lCart, rCart) {
        var localCart = jQuery.extend(true, {}, lCart);
        var remoteCart = Object.entries(rCart); // turns Object to Array

        for (var i = 0; i < remoteCart.length; i++) {
            var product_array = remoteCart[i];
            var store_type_api_name = product_array[1].store_type_api_name;
            var depot_id = product_array[0];
            if (localCart.hasOwnProperty(store_type_api_name) && localCart[store_type_api_name].hasOwnProperty(depot_id)) {
                // add to quantity, not exceeding 10
                var tmpQuantity = localCart[store_type_api_name][depot_id].quantity;
                tmpQuantity += product_array[1].quantity;

                if (tmpQuantity >= 10) tmpQuantity = 10;

                localCart[store_type_api_name][depot_id].quantity = tmpQuantity;
            } else {
                // for empty localCart
                if (!localCart.hasOwnProperty(store_type_api_name)) {
                    localCart[store_type_api_name] = {};
                }
                localCart[store_type_api_name][depot_id] = product_array[1];
            }
        }
        
        // Add orderIndex
        for (var type in localCart){
            var index = 0;
            for (var item in localCart[type]){
                localCart[type][item].orderIndex = index;
                index++;
            }
        }

        return localCart;
    };

    /**
     * Puts 'store_type_api_name' as first property in cart
     * @param {*} store_type_api_name 
     * @param {*} cart 
     */
    function _getViewUserCart(store_type_api_name, lCart) {
        var cart = jQuery.extend(true, {}, lCart);

        var selected = cart[store_type_api_name];
        delete cart[store_type_api_name];

        // Item ordering
        // Implementation expected bubble sort - knowing order (from 0 - n) look expected order 'i' and insert at 'i'
        // Using this to 
        // takes O(n^2)
        var orderedItems = [];
        var orderIndexCounter = 0;
        if (selected){ // order if there are items to order
            var keys = Object.keys(selected);
            var unusedKeys = keys.slice();
            var usedIndexes = [];
            for (var expectedOrderIndex = 0; expectedOrderIndex < keys.length; expectedOrderIndex++){
                var failBack = true;
                for (var j = 0; j < keys.length; j++){
                    if (selected[keys[j]].orderIndex == expectedOrderIndex){
                        var indexToUse = expectedOrderIndex;
                        if (usedIndexes.indexOf(expectedOrderIndex) != -1){
                            indexToUse++;
                        }
                        selected[keys[j]].orderIndex = indexToUse;

                        orderedItems.splice(indexToUse, 0, selected[keys[j]]);   
                        var index = unusedKeys.indexOf(keys[j]);
                        unusedKeys.splice(index, 1);
                        usedIndexes.push(indexToUse);
                        failBack = false;
                        break;
                    }
                }
                // failBack if orderIndex did not match
                // Add item at second index (good approach as item will be visible, but not first)
                if (failBack){
                    console.warn("Cart ordering runs in failBack mode");
                    selected[unusedKeys[0]].orderIndex = 1;
                    orderedItems.splice(1, 0, selected[unusedKeys[0]]);
                    for (var k = 2; k < orderedItems.length; k++){
                        orderedItems[k].orderIndex += 1;
                    }

                    unusedKeys.splice(0, 1);                    
                }
                orderIndexCounter++;
            }
        }

        var new_cart = Object.entries(cart);
        if (selected) {
            new_cart.splice(0, 0, [store_type_api_name, orderedItems]);
        }

        // WORKAROUND (TODO)
        // temp workaround for many super_categories
        // var tempObj = {};
        // var indexesToRemove = [];
        // for (var i = 0; i < new_cart.length; i++){
        //     var item = new_cart[i];
        //     // if not 'liquor-station', combine under 'snack-vendor'
        //     if (item[0] != "liquor-station"){
        //         tempObj = Object.assign(tempObj, item[1]);
        //         indexesToRemove.splice(0, 0, i);
        //     }
        // }

        // if (Object.keys(tempObj).length != 0){
        //     // Re-Order snack-vendor
        //     var keys = Object.keys(tempObj);
        //     var orderedItems = [];
        //     for (var expectedOrderIndex = 0; expectedOrderIndex < keys.length; expectedOrderIndex++){
        //         failBack = true;
        //         for (var j = 0; j < keys.length; j++){
        //             if (tempObj[keys[j]].orderIndex == expectedOrderIndex){
        //                 orderedItems.splice(expectedOrderIndex, 0, tempObj[keys[j]]);
        //                 failBack = false;
        //                 break;
        //             }
        //         }
        //         // failBack if orderIndex did not match
        //         // Add item at second index (good approach as item will be visible, but not first)
        //         if (failBack){
        //             console.warn("Cart ordering runs in failBack mode");
        //             orderedItems.splice(1, 0, tempObj[keys[j]]);
        //         }
        //     }


        //     if (store_type_api_name == "snack-vendor"){
        //         new_cart.splice(0, 0, ['snack-vendor', orderedItems]);
        //     } else {
        //         new_cart.push(['snack-vendor', orderedItems]);
        //     }
        // }

        // // reverse order
        // new_cart = new_cart.filter(function(item){
        //     return item[0] == 'liquor-station' || item[0] == 'snack-vendor';
        // });
        // END WORKAROUND

        return new_cart;
    }

    var _getStoreAPIs = function (cart){
        return Object.keys(cart);
    }

    /**
     * Used to convert userCart object to object consisting of "depot_id: quantity"
     * @param {*} cart  - user cart
     */
    function _parseCartToSend(rcart){
        var parsedCart = {};
        var cart = Object.values(rcart);
        for (var i = 0; i < cart.length; i++){
            var super_categories = Object.values(cart[i]);
            for (var j = 0; j < super_categories.length; j++){
                parsedCart[super_categories[j].depot_id] = super_categories[j].quantity;
            }
        }

        return parsedCart;
    }

    /**
     * Runs on initialization of cartService
     */
    function _init(){
        var cart_version = $cookies.get("cart-version");
        if(cart_version != localStorage.getCartVersion()){
            localStorage.setUserCart({});
            localStorage.setCartVersion(cart_version);            
        }
    }

    _init();

    return {
        modifyCartItem: _modifyCartItem,
        clearCart: _clearCart,
        getCart: _getCart,
        mergeCarts: _mergeCarts,
        getViewUserCart: _getViewUserCart,
        parseCartToSend: _parseCartToSend,
        getStoreAPIs: _getStoreAPIs
    };
});
