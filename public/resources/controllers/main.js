 app.controller("mainController", function($scope, $http, $window) {
    $scope.map;

    $scope.init = function(){
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
    };

    /**
     * This function is called after autocomplete gets the address
     */
    function gotAddressResults(){
        var place = $scope.autocomplete.getPlace();
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        if (google.maps.geometry.poly.containsLocation(new google.maps.LatLng(lat, lng), $scope.coveragePolygon)){
            $scope.addressMessage = "We deliver";
        } else {
            $scope.addressMessage = "Sorry, we do not deliver to your location at the moment";
        }
        $scope.$apply();
    }

    $scope.clearAddressSearch = function(){
        $scope.searchedAddress = "";
    }
    $scope.hrefTo = function(path){
        $window.location.href = $window.location.origin + path;
    }
    $scope.init();
});