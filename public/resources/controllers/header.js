app.controller("LogoSearchController", function ($scope, $http) {});

app.controller("NavigationController", function ($scope, $http, $cookies, $window, $rootScope, $timeout, $mdSidenav, $log, storage) {
        $scope.init = function(){
            $scope.storeHub = false;
            $scope.userDropDown=false;
            try{
                $scope.deliveryAddress = $cookies.getObject("homit-address").name;
            } catch(e){
                // ignore, address doesn't exist
            }
        }
        $scope.logout = function(){
            $http({
                method: 'POST',
                url: '/api/authentication/signout'
            }).then(function successCallback(response) {
                if (response.data["success"]) {
                    //delete cookie
                    $cookies.remove("user");
                    $rootScope.$broadcast("addNotification", { 
                        type: "alert-success", 
                        message: response.data["ui_message"], 
                        href: "/", 
                        reload: true 
                    });
                } else {
                    // TODO: error handling
                    console.log("password not reset");
                }
            }, function errorCallback(response) {
                $rootScope.$broadcast("addNotification", { type: "alert-danger", message: response.data["ui_message"]});
                console.log("ERROR in password reset");
            });
    }

    // Header right-SideNav functionality
    // Start
    $scope.toggleTop = buildTogglerTop('top');
    $scope.toggleLeft=buildTogglerLeft('left');
    function debounce(func, wait, context) {
      var timer;
      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }
    function buildTogglerTop(navID) {
      return function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      };
    }
    function buildTogglerLeft(navID) {
      return function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      };
    }

    $scope.close = function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('top').close()
        .then(function () {
          $log.debug("close TOP is done");
        });
    };
    $scope.close = function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });
    };
    // End

    this.checkSubcategories=function(subcategory_name){
        $rootScope.$broadcast("checkSubcategories", subcategory_name);
    }
    this.emptySubcategories=function(){
        $rootScope.$broadcast("emptySubcategories");
    }

    $scope.hrefTo = function(path){
        $window.location.href = $window.location.origin + path;
    }
    $scope.init();

    $scope.showHideUserDropdown = function(){
        $scope.userDropDown = !$scope.userDropDown;
    }
    $scope.searchedItem="";
});