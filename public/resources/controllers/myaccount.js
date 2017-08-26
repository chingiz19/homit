app.controller("myaccountController", ["$scope", "$http", "$cookies", "$rootScope", 
function($scope, $http, $cookies, $rootScope){

    var myaccount = this;    
    /* Info Section */
    // $scope.user = JSON.parse( $cookies.get("user").replace("j:", ""));  

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

    myaccount.editButtonLabel = "Edit";

    myaccount.isOrderHistoryShown = false;

    myaccount.editButton = function(){
        myaccount.edit = !myaccount.edit;
        if (myaccount.edit){
            myaccount.editButtonLabel = "Done";
        } else {
            myaccount.editButtonLabel = "Edit";
        }
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
}]);