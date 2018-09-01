app.controller("aboutController", function ($scope, mapServices) {
    $scope.init = function () {
        $scope.coverage = {};
        $scope.showMap = false;
        $scope.mapWrapperClass = "map-wrapper-hide";
        $scope.isMapInit = false;
        $scope.mapIsLoading = false;
    };

    $scope.toggleMap = function(city){
        if ($scope.currentMap == city){
            $scope.showMap = false;
            $scope.mapWrapperClass = "map-wrapper-hide";
            $scope.currentMap = undefined;
            return;
        }
        initMap();
        $scope.showMap = true;
        $scope.mapWrapperClass = "map-wrapper-show";
        $scope.currentMap = city;

        if ($scope.coverage[city]){
            $scope.coverage[city].setMap($scope.map);   
            return;
        }

        $scope.mapIsLoading = true;
        mapServices.createCoveragePolygon().then(function(data){
            $scope.mapIsLoading = false;
            $scope.coverage[city] = data;
            $scope.coverage[city].setMap($scope.map);
            $scope.$apply();
        });
        
        
        return;
    };

    function initMap(){
        if ($scope.isMapInit){
            return;
        }

        $scope.map = mapServices.createMap('map');
        $scope.isMapInit = true;
    }

    $scope.init();
});