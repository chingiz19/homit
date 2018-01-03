app.service('cartService', ["$http", function ($http) {

    var _modifyCartItem = function (depot_id, itemQuantity) {
        return $http.post('/api/cart/modifyitem', {
                depot_id: depot_id,
                quantity: itemQuantity,                
        });
    };

    var _clearCart = function () {
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
            var super_category = product_array[1].super_category;
            var depot_id = product_array[0];
            if (localCart.hasOwnProperty(super_category) && localCart[super_category].hasOwnProperty(depot_id)) {
                // add to quantity, not exceeding 10
                var tmpQuantity = localCart[super_category][depot_id].quantity;
                tmpQuantity += product_array[1].quantity;

                if (tmpQuantity >= 10) tmpQuantity = 10;

                localCart[super_category][depot_id].quantity = tmpQuantity;
            } else {
                // for empty localCart
                if (!localCart.hasOwnProperty(super_category)) {
                    localCart[super_category] = {};
                }
                localCart[super_category][depot_id] = product_array[1];
            }
        }
        
        return localCart;
    };

    /**
     * Puts 'super_category' as first property in cart
     * @param {*} super_category 
     * @param {*} cart 
     */
    function _getViewUserCart(super_category, lCart) {
        var cart = jQuery.extend(true, {}, lCart);

        var selected = cart[super_category];
        delete cart[super_category];

        // Item ordering
        // Implementation expected bubble sort - knowing order (from 0 - n) look expected order 'i' and insert at 'i'
        // Using this to 
        // takes O(n^2)
        var orderedItems = [];
        if (selected){ // order if there are items to order
            var keys = Object.keys(selected);
            for (var expectedOrderIndex = 0; expectedOrderIndex < keys.length; expectedOrderIndex++){
                var failBack = true;
                for (var j = 0; j < keys.length; j++){
                    if (selected[keys[j]].orderIndex == expectedOrderIndex){
                        orderedItems.splice(expectedOrderIndex, 0, selected[keys[j]]);
                        failBack = false;
                        break;
                    }
                }
                // failBack if orderIndex did not match
                // Add item at second index (good approach as item will be visible, but not first)
                if (failBack){
                    console.warn("Cart ordering runs in failBack mode");
                    orderedItems.splice(1, 0, selected[keys[j]]);
                }
            }
        }

        var new_cart = Object.entries(cart);
        if (selected) {
            new_cart.splice(0, 0, [super_category, orderedItems]);
        }

        return new_cart;
    }

    return {
        modifyCartItem: _modifyCartItem,
        clearCart: _clearCart,
        getCart: _getCart,
        mergeCarts: _mergeCarts,
        getViewUserCart: _getViewUserCart
    };
}]);
