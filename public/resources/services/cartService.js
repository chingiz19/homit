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
        var remoteCart = rCart;

        for (var i = 0; i < remoteCart.length; i++) {
            var product = remoteCart[i];
            var store_type_name = product.store.name;
            var UID = product.selected.UID;

            if (localCart.hasOwnProperty(store_type_name) && localCart[store_type_name].hasOwnProperty(UID)) {
                // add to quantity, not exceeding 10
                var tmpQuantity = localCart[store_type_name][UID].quantity;
                tmpQuantity += product.selected.quantity;
                if (tmpQuantity >= 10) tmpQuantity = 10;
                localCart[store_type_name][UID].quantity = tmpQuantity;
            } else {
                // for empty localCart
                if (!localCart.hasOwnProperty(store_type_name)) {
                    localCart[store_type_name] = {};
                }
                localCart[store_type_name][UID] = product;
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
     * Puts 'store_type_name' as first property in cart
     * @param {*} store_type_name 
     * @param {*} cart 
     */
    function _getViewUserCart(store_type_name, lCart) {
        var cart = jQuery.extend(true, {}, lCart);

        var selected = cart[store_type_name];
        delete cart[store_type_name];

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
            new_cart.splice(0, 0, [store_type_name, orderedItems]);
        }

        return new_cart;
    }

    var _getStoreAPIs = function (cart){
        return Object.keys(cart);
    };

    /**
     * Used to convert userCart object to object consisting of "UID: quantity"
     * @param {*} cart  - user cart
     */
    function _parseCartToSend(rcart){
        var parsedCart = {};
        var cart = Object.values(rcart);
        for (var i = 0; i < cart.length; i++){
            var super_categories = Object.values(cart[i]);
            for (var j = 0; j < super_categories.length; j++){
                parsedCart[super_categories[j].selected.UID] = super_categories[j].selected.quantity;
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
