 app.controller("mainController", function($scope, $http) {
    $scope.map;
    $scope.coveragePath = [
            {lat: 51.086562, lng: -114.130209},
            {lat: 51.087506, lng: -114.128185},
            {lat: 51.087164, lng: -114.127591},
            {lat: 51.085902, lng: -114.128345}
        ];

    $scope.init = function(){
        $scope.map = new google.maps.Map($("#map")[0], {
            zoom: 16,
            center: new google.maps.LatLng(51.086817, -114.128646),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var coveragePolygon = new google.maps.Polygon({
            paths: $scope.coveragePath,
            strokeColor: '#18bc18',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: '#18bc18',
            fillOpacity: 0.5
        });
        coveragePolygon.setMap($scope.map);
    };
    
    $scope.init();
});