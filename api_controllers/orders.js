var router = require("express").Router();

router.get('/getorder', function(req, res, next){
    //check logged in user in esl_database
    if (!req.session.user) next();

    var checkQuery = "SELECT first_name, last_name FROM esl_users WHERE ?";

    db.runQuery(checkQuery, {user_email: req.session.user.user_email}).then(function(data){
        if (data.length <= 0 && data[0].first_name != req.session.user.first_name && data[0].first_name != req.session.user.first_name) next();        
        //get query to collect everything in orders_db
        var query = `SELECT user.user_email, user.first_name, user.last_name, user.phone_number, 
                            o.id, o.date_received, o.date_delivered, o.status, o.delivery_address, o.store_address, 
                            cart.warehouse_id, cart.quantity
                    FROM users_customers AS user, orders AS o, order_cart_info as cart
                    WHERE user.id=o.user_info AND cart.id=o.card_info
                    UNION ALL
                    SELECT tuser.user_email, tuser.first_name, tuser.last_name, tuser.phone_number, 
                            o.id, o.date_received, o.date_delivered, o.status, o.delivery_address, o.store_address, 
                            cart.warehouse_id, cart.quantity
                    FROM tmp_users as tuser, orders AS o, order_cart_info as cart
                    WHERE tuser.id=o.tmp_user_info AND cart.id=o.card_info;`;

        db.runQuery(query, []).then(function(results){
            var individualUsers = [];
            var queriesToRun = [];
            var quantitiesPerUser = [];
            results.forEach(function(result){
                var obj = {
                    user: {
                        email: result.user_email,
                        first_name: result.first_name,
                        last_name: result.last_name,
                        phone_number: result.phone_number
                    },
                    delivery_address: result.delivery_address,
                    store_address: result.store_address,
                    date_received: result.date_received,
                    date_delivered: result.date_delivered,
                    status: result.status,
                    order_id: result.id
                };
                var warehouse = result.warehouse_id.split(",");
                var warehouse_query = `SELECT p.product_brand, p.product_name, 
                                            packing.name as product_packaging, 
                                            w.price 
                                        FROM catalog_warehouse as w, catalog_products as p, catalog_packagings as packing
                                        WHERE(w.id=` + warehouse.join(" or w.id=") + `) and w.product_id=p.id and w.packaging_id=packing.id`;
                queriesToRun.push(db.runQuery(warehouse_query));
                quantitiesPerUser.push(result.quantity.split(","));
                individualUsers.push(obj);
            });
            return [individualUsers, queriesToRun, quantitiesPerUser];
        }).then(function(args){
            var individualUsers = args[0];
            var queriesToRun = args[1];
            var quantitiesPerUser = args[2];
             Promise.all(queriesToRun).then(values => {
                 values.forEach(function(cart_infos, i){
                    var obj_cart = [];
                    var item_quantity = quantitiesPerUser[i];
                    cart_infos.forEach(function(cart_info){
                        var cart_object = {
                            name: cart_info.product_name,
                            brand: cart_info.product_brand,
                            packaging: cart_info.product_packaging,
                            price: cart_info.price,
                            quantity: item_quantity.shift()
                        };
                        obj_cart.push(cart_object);
                    });
                    individualUsers[i].cart = obj_cart;
                 });
                return individualUsers;
            }).then(function(data){
                res.send(data);
            });
        });
    });
});
            

router.get('/neworder', function(req, res, next){

});

module.exports = router;