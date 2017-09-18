app.controller("myaccountController", ["$scope", "$http", "$cookies", "$rootScope", "$mdToast", "date",
function($scope, $http, $cookies, $rootScope, $mdToast, date){

    var myaccount = this;   
    myaccount.init = function(){
        myaccount.user = {};
        myaccount.edit = false;
        myaccount.isOrderHistoryShown = false;
        myaccount.date = date;
        myaccount.selectedView = 0;
        myaccount.passwordError = false;

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

     var showToast = function(message, action){
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