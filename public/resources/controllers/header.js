app.controller("LogoSearchController", function ($scope, $http) { });

app.controller("NavigationController", function ($scope, $http, $cookies, $window, $rootScope, $timeout, $mdSidenav, $log, storage) {
    $scope.init = function () {
        $scope.storeHub = false;
        $scope.userDropDown = false;
        try {
            $scope.deliveryAddress = $cookies.getObject("homit-address").name;
        } catch (e) {
            // ignore, address doesn't exist
        }
    }
    $scope.logout = function () {
        $http({
            method: 'POST',
            url: '/api/authentication/signout'
        }).then(function successCallback(response) {
            if (response.data["success"]) {
                //delete cookie
                $cookies.remove("user");
                $rootScope.$broadcast("addNotification", {
                    type: "alert-success",
                    message: response.data["ui_message"],
                    href: "/",
                    reload: true
                });
            } else {
                // TODO: error handling
                console.log("password not reset");
            }
        }, function errorCallback(response) {
            $rootScope.$broadcast("addNotification", { type: "alert-danger", message: response.data["ui_message"] });
            console.log("ERROR in password reset");
        });
    }

    // Header right-SideNav functionality
    // Start
    $scope.toggleTop = buildTogglerTop('top');
    $scope.toggleLeft = buildTogglerLeft('left');
    function debounce(func, wait, context) {
        var timer;
        return function debounced() {
            var context = $scope,
                args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function () {
                timer = undefined;
                func.apply(context, args);
            }, wait || 10);
        };
    }
    function buildTogglerTop(navID) {
        return function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        };
    }
    function buildTogglerLeft(navID) {
        return function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        };
    }

    $scope.close = function () {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav('top').close()
            .then(function () {
                $log.debug("close TOP is done");
            });
    };
    $scope.close = function () {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav('left').close()
            .then(function () {
                $log.debug("close LEFT is done");
            });
    };
    // End

    this.checkSubcategories = function (subcategory_name) {
        $rootScope.$broadcast("checkSubcategories", subcategory_name);
    }
    this.emptySubcategories = function () {
        $rootScope.$broadcast("emptySubcategories");
    }

    $scope.hrefTo = function (path) {
        $window.location.href = $window.location.origin + path;
    }
    $scope.init();

    $scope.showHideUserDropdown = function () {
        $scope.userDropDown = !$scope.userDropDown;
    }

    $scope.searchRequest = "";
    $scope.searchRequestResult = {};
    $scope.searchRequestURL = "";

    var searchRequestElement = document.getElementById('glbSearchRequest');
    searchRequestElement.addEventListener('keyup', globalSearch, false);

    function globalSearch() {
        if ($scope.searchRequest.length >= 3) {
            $http({
                method: 'POST',
                url: "/api/catalog/search",
                data: {
                    search: $scope.searchRequest
                }
            }).then(function successCallback(response) {

                var responseResult = response.data.result;
                var responseResultProduct = response.data.result.products;
                $scope.searchResult = [];

                if (!responseResult.products) {
                    if (responseResult.length > 0) {
                        for (var i = 0; i < responseResult.length; i++) {
                            var searchRequestResult;
                            var searchRequestSubcategory;
                            var searchRequestURL;
                            var showResultNode = {};
                            if (responseResult[i].subcategory) {
                                searchRequestResult = responseResult[i].subcategory;
                                searchRequestURL = "/catalog/" + responseResult[i].super_category + "/" + responseResult[i].category;
                                searchRequestSubcategory = responseResult[i].subcategory;
                            }
                            else if (responseResult[i].category) {
                                searchRequestResult = responseResult[i].category;
                                searchRequestURL = "/catalog/" + responseResult[i].super_category + "/" + responseResult[i].category;
                                searchRequestSubcategory = "";
                            }
                            else if (responseResult[i].super_category) {
                                searchRequestResult = responseResult[i].super_category;
                                searchRequestURL = "/catalog/" + responseResult[i].super_category;
                                searchRequestSubcategory = "";
                            }
                            showResultNode['result'] = searchRequestResult;
                            showResultNode['subcategory'] = searchRequestSubcategory;
                            showResultNode['path'] = searchRequestURL;
                            $scope.searchResult.push(showResultNode);
                        }
                    } else {
                        var showResultNode = {};
                        showResultNode['result'] = "No Search Result"
                        $scope.searchResult.push(showResultNode);
                    }
                } else {
                    for (var i = 0; i < responseResultProduct.length; i++) {

                        var showResultNode = {};

                        if (responseResultProduct[i].name != null) {
                            showResultNode['brandName'] = responseResultProduct[i].brand + " " + responseResultProduct[i].name;
                        } else {
                            showResultNode['brandName'] = responseResultProduct[i].brand;
                        }
                        showResultNode['product_id'] = responseResultProduct[i].product_id;
                        showResultNode['subcategory'] = responseResultProduct[i].subcategory;
                        showResultNode['image'] = "/resources/images/products/" + responseResultProduct[i].super_category + "/" + responseResultProduct[i].category + "/" + responseResultProduct[i].image;
                        showResultNode['path'] = "/catalog/" + responseResultProduct[i].super_category + "/" + responseResultProduct[i].category;

                        $scope.searchResult.push(showResultNode);
                    }
                }
            }, function errorCallback(response) {
                console.error("error");
            });
        }
        $scope.sendSubcategory = function (subcategory, product_id) {
            $cookies.putObject("ToTheSubcategory", subcategory);
            if (product_id) {
                $cookies.putObject("ToTheProduct", product_id);
            }
        }
    }

});