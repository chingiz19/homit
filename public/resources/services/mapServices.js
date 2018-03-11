/**
 * This service provides map services
 * 
 * 
 * @copyright Homit (c) 2017
 * @author Jeyhun Gurbanov
 */
app.service('mapServices', ["$http", "sessionStorage", function ($http, sessionStorage, $window) {

    var pub = {};

    /**
     * Retrieves coordinates from backend, and creates Polygon
     */
    pub.createCoveragePolygon = function () {
        var coverage = sessionStorage.getCoverageMap();
        if (coverage){
            return Promise.resolve(new google.maps.Polygon({
                paths: coverage,
                strokeColor: '#2a5191',
                strokeOpacity: 0.9,
                strokeWeight: 3,
                fillColor: 'rgba(42,81,145,0.5)',
                fillOpacity: 0.5,
                geodesic: true
            }));
        }
        return $http({
                method: 'GET',
                url: '/api/map/coverage'
            }).then(function successCallback(response) {
                if (response.data.success) {
                    sessionStorage.setCoverageMap(response.data.coverage);
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
                    Logger.warn("Couldn't get coverage map");
                }
            }, function errorCallback(response) {
                console.error("Something went wrong while getting coverage map");
                return false;
            });
    };

    pub.createMap = function (elementId, options) {
        var screen_width = window.screen.width;
        var zoom_scale;
        if(screen_width < 500){
            zoom_scale = 11;
        } else{
            zoom_scale = 10; 
        }
        if (!options) {
            options = {
                zoom: zoom_scale,
                center: new google.maps.LatLng(51.054637, -114.094996),
                // zoomControl: false,
                // scaleControl: false,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                rotateControl: false,
                disableDoubleClickZoom: false,
                // gestureHandling: "none",
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
        }
        return new google.maps.Map(document.getElementById(elementId), options);
    };

    /**
     * Checks if Google place object is within given polygon
     * 
     * @param place     - Google place object
     * @param polygon   - Polygon to check against
     * @return boolean
     */
    pub.isPlaceInsidePolygon = function (latLng, polygon) {
        return google.maps.geometry.poly.containsLocation(latLng, polygon);
    };

    var icon_customer = {
        path: "M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 2c1.1 0 2 .9 2 2 0 1.11-.9 2-2 2s-2-.89-2-2c0-1.1.9-2 2-2zm0 10c-1.67 0-3.14-.85-4-2.15.02-1.32 2.67-2.05 4-2.05s3.98.73 4 2.05c-.86 1.3-2.33 2.15-4 2.15z",
        fillColor: 'rgba(42,81,145,0.8)',
        fillOpacity: 1,
        strokeWeight: 0,
    };

    var icon_driver = {
        path: "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
        fillColor: 'rgba(0,0,0,0.8)',
        fillOpacity: 1,
        strokeWeight: 0,
    };

    var icon_store = {
        path: "M19 7V4H5v3H2v13h8v-4h4v4h8V7h-3zm-8 3H9v1h2v1H8V9h2V8H8V7h3v3zm5 2h-1v-2h-2V7h1v2h1V7h1v5z",
        fillColor: 'rgba(102, 7, 7, 0.8)',
        fillOpacity: 1,
        strokeWeight: 0,
    };
    var all_markers = [];
    var polyline_latLng = [];
    var routePath = {};

    pub.addPolylineToMap = function(route_markers, map){
        clearMap();
        pub.addMarkerToMap(route_markers, map);

        for(var node in route_markers){
            polyline_latLng.push(route_markers[node].latLng);
        }

        routePath = new google.maps.Polyline({
            path: polyline_latLng,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
          });
          routePath.setMap(map);
    };

    pub.addMarkerToMap = function (markers, map) {
        clearMap();
        for (var i = 0; i < markers.length; i++) {
            var icon;
            if (markers[i].type == "customer") {
                icon = icon_customer;
            } else if(markers[i].type == "driver") {
                icon = icon_driver;
            } else{
                icon = icon_store;
            }
            var marker = new google.maps.Marker({
                position: markers[i].latLng,
                map: map,
                icon: icon,
            });
            google.maps.event.addListener(marker, 'click', (function(marker, j) {
                return function() {
                    var infowindow = new google.maps.InfoWindow();                    
                    infowindow.setContent('<div id="content">'+
                    '<div id="siteNotice">'+
                    '</div>'+
                    '<div id="bodyContent">'+
                    '<div style="display: flex; justify-content: center; line-height: 2em; font-size: 20px; font-weight: 500;">' + markers[j].id_prefix + markers[j].order_id + '</div>'+
                    '<ul style="margin: 0; padding: 0;">'+
                    '<li>Call - <button onclick="call(' + markers[j].phone_number +')">' + markers[j].phone_number + '</button></li>'+
                    '<li>Text - <button onclick="sendText('+ markers[j].phone_number +')">' + markers[j].phone_number + '</button></li>'+
                    '<li>Email - <button onclick="sendEmail('+ markers[j].email +')">' + markers[j].email + '</button></li>'+
                    '</ul>'+
                    '</div>'+
                    '</div>');
                    infowindow.setOptions({maxWidth: 300});
                    infowindow.open(map, marker);
                };
            }) (marker, i));

            all_markers.push(marker);
        }
    };

    function clearMap(){
        for (let i = 0; i < all_markers.length; i++) {
            all_markers[i].setMap(null);
        } 

        all_markers = [];

        for(let i=0; i < polyline_latLng.length; i++){
            polyline_latLng = [];
            routePath.setMap(null);
            break;
        }
    }

    return pub;
}]);
