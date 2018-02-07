 app.controller("mainController", function($scope, $http, sessionStorage, $cookies, $window, $location, $anchorScroll, mapServices) {
    $scope.map = undefined;
    $scope.userDropDown = false;

    $scope.init = function(){

        // always scroll to the top, then later to defined hash
        var currentHash = $location.hash();
        if (!sessionStorage.getAddress()){
            $scope.scrollTo("gettingstarted");
        }

        $scope.map = mapServices.createMap("map");

        mapServices.createCoveragePolygon().then(function(polygon){
            if (polygon){
                $scope.coveragePolygon = polygon;
                $scope.coveragePolygon.setMap($scope.map);
            }
        });

        // add listener for resize
        google.maps.event.addDomListener(window, 'resize', function() {
            $scope.map.setCenter(new google.maps.LatLng(51.054637, -114.094996));
        });
    };

    $scope.showHideUserDropdown = function () {
        $scope.userDropDown = !$scope.userDropDown;
    };

    /**
     * This function is called after autocomplete gets the address
     */
    $scope.gotAddressResults = function(){
        var latLng = $scope.autocomplete.getLatLng();
        if (!latLng) return;
        if (mapServices.isPlaceInsidePolygon(latLng, $scope.coveragePolygon)){
            sessionStorage.setAddress($scope.autocomplete.getPlace());
            sessionStorage.setAddressLat(latLng.lat());
            sessionStorage.setAddressLng(latLng.lng());
            $scope.scrollTo('homitHub');
        } else {
            $scope.addressMessage = "Sorry, we do not deliver to your location at the moment.";
            $scope.scrollTo('coverage');
        }
    };
    
    $scope.hrefTo = function(path){
        $window.location.href = $window.location.origin + path;
        sessionStorage.setCategoryClicked("store-switched");
    };

    /**
     * When called this method will scroll view to the element with 'id'
     * @param id - element id
     */
    $scope.scrollTo = function(id){
        $location.hash(id.toLowerCase());
        Element.prototype.documentOffsetTop = function () {
            return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
        };
        var el = document.getElementById(id);
        if(el){
            var top = document.getElementById(id).documentOffsetTop();
            animateScrollTo(top, {speed: 1000});
        }
    };
    $scope.init();
});