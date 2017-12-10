app.service('cartService', ["$http", function ($http) {

    var _modifyCartItem = function (depot_id, itemQuantity) {
        return $http.post('/api/cart/modifyitem', {
                depot_id: depot_id,
                quantity: itemQuantity,                
        })
    }

    var _clearCart = function () {
        return $http.post('/api/cart/clear');
    }

    var _getCart = function () {
        return $http.get('/api/cart/usercart');
    }

    var _mergeCarts = function (lCart, rCart) {
        var localCart = jQuery.extend(true, {}, lCart);
        var remoteCart = Object.entries(rCart); // turns Object to Array

        for (var i = 0; i < remoteCart.length; i++) {
            var product_array = remoteCart[i];
            var super_category = product_array[1]["super_category"];
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


        // if remoteCart matches localCart

        // for (var i=0; i < remoteCart.length; i++){
        //     var tmp = remoteCart[i];
        //     var super_category = tmp[0];
        //     var super_category_items = Object.entries(super_category_items[1]);
        //     for (var j = 0; j < super_category_items.length; j++){
        //         var product_array = super_category_items[j];
        //         var depot_id = product_array[0];
        //         if (localCart.hasOwnProperty(super_category) && localCart[super_category].hasOwnProperty(depot_id)){
        //             // add to quantity, not exceeding 10
        //             var tmpQuantity = localCart[super_category][depot_id].quantity;
        //             tmpQuantity += product_array[1].quantity;

        //             if (tmpQuantity >= 10) tmpQuantity = 10;

        //             localCart[super_category][depot_id].quantity = tmpQuantity;
        //         } else {
        //             localCart[super_category][depot_id] = product_array[1];
        //         }
        //     }
        // }

        return localCart;
    }

    /**
     * Puts 'super_category' as first property in cart
     * @param {*} super_category 
     * @param {*} cart 
     */
    function _getViewUserCart(super_category, lCart) {
        var cart = jQuery.extend(true, {}, lCart);

        var selected = cart[super_category];
        delete cart[super_category];

        var new_cart = Object.entries(cart);
        if (selected) {
            new_cart.splice(0, 0, [super_category, selected]);
        }
        return new_cart;
    }

    return {
        modifyCartItem: _modifyCartItem,
        clearCart: _clearCart,
        getCart: _getCart,
        mergeCarts: _mergeCarts,
        getViewUserCart: _getViewUserCart
    }
}]);
