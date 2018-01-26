app.controller("LogoSearchController", function ($scope, $http) { });

app.controller("NavigationController", function ($scope, $http, $cookies, $window, $rootScope, $timeout, $mdSidenav, $log, sessionStorage, user, notification) {
    $scope.init = function () {
        $scope.storeHub = false;
        $scope.userDropDown = false;
        $scope.mobileSearchShow = false;
        $scope.screenIsMob = false;
        var screen_width = $(window).width();
        try {
            $scope.deliveryAddress = $cookies.getObject("homit-address").name;
        } catch (e) {
            // ignore, address doesn't exist
        }
        var screen_width = $(window).width();
        if (screen_width < 1000) {
            $scope.screenIsMob = true;
        } else {
            $scope.screenIsMob = false;
        }
        $scope.showSearchBar = $("#searchBarBoolean").val();

        addEvLisToSearch();
        checkUser();
    };

    $scope.$on("checkUserLogin", function (event, args) {
        checkUser();
    });

    $scope.logout = function () {
        $http({
            method: 'POST',
            url: '/api/authentication/signout'
        }).then(function successCallback(response) {
            if (response.data.success) {
                //delete cookie
                $cookies.remove("user");
                $rootScope.$broadcast("checkUserLogin");
                notification.addSuccessMessage("Logged out");
            } else {
                // TODO: error handling
                console.log("password not reset");
                notification.addErrorMessage("Couldn't log out. Please try again");
            }
        }, function errorCallback(response) {
            console.log("ERROR in password reset");
        });
    };

    function clickedOffBox(e) {
        var el = document.getElementById($scope.id_1).attributes;
        if (el['aria-hidden'].value == "false") {
            if (event.target.id != $scope.id_1 && event.target.id != $scope.id_2 && event.target.id != $scope.id_3 && event.target.id != $scope.id_4) {
                document.getElementById($scope.id_1).setAttribute("aria-hidden", "true");
                window.removeEventListener('click', clickedOffBox, false);
            }
        }
    }

    $scope.hdrExtBx = function (id_1, id_2, id_3, id_4) {
        if ($scope.id_1 != undefined && $scope.id_1 != id_1) {
            document.getElementById($scope.id_1).setAttribute("aria-hidden", "true");
            window.removeEventListener('click', clickedOffBox, false);
        }
        $scope.id_1 = id_1;
        $scope.id_2 = id_2;
        $scope.i_3 = id_3;
        $scope.id_4 = id_4;
        var el = document.getElementById(id_1).attributes;
        if (el["aria-hidden"].value == "true") {
            document.getElementById($scope.id_1).setAttribute("aria-hidden", "false");
        } else {
            document.getElementById($scope.id_1).setAttribute("aria-hidden", "true");
            window.removeEventListener('click', clickedOffBox, false);
        }
        if (el["aria-hidden"].value == "false") {
            setTimeout(function () {
                window.addEventListener('click', clickedOffBox, false);
            }, 100);
        }
    };

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
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        };
    }
    function buildTogglerLeft(navID) {
        return function () {
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        };
    }
    $scope.close = function () {
        $mdSidenav('top').close()
            .then(function () {
                $log.debug("close TOP is done");
            });
    };
    $scope.close = function () {
        $mdSidenav('left').close()
            .then(function () {
                $log.debug("close LEFT is done");
            });
    };
    // End

    this.checkSubcategories = function (subcategory_name) {
        $rootScope.$broadcast("checkSubcategories", subcategory_name);
    };

    this.emptySubcategories = function () {
        $rootScope.$broadcast("emptySubcategories");
    };

    $scope.hrefTo = function (path) {
        $window.location.href = $window.location.origin + path;
        sessionStorage.setCategoryClicked("store-switched");
    };

    $scope.showHideUserDropdown = function () {
        $scope.userDropDown = !$scope.userDropDown;
    };

    $scope.searchRequest = "";
    $scope.searchRequestURL = "";
    $scope.isArrowPressed = false;
    $scope.resListNode = 0;

    function addEvLisToSearch(){
        if($scope.screenIsMob){
            var searchRequestElement = document.getElementById('glbSearchRequest-mobile');    
        } else{
            var searchRequestElement = document.getElementById('glbSearchRequest');
        }
        searchRequestElement.addEventListener('keyup', globalSearch, false);
    }

    function globalSearch(evt) {
        if ($scope.searchRequest.length >= 3 && evt.keyCode != 40 && evt.keyCode != 38 && evt.keyCode != 13 && evt.keyCode != 27) {
            $http({
                method: 'POST',
                url: "/api/catalog/search",
                data: {
                    search: $scope.searchRequest.toLowerCase()
                }
            }).then(function successCallback(response) {

                $scope.searchDisplay = response.data.result;
                $scope.resultSuperCategory = $scope.searchDisplay.super_category;
                $scope.resultCategory = $scope.searchDisplay.category;
                $scope.resultSubcategory = $scope.searchDisplay.subcategory;
                $scope.resultProducts = $scope.searchDisplay.products;

                $scope.searchResult = $scope.resultSuperCategory.concat($scope.resultCategory.concat($scope.resultSubcategory.concat($scope.resultProducts)));

            }, function errorCallback(response) {
                console.error("error");
            });
        } else if(evt.keyCode == 27){
            document.getElementById("clear-search").click();
        }

        // TODO: not declared in controller's scope
        $scope.sendSubcategory = function (subcategory, product_id) {
            sessionStorage.setSearchSubcategory(subcategory);
            if (product_id) {
                sessionStorage.setSearchProduct(product_id);
            }
        };

        navigateSearchResult(evt, $scope.searchResult);
    }

    function navigateSearchResult(evt, searchResult) {
        // TODO make arrow selected result node appear in the "input line"

        var el = document.querySelectorAll('.srchRslt');
        if (evt.keyCode == 40 && $scope.isArrowPressed == false) {
            if (searchResult) {
                $scope.isArrowPressed = true;
            } else {
                $scope.isArrowPressed = true;
            }
            document.getElementById(el[0].id).classList.add('srchRsltKEYS');
        }
        else if (evt.keyCode == 38) {
            if ($scope.resListNode == 0) {
                $scope.resListNode = $scope.searchResult.length - 1;
                document.getElementById(el[0].id).classList.remove('srchRsltKEYS');
                document.getElementById(el[$scope.resListNode].id).classList.add('srchRsltKEYS');
            } else {
                $scope.resListNode -= 1;
                document.getElementById(el[$scope.resListNode + 1].id).classList.remove('srchRsltKEYS');
                document.getElementById(el[$scope.resListNode].id).classList.add('srchRsltKEYS');
            }
        } else if (evt.keyCode == 40) {
            if ($scope.resListNode == $scope.searchResult.length - 1) {
                $scope.resListNode = 0;
                document.getElementById(el[$scope.searchResult.length - 1].id).classList.remove('srchRsltKEYS');
                document.getElementById(el[0].id).classList.add('srchRsltKEYS');
            } else {
                $scope.resListNode += 1;
                document.getElementById(el[$scope.resListNode].id).classList.add('srchRsltKEYS');
                document.getElementById(el[$scope.resListNode - 1].id).classList.remove('srchRsltKEYS');
            }
        }
        if (evt.keyCode == 13 && $scope.isArrowPressed == true) {
            document.getElementById(el[$scope.resListNode].id).click();
        }
    }


    function checkUser() {
        if (user.isUserLogged()) {
            $scope.isSignedIn = true;
            $scope.username = user.getName();
        } else {
            $scope.isSignedIn = false;
            $scope.username = "";
        }
    }

    $scope.init();
});