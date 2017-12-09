 app.controller("mainController", function($scope, $http, storage, $cookies, $window, $location, $anchorScroll, mapServices) {
    $scope.map;
    $scope.userDropDown = false;

    $scope.init = function(){
        // always scroll to the top, then later to defined hash
        var currentHash = $location.hash();
        $scope.scrollTo("gettingstarted");

        $scope.map = mapServices.createMap("map");

        mapServices.createCoveragePolygon().then(function(polygon){
            if (polygon){
                $scope.coveragePolygon = polygon;
                $scope.coveragePolygon.setMap($scope.map);
            }
        });
        
        $scope.autocomplete = mapServices.createAddressAutocomplete("addressAutocomplete");
        $scope.autocomplete.addListener('place_changed', gotAddressResults);
    };

    $scope.showHideUserDropdown = function () {
        $scope.userDropDown = !$scope.userDropDown;
    }

    /**
     * This function is called after autocomplete gets the address
     */
    function gotAddressResults(){
        var place = $scope.autocomplete.getPlace();
        if (mapServices.isPlaceInsidePolygon(place, $scope.coveragePolygon)){
            $cookies.putObject("homit-address", place);
            $scope.scrollTo('homitHub');
        } else {
            $scope.addressMessage = "Sorry, we do not deliver to your location at the moment";
            $scope.scrollTo('coverage');
        }
        $scope.$apply();
    }

    $scope.clearAddressSearch = function(){
        $scope.searchedAddress = "";
    }
    $scope.hrefTo = function(path){
        $window.location.href = $window.location.origin + path;
    }

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
    }

    $scope.init();
});