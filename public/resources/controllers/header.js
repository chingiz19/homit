app.controller("headerController", function ($scope, $window, $http, user, notification, $cookies, sessionStorage) {
    $scope.init = function () {

        $scope.showModal = false;
        $scope.mobileSearchShow = false;
        $scope.screenMob = global_screenIsMob;
        $scope.searchListNode = 0;
        addEvLisToSearch();
    };

    $scope.modal = function (logIn, action) {
        var mobile = true;
        if ($scope.screenMob) {
            $window.location.href = $window.location.origin + "/accounts?action=" + action;
        } else {
            $scope.showModal = true;
            $scope.showLogInModal = logIn;
        }
    };

    $scope.logout = function () {
        user.logout()
            .then(function successCallback(response) {
                if (response.data.success) {
                    //delete cookie
                    $cookies.remove("user");
                    $window.location.reload();
                } else {
                    // TODO: error handling
                    console.log("password not reset");
                    notification.addErrorMessage("Couldn't log out. Please try again");
                }
            }, function errorCallback(response) {
                notification.addErrorMessage("Couldn't log out. Please try again");
            });
    };

    $scope.hrefTo = function (path) {
        $window.location.href = $window.location.origin + path;
        sessionStorage.setCategoryClicked("store-switched");
    };

    function addEvLisToSearch() {
        var searchRequestElement;
        if ($scope.screenMob) {
            searchRequestElement = document.getElementById('global-search-input-mobile');
        } else {
            searchRequestElement = document.getElementById('global-search-input');
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
                $scope.resultStoreType = $scope.searchDisplay.store_type;
                $scope.resultCategory = $scope.searchDisplay.category;
                $scope.resultSubcategory = $scope.searchDisplay.subcategory;
                $scope.resultProducts = $scope.searchDisplay.products;

                $scope.searchResult = $scope.resultStoreType.concat($scope.resultCategory.concat($scope.resultSubcategory.concat($scope.resultProducts)));

                if ($scope.resultProducts.length == 0 && $scope.resultSubcategory.length == 0 && $scope.resultCategory.length == 0 && $scope.resultStoreType.length == 0) {
                    googleAnalytics.addEvent('search_not_found', {
                        "event_label": $scope.searchRequest,
                        "event_category": googleAnalytics.eventCategories.catalog_actions
                    });
                }

            }, function errorCallback(response) {
                console.error("error");
            });
        }
        navigateSearchResult(evt, $scope.searchResult);
    }


    $scope.goToSearchedNode = function (subcategory, product_id) {
        sessionStorage.setSearchSubcategory(subcategory);
        if (product_id) {
            sessionStorage.setSearchProduct(product_id);
        }
    };

    function navigateSearchResult(evt, searchResult) {
        // TODO make arrow selected result node appear in the "input line"

        var el = document.querySelectorAll('.navigate-search');
        //Key down
        if (evt.keyCode == 40) {
            if ($scope.searchListNode == 0 && !$("#" + el[0].id).hasClass("highlighted-arrow")) {
                $("#" + el[0].id).addClass("highlighted-arrow");
            } else if ($scope.searchListNode == $scope.searchResult.length - 1) {
                $("#" + el[$scope.searchListNode].id).removeClass("highlighted-arrow");
                $scope.searchListNode = 0;
                $("#" + el[$scope.searchListNode].id).addClass("highlighted-arrow");
            } else {
                $("#" + el[$scope.searchListNode].id).removeClass("highlighted-arrow");
                $scope.searchListNode += 1;
                $("#" + el[$scope.searchListNode].id).addClass("highlighted-arrow");
            }
        }
        //event key "up"
        else if (evt.keyCode == 38) {
            if ($scope.searchListNode == 0) {
                $("#" + el[$scope.searchListNode].id).removeClass("highlighted-arrow");
                $scope.searchListNode = $scope.searchResult.length;
                $("#" + el[$scope.searchListNode - 1].id).addClass("highlighted-arrow");
                $scope.searchListNode -= 1;
            } else if ($scope.searchListNode == 1) {
                $("#" + el[$scope.searchListNode].id).removeClass("highlighted-arrow");
                $scope.searchListNode = 0;
                $("#" + el[$scope.searchListNode].id).addClass("highlighted-arrow");
            } else {
                $("#" + el[$scope.searchListNode].id).removeClass("highlighted-arrow");
                $scope.searchListNode -= 1;
                $("#" + el[$scope.searchListNode].id).addClass("highlighted-arrow");
            }
        }
        //event key "enter"
        else if (evt.keyCode == 13) {
            $("#" + el[$scope.searchListNode].id)[0].click();
        }
        //event key "esc"
        else if (evt.keyCode == 27) {
            $(".search-btn").click();
            $(".search-input").blur();
        }
    }

    /**
     * Following 2 functions perform "Close upon Click Oustide of Box" event
     */
    function clickedOffBox(e) {
        var el = document.getElementById($scope.id_1).attributes;
        if (el['aria-hidden'].value == "false") {
            if (event.target.id != $scope.id_1 && event.target.id != $scope.id_2 && event.target.id != $scope.id_3 && event.target.id != $scope.id_4) {
                document.getElementById($scope.id_1).setAttribute("aria-hidden", "true");
                window.removeEventListener('click', clickedOffBox, false);
                if ($scope.id_1 == "hdrHub" && $(".hub-btn").hasClass("hub-selected")) {
                    $(".hub-btn").removeClass("hub-selected");
                }
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
        if (id_1 == "hdrHub" && $(".hub-btn").hasClass("hub-selected")) {
            $(".hub-btn").removeClass("hub-selected");
        } else if (id_1 == "hdrHub" && !$(".hub-btn").hasClass("hub-selected")) {
            $(".hub-btn").addClass("hub-selected");
        }
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

    $scope.focusSearchInput = function () {
        if (!$scope.mobileSearchShow) {
            setTimeout(function () {
                //keybords shows up but cursor doesn't start inside input
                $("#global-search-input-mobile").focus();
            }, 1);
        } else {
            setTimeout(function () {
                $("#global-search-input-mobile").blur();
            }, 1);
        }
    };

    $scope.init();
});