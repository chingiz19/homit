app.controller("LogoSearchController", function ($scope, $http) {});

app.controller("NavigationController", function ($scope, $http, $cookies, $window, $rootScope,$timeout, $mdSidenav, $log) {
        $scope.init = function(){
            $scope.showDashboard = false;
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
    $scope.toggleLeft = buildToggler('left');
    $scope.isOpenRight = function(){
      return $mdSidenav('left').isOpen();
    };
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
    function buildToggler(navID) {
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
    $scope.init();
});