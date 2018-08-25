/**
 * This directive is used to add global search input
 */
app.directive("searchAutocomplete", function (localStorage, $interval, $timeout, $http, googleAnalytics, sessionStorage, $window, helpers) {

    return {
        restrict: "E", // restrict to element
        scope: {
        },
        templateUrl: '/resources/templates/searchAutocomplete.html',
        link: function (scope, element, attrs) {

            scope.searchListNode = 0;

            function addEvLisToSearch() {
                document.getElementById("global-search-input").addEventListener('keyup', autocomplete, false);
                window.addEventListener('click', closeSearchOnClick, false);
            }

            $timeout(function () {
                addEvLisToSearch();
            }, 0);

            function autocomplete(evt) {
                if (scope.searchRequest && scope.searchRequest.length >= 3 && evt.keyCode != 40 && evt.keyCode != 38 && evt.keyCode != 13 && evt.keyCode != 27) {
                    $http({
                        method: 'POST',
                        url: "/api/hub/autocomplete",
                        data: {
                            search: scope.searchRequest.toLowerCase()
                        }
                    }).then(function successCallback(response) {
                        scope.noAutocompleteFound = false;
                        scope.resultStores = response.data.result.store_type;
                        scope.resultProducts = response.data.result.products;
                        scope.searchResult = scope.resultStores.concat(scope.resultProducts);

                        if (scope.resultProducts.length == 0 && scope.resultStores.length == 0) {
                            scope.noAutocompleteFound = true;
                            googleAnalytics.addEvent('search_not_found', {
                                "event_label": scope.searchRequest,
                                "event_category": googleAnalytics.eventCategories.catalog_actions
                            });
                        }

                    }, function errorCallback(response) {
                    });
                }
                navigateSearchResult(evt, scope.searchResult);
            }

            function closeSearchOnClick(evt) {
                if (evt.target.className && evt.target.className.includes("search-input") || $(evt.target).parents("#search-sec").length) return;
                clearSearch();
            }

            function clearSearch(){
                $timeout(function () {
                    scope.resultStores = "";
                    scope.resultProducts = "";
                    scope.noAutocompleteFound = false;
                }, 0);
                $timeout(function () {
                    scope.searchRequest = "";
                }, 200);
            }

            function navigateSearchResult(evt, searchResult) {
                var el = document.querySelectorAll('.navigate-search');
                //Key down
                if (evt.keyCode == 40) {
                    if (scope.searchListNode == 0 && !$("#" + el[0].id).hasClass("highlighted-arrow")) {
                        $("#" + el[0].id).addClass("highlighted-arrow");
                    } else if (scope.searchListNode == searchResult.length - 1) {
                        $("#" + el[scope.searchListNode].id).removeClass("highlighted-arrow");
                        scope.searchListNode = 0;
                        $("#" + el[scope.searchListNode].id).addClass("highlighted-arrow");
                    } else {
                        $("#" + el[scope.searchListNode].id).removeClass("highlighted-arrow");
                        scope.searchListNode += 1;
                        $("#" + el[scope.searchListNode].id).addClass("highlighted-arrow");
                    }
                }
                //event key "up"
                else if (evt.keyCode == 38) {
                    if (scope.searchListNode == 0) {
                        $("#" + el[scope.searchListNode].id).removeClass("highlighted-arrow");
                        scope.searchListNode = searchResult.length;
                        $("#" + el[scope.searchListNode - 1].id).addClass("highlighted-arrow");
                        scope.searchListNode -= 1;
                    } else if (scope.searchListNode == 1) {
                        $("#" + el[scope.searchListNode].id).removeClass("highlighted-arrow");
                        scope.searchListNode = 0;
                        $("#" + el[scope.searchListNode].id).addClass("highlighted-arrow");
                    } else {
                        $("#" + el[scope.searchListNode].id).removeClass("highlighted-arrow");
                        scope.searchListNode -= 1;
                        $("#" + el[scope.searchListNode].id).addClass("highlighted-arrow");
                    }
                }
                //event key "enter"
                else if (evt.keyCode == 13) {
                    if(scope.searchListNode == 0){
                        scope.startSearch(scope.searchRequest);
                    }else{
                        $("#" + el[scope.searchListNode].id)[0].click();
                    }
                }
                //event key "esc"
                else if (evt.keyCode == 27) {
                    $(".search-input").blur();
                    clearSearch();
                }
            }

            scope.startSearch = function(search_text){
                if(!search_text) return;
                $window.location.href = $window.location.origin + "/search/" + search_text;
            };

            scope.hrefToPrdPage = function (product) {
                googleAnalytics.addEvent('product_clicked', {
                    "event_label": product.brand + " " + product.name + "; Catalog",
                    "event_category": googleAnalytics.eventCategories.catalog_actions
                });
                $window.location.href = $window.location.origin + helpers.buildProductPagePath(product, product.store_name);
            };
        }
    };
});