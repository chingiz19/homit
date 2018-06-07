app.controller("headerController", function ($scope, $window, $http, user, notification, $cookies, sessionStorage, googleAnalytics, $timeout) {
    $scope.init = function () {

        $scope.inputId = "header-search";
        $scope.showModal = false;
        $scope.screenMob = global_screenIsMob;
        $scope.searchListNode = 0;
    };

    $scope.modal = function (logIn, action) {
        var mobile = true;
        if ($scope.screenMob) {
            $window.location.href = $window.location.origin + "/accounts?action=" + action;
        } else {
            window.addEventListener('click', closeModalOnClick, false);
            $scope.showModal = true;
            $scope.showLogInModal = logIn;
        }
    };

    function closeModalOnClick(evt){
        if (!$scope.showModal || (evt.target.className && (evt.target.className.includes("logIn-btn") || evt.target.className.includes("signUp-btn"))) || $(evt.target).parents(".modal-content").length) return;
        $scope.showModal = false;
        window.removeEventListener('click', closeModalOnClick, false);
        $scope.$apply();
    }

    $scope.logout = function () {
        user.logout()
            .then(function successCallback(response) {
                if (response.data.success) {
                    //delete cookie
                    $cookies.remove("user");
                    $window.location.reload();
                } else {
                    // TODO: error handling
                    console.log("password not reset");
                    notification.addErrorMessage("Couldn't log out. Please try again");
                }
            }, function errorCallback(response) {
                notification.addErrorMessage("Couldn't log out. Please try again");
            });
    };

    $scope.hrefTo = function (path) {
        $window.location.href = $window.location.origin + path;
        sessionStorage.setCategoryClicked("store-switched");
    };

    $scope.showAccountBox = false;
    $scope.showHubBox = false;

    /**
     * Following 2 functions perform "Close upon Click Oustide of My Account Box" event
     */
     function clickedOffAccountBox(e){
        if ((e.target.className && e.target.className.includes("myAccount-box")) || $(e.target).parents("#hdrMyAcc").length) return;
        window.removeEventListener('click', clickedOffAccountBox, false);
        $timeout(function () {
            $scope.showAccountBox = !$scope.showAccountBox;
        }, 0);
     }

     $scope.showAccountBoxFun = function(){
         if($scope.showHubBox)  $scope.showHubBoxFun();
        if($scope.showAccountBox){
            window.removeEventListener('click', clickedOffAccountBox, false);
        } else{
            setTimeout(function () {
                window.addEventListener('click', clickedOffAccountBox, false);
            }, 10);
        }
        $scope.showAccountBox = !$scope.showAccountBox;
     };

     /**
     * Following 2 functions perform "Close upon Click Oustide of Hub Box" event
     */
    function clickedOffHubBox(e){
        if ((e.target.className && e.target.className.includes("header-hub")) || $(e.target).parents("#hdrHub").length) return;
        window.removeEventListener('click', clickedOffHubBox, false);
        $timeout(function () {
            $scope.showHubBox = !$scope.showHubBox;
        }, 0);
     }

     $scope.showHubBoxFun = function(){
        if($scope.showHubBox){
            window.removeEventListener('click', clickedOffHubBox, false);
        } else{
            setTimeout(function () {
                window.addEventListener('click', clickedOffHubBox, false);
            }, 10);
        }
        $scope.showHubBox = !$scope.showHubBox;
     };

    $scope.init();
});