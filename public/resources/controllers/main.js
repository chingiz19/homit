app.controller("mainController", function ($scope, $http, sessionStorage, $cookies, $window, $location, $anchorScroll, mapServices, $timeout, googleAnalytics) {
    $scope.map = undefined;
    $scope.userDropDown = false;
    $scope.showMapMessage = false;
    // $scope.showCoverageMap = false;
    $scope.bounds = undefined;


    $scope.init = function () {

        $scope.screenIsMob = global_screenIsMob;

        if(global_screenIsMob){
            $(".full-screen").css({"height": window.innerHeight});
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
            if($scope.screenIsMob){
                $scope.scrollTo('address');
            }
            $timeout(function(){
                $(".loc-sucsess-msg").css({'opacity': '1', 'width': '100%', 'z-index': '2', 'transition' : 'opacity 0.8s ease-out, width 0.6s ease-out'});
                clearLocSucMsg(3500);
            }, 200);
        } else {
            $timeout(function(){
                $scope.showMapMessage = true;
                $scope.scrollTo('coverage-map');                
            }, 200);
            googleAnalytics.addEvent('out_of_coverage', {
                "event_label": place.formatted_address,
                "event_category": googleAnalytics.eventCategories.address_actions
            });
        }
    };

    // $scope.$watch('showCoverageMap', function(newValue){
    //     if (!newValue){
    //         $timeout(function() {
    //             if(!$scope.screenIsMob){
    //                 $(".address-input-sec").removeClass("address-box-grow-screen");
    //             } else{
    //                 $(".address-input-sec").removeClass("address-box-grow-mob");
    //             }
    //         }, 50);
    //     }
    // });

    $scope.hrefTo = function (path) {
        $window.location.href = $window.location.origin + path;
        sessionStorage.setCategoryClicked("store-switched");
    };

    function clearLocSucMsg(time){
        setTimeout(() => {
            $(".loc-sucsess-msg").css({'opacity': '0', 'width': '0', 'z-index': '-1', 'transition' : 'all 0.8s ease-out'});
            setTimeout(() => {
                $(".loc-sucsess-msg").removeAttr('style');
            }, 600);
        }, time);
        
    }

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