/**
 * This service provides storage services
 * 
 * 
 * @copyright Homit (c) 2017
 * @author Jeyhun Gurbanov
 */
app.service('mapServices', ["$http", function($http){

    var pub = {};

    /**
     * Retrieves coordinates from backend, and creates Polygon
     */
    pub.createCoveragePolygon = function(){
        return $http({
                method: 'GET',
                url: '/api/map/coverage'
            }).then(function successCallback(response) {
                if (response.data["success"]) {
                    return new google.maps.Polygon({
                        paths: response.data.coverage,
                        strokeColor: '#2a5191',
                        strokeOpacity: 1,
                        strokeWeight: 3,
                        fillColor: '#2a5191',
                        fillOpacity: 0.5,
                        geodesic: true
                    });
                } else {
                    console.warn("Couldn't get coverage map");
                }
            }, function errorCallback(response) {
                console.error("Something went wrong while getting coverage map");
                return false;
            });
    }


    /**
     * Creates Google autocomplete
     * 
     * @param elementId - id of element to bind autocomplete to
     * @return Google autocomplete variable
     */
    pub.createAddressAutocomplete = function(elementId){
        return new google.maps.places.Autocomplete(
            document.getElementById(elementId), {
                types: ['geocode'],
                componentRestrictions: {country: 'ca'}
            }
        ); 
    }

    pub.createMap = function(elementId, options){
        if (!options){
            options = {
                zoom: 12,
                center: new google.maps.LatLng(51.074314, -114.094996),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
        }
        return new google.maps.Map(document.getElementById(elementId), options);
    }

    /**
     * Checks if Google place object is within given polygon
     * 
     * @param place     - Google place object
     * @param polygon   - Polygon to check against
     * @return boolean
     */
    pub.isPlaceInsidePolygon = function(place, polygon){
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        return google.maps.geometry.poly.containsLocation(new google.maps.LatLng(lat, lng), polygon);
    }

    return pub;
}]);
