app.controller("mainController", function ($scope, $http, sessionStorage, $cookies, $window, $location, $anchorScroll, mapServices, $timeout, googleAnalytics, helpers, notification) {
    $scope.map = undefined;
    $scope.showMapMessage = false;
    $scope.specialSelected = "popular";
    $scope.bounds = undefined;
    $scope.addressMessage = undefined;
    $scope.userSubscribed = false;
    $scope.hubStores = [];

    $scope.mainSpecials = {};

    $scope.init = function () {

        $scope.screenIsMob = global_screenIsMob;
        $scope.subscribeClassBtn = "subscribe-button";
        $scope.subscribeClassInput = "subscribe-input";
        $scope.subscribeButtonText = "SUBSCRIBE";

        if (global_screenIsMob) {
            $(".full-screen").css({ "height": window.innerHeight });
        }

        // always scroll to the top, then later to defined hash
        var currentHash = $location.hash();
        if (!sessionStorage.getAddress()) {
            $scope.scrollTo("gettingstarted");
        }

        //TODO: change to dynamic
        $scope.bounds = new google.maps.LatLngBounds({ lat: 50.862122, lng: -114.173317 }, { lat: 51.172396, lng: -113.925171 });

        mapServices.createCoveragePolygon().then(function (polygon) {
            if (polygon) {
                $scope.coveragePolygon = polygon;
                $scope.coveragePolygon.setMap($scope.map);
            }
        });

        $http({
            method: 'GET',
            url: "/api/hub/allstores"
        }).then(function successCallback(response) {
            $timeout(function () {
                $scope.hubStores = response.data.store_types;
            }, 550);
        }, function errorCallback(response) {
            notification.addErrorMessage("Sorry. Something went wrong.");
        });

        $http({
            method: 'GET',
            url: "/api/hub/mainspecials"
        }).then(function successCallback(response) {
            $scope.mainSpecials = response.data.specials;
            for (let speciatType in $scope.mainSpecials) {
                for (let x = 0; x < $scope.mainSpecials[speciatType].products.length; x++) {
                    $scope.mainSpecials[speciatType].products[x]["product_url"] = helpers.buildProductPagePath($scope.mainSpecials[speciatType].products[x], $scope.mainSpecials[speciatType].products[x].store_name);
                }
            }
        }, function errorCallback(response) {
            notification.addErrorMessage("Sorry. Something went wrong.");
        });

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
            if ($scope.screenIsMob) {
                $scope.scrollTo('address');
            }
            $timeout(function () {
                $(".location-msg").css({ 'opacity': '1', 'width': '100%', 'z-index': '2', 'transition': 'opacity 0.8s ease-out, width 0.6s ease-out' });
                $scope.addressMessage = "We Deliver!";
                clearLocSucMsg(3500);
            }, 200);
        } else {
            $timeout(function () {
                $(".location-msg").css({ 'opacity': '1', 'width': '100%', 'z-index': '2', 'transition': 'opacity 0.8s ease-out, width 0.6s ease-out' });
                $scope.addressMessage = "Out of Coverage Area.";
                clearLocSucMsg(3500);
            }, 200);
            googleAnalytics.addEvent('out_of_coverage', {
                "event_label": place.formatted_address,
                "event_category": googleAnalytics.eventCategories.address_actions
            });
        }
    };

    $scope.hrefTo = function (path) {
        $window.location.href = $window.location.origin + path;
    };

    $scope.changeTranPrd = function (type) {
        let old_type = $scope.specialSelected;
        if (old_type == type) return;
        $('#' + old_type).addClass('tranding-type-btn');
        $('#' + type).removeClass('tranding-type-btn');
        $scope.specialSelected = type;
        googleAnalytics.addEvent('trending_products', {
            "event_label": type,
            "event_category": googleAnalytics.eventCategories.main_actions
        });
    };

    function clearLocSucMsg(time) {
        setTimeout(() => {
            $(".location-msg").css({ 'opacity': '0', 'width': '0', 'z-index': '-1', 'transition': 'all 0.8s ease-out' });
            setTimeout(() => {
                $(".location-msg").removeAttr('style');
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
            animateScrollTo(top, { speed: 2000 });
        }
    };

    /**
     * When called this method will send request to BE to subscribe user to mailing list (Guest Users list)
     */
    $scope.subscribe = function () {
        let userEmail = $scope.subscribeEmail;
        if (!$scope.userSubscribed) {
            if (userEmail) {
                $http({
                    method: 'POST',
                    url: '/api/marketing/subscribe',
                    data: {
                        email: userEmail,
                    }
                }).then(function successCallback(response) {
                    if (response.data.success) {
                        $scope.subscribeClassBtn = "subscribe-button-suc";
                        $scope.subscribeClassInput = "subscribe-input-suc";
                        $timeout(function () {
                            $scope.subscribeButtonText = response.data.ui_message;
                        }, 400);
                        $scope.userSubscribed = true;

                        googleAnalytics.addEvent('subscribed', {
                            "event_label": "subscribed",
                            "event_category": googleAnalytics.eventCategories.main_actions
                        });
                    } else {
                        $scope.subscribeClassBtn = "subscribe-button";
                        $scope.subscribeErrorMessage = response.data.ui_message;
                    }
                }, function errorCallback(error) {
                    $scope.subscribeClassBtn = "subscribe-button";
                    console.log('errorCallback'); //error notification, on a side
                });
            } else {
                $scope.subscribeErrorMessage = "Valid email only";
            }
        } else {
            $scope.subscribeClassBtn = "subscribe-button";
            $scope.subscribeClassInput = "subscribe-input";
            $scope.subscribeButtonText = "SUBSCRIBE";
        }
    };

    /**
    * When called this method will clear any warning messages
    */
    $scope.subscribeOnFocus = function () {
        $scope.subscribeErrorMessage = "";
    };

    $scope.productClick = function (item) {
        googleAnalytics.addEvent('product_clicked', {
            "event_label": item.name + " " + item.brand,
            "event_category": googleAnalytics.eventCategories.main_actions
        });
    };

    $window.onload = function () {
        setTimeout(() => {
            addStoreAnimationClass($scope.hubStores, "LS-move", "LIM-move");
        }, 620);
        AOS.init();
    };

    function addStoreAnimationClass(array, class1, class2) {
        let store_class_added = false;
        for (let x = 0; x < $scope.hubStores.length; x++) {
            if (!store_class_added) {
                $("#store_" + x).addClass(class1);
                store_class_added = !store_class_added;
            } else {
                $("#store_" + x).addClass(class2);
                store_class_added = !store_class_added;
            }
        }
    }

    $scope.init();
});