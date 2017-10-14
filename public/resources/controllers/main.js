 app.controller("mainController", function($scope, $http, storage, $cookies, $window, $location, $anchorScroll) {
    $scope.map;

    $scope.init = function(){
        // always scroll to the top, then later to defined hash
        var currentHash = $location.hash();
        $scope.scrollTo("");

        $scope.map = new google.maps.Map($("#map")[0], {
            zoom: 12,
            center: new google.maps.LatLng(51.074314, -114.094996),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        $http({
                method: 'GET',
                url: '/api/map/coverage'
            }).then(function successCallback(response) {
                if (response.data["success"]) {
                    $scope.coveragePolygon = new google.maps.Polygon({
                        paths: response.data.coverage,
                        strokeColor: '#2a5191',
                        strokeOpacity: 1,
                        strokeWeight: 3,
                        fillColor: '#2a5191',
                        fillOpacity: 0.5,
                        geodesic: true
                    });
                    $scope.coveragePolygon.setMap($scope.map);
                    $scope.autocomplete = new google.maps.places.Autocomplete(
                        document.getElementById("addressAutocomplete"), {
                            types: ['geocode'],
                            componentRestrictions: {country: 'ca'}
                        }
                    );
                    $scope.autocomplete.addListener('place_changed', gotAddressResults);
                } else {
                    console.warn("Couldn't get coverage map");
                }
            }, function errorCallback(response) {
                console.error("Something went wrong while getting coverage map");
            });

            // scroll to defined hash, if any
            setTimeout(function(){
                $scope.scrollTo(currentHash);
            }, 1000);
    };

    /**
     * This function is called after autocomplete gets the address
     */
    function gotAddressResults(){
        var place = $scope.autocomplete.getPlace();
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        if (google.maps.geometry.poly.containsLocation(new google.maps.LatLng(lat, lng), $scope.coveragePolygon)){
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
        $location.hash(id);
        $anchorScroll();
    }

    $scope.init();
});