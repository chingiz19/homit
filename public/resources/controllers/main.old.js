app.controller("mainController", function ($scope, $http, sessionStorage, $cookies, $window, $location, $anchorScroll, mapServices, $timeout, googleAnalytics) {
    $scope.map = undefined;
    $scope.userDropDown = false;
    $scope.showCoverageMap = false;
    $scope.bounds = undefined;

    $scope.init = function () {

        var screen_width = window.screen.width;
        if (screen_width < 500) {
            $scope.screenIsMob = true;
        } else {
            $scope.screenIsMob = false;
        }

        // always scroll to the top, then later to defined hash
        var currentHash = $location.hash();
        if (!sessionStorage.getAddress()) {
            $scope.scrollTo("gettingstarted");
        }

        $scope.map = mapServices.createMap("map");

        //TODO: change to dynamic
        $scope.bounds = new google.maps.LatLngBounds({ lat: 50.862122, lng: -114.173317 }, { lat: 51.172396, lng: -113.925171 });

        mapServices.createCoveragePolygon().then(function (polygon) {
            if (polygon) {
                $scope.coveragePolygon = polygon;
                $scope.coveragePolygon.setMap($scope.map);
            }
        });

        // add listener for resize
        google.maps.event.addDomListener(window, 'resize', function () {
            $scope.map.setCenter(new google.maps.LatLng(51.054637, -114.094996));
        });
    };

    $scope.showHideUserDropdown = function () {
        $scope.userDropDown = !$scope.userDropDown;
    };

    /**
     * This function is called after autocomplete gets the address
     */
    $scope.gotAddressResults = function () {
        $("#autocompleteAddressInputBox").blur();
        var latLng = $scope.autocomplete.getLatLng();
        var place = $scope.autocomplete.getPlace();
        if (!latLng) return;
        if (mapServices.isPlaceInsidePolygon(latLng, $scope.coveragePolygon)) {
            sessionStorage.setAddress(place);
            sessionStorage.setAddressLat(latLng.lat());
            sessionStorage.setAddressLng(latLng.lng());
            $timeout(function(){
                $scope.scrollTo('homitHub');                
            }, 200);
        } else {
            $scope.showCoverageMap = true;
            var mapGrowClass = [];
            if(!$scope.screenIsMob){
                mapGrowClass[0] = "address-box-grow-screen";
                mapGrowClass[1] = "covergae-map-box-grow-screen";
            } else{
                mapGrowClass[0] = "address-box-grow-mob";
                mapGrowClass[1] = "covergae-map-box-grow-mob";
            }
            $timeout(function() {
                $(".srchAddrsC").addClass(mapGrowClass[0]);
                $(".covergae-map-box").addClass(mapGrowClass[1]);
                $(".addressMessage").addClass("addressMessage-show");
                if($scope.screenIsMob){
                    animateScrollTo(0, { speed: 2000 });
                }
            }, 100);
            googleAnalytics.addEvent('out_of_coverage', {
                "event_label": place.formatted_address,
                "event_category": googleAnalytics.eventCategories.address_actions
            });
        }
    };

    $scope.$watch('showCoverageMap', function(newValue){
        if (!newValue){
            $timeout(function() {
                if(!$scope.screenIsMob){
                    $(".srchAddrsC").removeClass("address-box-grow-screen");
                } else{
                    $(".srchAddrsC").removeClass("address-box-grow-mob");
                }
            }, 50);
        }
    });

    $scope.hrefTo = function (path) {
        $window.location.href = $window.location.origin + path;
        sessionStorage.setCategoryClicked("store-switched");
    };

    /**
     * When called this method will scroll view to the element with 'id'
     * @param id - element id
     */
    $scope.scrollTo = function (id) {
        $location.hash(id.toLowerCase());
        Element.prototype.documentOffsetTop = function () {
            return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
        };
        var el = document.getElementById(id);
        if (el) {
            var top = document.getElementById(id).documentOffsetTop();
            animateScrollTo(top, { speed: 1000 });
        }
    };

    $scope.init();
});