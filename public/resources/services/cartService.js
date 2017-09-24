app.service('cartService', ["$http",function($http){
    
    var _modifyCartItem = function(depot_id, itemQuantity){
        //TODO: return response directly
        return $http({
            method: 'POST',
            url: '/api/cart/modifyitem',
            data: {
                depot_id: depot_id,
                quantity: itemQuantity
            }
        });
    }

    var _clearCart = function(){
        //TODO: return response directly
        return $http.post('/api/cart/clear');
    }
    
    var _getCart = function(){
        //TODO: return response directly
        return  $http.get('/api/cart/usercart');
    }

    var _mergeCarts = function(lCart, rCart){
        var localCart = jQuery.extend(true, {}, lCart);
        var remoteCart = Object.entries(rCart);
        for (var i=0; i < remoteCart.length; i++){
            var item = remoteCart[i];
            var depot_id = item[0];
            if (localCart.hasOwnProperty(depot_id)){
                // add to quantity, not exceeding 10
                var tmpQuantity = localCart[depot_id].quantity;
                tmpQuantity += item[1].quantity;
                
                if (tmpQuantity >= 10) tmpQuantity = 10;

                localCart[depot_id].quantity = tmpQuantity;
            } else {
                localCart[depot_id] = item[1];
            }
        }
        return localCart;
    }


    return {
        modifyCartItem: _modifyCartItem,
        clearCart: _clearCart,
        getCart: _getCart,
        mergeCarts: _mergeCarts
    }
}]);
