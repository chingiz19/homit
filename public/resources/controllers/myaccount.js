app.controller("myaccountController", ["$scope", "$http", "$cookies", "$rootScope", "$mdToast",
function($scope, $http, $cookies, $rootScope, $mdToast){

    var myaccount = this;   

    myaccount.selectedView = 0;
    myaccount.passwordError = false;

    myaccount.birth_date = {}; 
    myaccount.init = function(){
        var arr_years = [];
        var arr_days_31, arr_days_30, arr_days_29, arr_days_28 = [];
        for (var i = 1950; i < 2000; i++){
            arr_years.push(i);    
        }   

        for (var i = 1; i < 29; i++){
            arr_days_28.push(i);
        }

        arr_days_29 = arr_days_28.concat([29]);
        arr_days_30 = arr_days_29.concat([30]);
        arr_days_31 = arr_days_30.concat([31]);

        myaccount.birth_date = {
            "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "years": arr_years,
            "days": {
                "January": arr_days_31,
                "February": arr_days_28,
                "March": arr_days_31,
                "April": arr_days_30,
                "May": arr_days_31,
                "June": arr_days_30,
                "July": arr_days_31,
                "August": arr_days_31,
                "September": arr_days_30,
                "October": arr_days_31,
                "November": arr_days_30,
                "December": arr_days_31
            }
        }

        $http({
                method: 'GET',
                url: '/api/orders/getUserOrder'
            }).then(function successCallback(response) {
                if (response.data["success"]) {
                    myaccount.orders = response.data["orders"];
                } else {
                    console.log("error");
                }
            }, function errorCallback(response) {
                var m = response.data["ui_message"] || "Something went wrong while loading orders";
                $rootScope.$broadcast("addNotification", { type: "alert-danger", message: m});
                console.log("ERROR in password reset");
            });
    }
    /* Info Section */
    // $scope.user = JSON.parse( $cookies.get("user").replace("j:", "")); 

    myaccount.edit = false;
    myaccount.user = {
        "first_name": "Hello",
        last_name: "Hi"
    }

    myaccount.isOrderHistoryShown = false;

    myaccount.editButton = function(){
        myaccount.edit = !myaccount.edit;
    }

    myaccount.cancelEdit = function(){
        //TODO: set user info to default
        myaccount.edit = false;
    }
    
    myaccount.updateUserInfo = function(){
            $http({
                method: 'POST',
                url: '/api/myaccount/updateUserInfo',
                data: myaccount.user
            }).then(function successCallback(response) {
                if (response.data["success"]) {
                    $rootScope.$broadcast("addNotification", { 
                        type: "alert-success", 
                        message: response.data["ui_message"]
                    });
                    myaccount.user = response.data.user;
                } else {
                    $rootScope.$broadcast("addNotification", { 
                        type: "alert-danger", 
                        message: response.data["ui_message"]
                    });
                }
            }, function errorCallback(response) {
                var m = response.data["ui_message"] || "Something went wrong while updating your info, please try again";
                $rootScope.$broadcast("addNotification", { type: "alert-danger", message: m});
                console.log("ERROR in password reset");
            });
    }

     showToast = function(message, action){
        var toast = $mdToast.simple()
                .textContent(message)
                .highlightAction(true)
                .action(action)
                .highlightClass("md-accent")
                .parent($("#mainPart"))
                .position('top right');
       
        if (action) {
            toast.action(action);
            $mdToast.show(toast).then(function(response){
                if (response === 'ok'){
                    $mdToast.hide(toast);
                }
            })
        } else {
            $mdToast.show(toast);
        }
    };

    myaccount.checkPassword = function(){
        myaccount.passwordError = (myaccount.new_password != myaccount.confirm_password);
    }

    myaccount.changePassword = function(){
        if (myaccount.passwordError){
            showToast("Password did not match", "Close");
            return;
        }

        $http({
            method: 'POST',
            url: '/api/myaccount/resetpassword',
            data: {
                current_password: myaccount.password,
                new_password: myaccount.new_password
            }
        }).then(function successCallback(response) {
            if (response.data["success"] === "true") {
                console.log("password reset");
            } else {
                console.log("password not reset");
            }
        }, function errorCallback(response) {
            console.log("ERROR in password reset");
        });
    }

    myaccount.getTotalPriceForOrder = function(order) {
        var total = 0;
        for (var i=0; i < order.cart.length; i++){
            total += parseFloat(order.cart[i].price);
        }
        return total;
    }

    myaccount.init();
}]);