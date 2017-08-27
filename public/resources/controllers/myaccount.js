app.controller("myaccountController", ["$scope", "$http", "$cookies", "$rootScope", 
function($scope, $http, $cookies, $rootScope){

    var myaccount = this;   

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
    }
    /* Info Section */
    // $scope.user = JSON.parse( $cookies.get("user").replace("j:", ""));  

    // Dummy orders info
    myaccount.orders  = [
        {
            id: "#142",
            delivery_address: "Chaihda 123123",
            stire_address: "store add 123",
            price: "14.5"
        },
        {
            id: "#154",
            delivery_address: "Cha 56",
            stire_address: "store add 123",
            price: "26"
        }
    ]

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

    myaccount.init();
}]);