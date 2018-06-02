/**
 * This directive is used to add global search input
 */
app.directive("globalSearch", function (localStorage, $interval, $timeout, $http, googleAnalytics, sessionStorage, $window) {

    /**
     * Search request matched in "Store name, Category or Subcategory" string - prepared for display
     */
    function prepareTreeSrch(searchedString, searchResult, type) {
        let tmpSearchResult = searchResult;
        let str = searchedString;
        if (tmpSearchResult.length > 0) {
            for (let i = 0; i < tmpSearchResult.length; i++) {
                let loc = tmpSearchResult[i][type].toLowerCase().indexOf(searchedString);
                if(loc == 0){
                    tmpSearchResult[i]["tree_end"] = tmpSearchResult[i][type].substring(str.length);
                    tmpSearchResult[i]["tree_matched"] = capitalizeStrg(str);
                } else{
                    tmpSearchResult[i]["tree_start"] = tmpSearchResult[i][type].substring(0, loc);
                    tmpSearchResult[i]["tree_matched"] = capitalizeStrg(str);
                    tmpSearchResult[i]["tree_end"] = tmpSearchResult[i][type].substring(loc + searchedString.length + 1);
                }
                
            }
        }
        return tmpSearchResult;
    }

    /**
     * Search request matched in "Brand and Name", start of string - prepared for display
     */
    function prepareStrtSrch(searchedString, searchResult) {
        let str = searchedString;
        let tmpSearchResult = searchResult;
        let brand_name_str;
        let brand_name_end;
        if (tmpSearchResult.length > 0) {
            for (let i = 0; i < tmpSearchResult.length; i++) {
                if (tmpSearchResult[i].brand.toLowerCase().includes(str.toLowerCase())) {
                    brand_name_str = "";
                    brand_name_end = tmpSearchResult[i].brand.substring(str.length) + " " + tmpSearchResult[i].name;
                } else if (tmpSearchResult[i].name.toLowerCase().includes(str.toLowerCase())) {
                    brand_name_str = tmpSearchResult[i].brand + " ";
                    brand_name_end = tmpSearchResult[i].name.substring(str.length);
                } else if ((tmpSearchResult[i].brand + " " + tmpSearchResult[i].name).toLowerCase().includes(str.toLowerCase())) {
                    brand_name_str = "";
                    brand_name_end = (tmpSearchResult[i].brand + " " + tmpSearchResult[i].name).substring(str.length);
                }
                tmpSearchResult[i]["brand_name_str"] = brand_name_str;
                tmpSearchResult[i]["brand_name_end"] = brand_name_end;
                tmpSearchResult[i]["brand_name_matched"] = capitalizeStrg(str);
            }
        }
        return tmpSearchResult;
    }

    /**
     * Search request matched in "Product Description" string - prepared for display
     */
    function prepareDescrSrch(searchedString, searchResult) {
        let tmpSearchResult = searchResult;
        if (tmpSearchResult.length > 0) {
            for (let i = 0; i < tmpSearchResult.length; i++) {
                let tmpString;
                let result_str;
                let result_end;
                tmpString = tmpSearchResult[i].description;
                let loc = tmpString.indexOf(searchedString);
                if (loc == 0) {
                    result_str = "";
                    result_end = tmpString.replace(searchedString, "");
                } else {
                    if (loc > 20) {
                        result_str = tmpString.substring((loc - 20), loc);
                        if (result_str.split(" ") > 0) {
                            result_str = result_str.replace(result_str.split(" ")[0], "") + "...";
                        }
                    } else {
                        result_str = tmpString.substring(0, loc);
                    }
                    if (tmpString.length > (loc + searchedString.length + 20)) {
                        result_end = tmpString.substring((loc + searchedString.length + 1), (loc + searchedString.length + 20));
                        if (result_end.split(" ") > 0) {
                            result_end = result_end.replace(result_end.split(" ")[result_end.split(" ").length - 1], "") + "...";
                        }
                    } else {
                        result_end = tmpString.substring(loc + searchedString.length + 1);
                    }
                }
                tmpSearchResult[i]["description_str"] = result_str;
                tmpSearchResult[i]["description_end"] = result_end;
                if (tmpSearchResult[i].description_key != "preview" || tmpSearchResult[i].description_key != "ingredients") {
                    tmpSearchResult[i]["description_matched"] = clearHomitTags(searchedString.charAt(0).toUpperCase() + searchedString.slice(1));
                } else {
                    tmpSearchResult[i]["description_matched"] = clearHomitTags(tmpSearchResult[i]["description_matched"].toLowerCase());
                }
            }
        }
        return tmpSearchResult;
    }

    /**
     * Search request matched in "Brand and Name", withing string - prepared for display
     */
    function prepareEndSrch(searchedString, searchResult) {
        let str = searchedString;
        let tmpSearchResult = searchResult;
        let loc;
        let brand_name;
        if (tmpSearchResult.length > 0) {
            for (let i = 0; i < tmpSearchResult.length; i++) {
                brand_name = tmpSearchResult[i].brand + " " + tmpSearchResult[i].name;
                loc = brand_name.toLowerCase().indexOf(str.toLowerCase());
                tmpSearchResult[i]["brand_name_str"] = brand_name.substring(0, loc);
                tmpSearchResult[i]["brand_name_end"] = brand_name.substring(loc + searchedString.length);
                tmpSearchResult[i]["brand_name_matched"] = brand_name.substring(loc, loc + searchedString.length);
            }
        }
        return tmpSearchResult;
    }

    /**
     * Helper Function - Capitalizes the string content 
     */
    function capitalizeStrg(string) {
        let tmpStrg = "";
        if (string.split(" ").length > 0) {
            for (let i = 0; i < string.split(" ").length; i++) {
                tmpStrg = tmpStrg + " " + string.split(" ")[i].charAt(0).toUpperCase() + string.split(" ")[i].slice(1);
            }
        } else {
            tmpStrg = string.charAt(0).toUpperCase() + string.slice(1);
        }
        return tmpStrg;
    }

    /**
     * Clears the string content from tags
     */
    function clearHomitTags(string) {
        if(!string) return;
        var homit_tags = {
            "d_ht_em": "</em>",
            "ht_em": "<em>",
            "d_ht_b": "</b>",
            "ht_b": "<b>",
            "d_ht_ul": "</ul>",
            "ht_ul": "<ul>",
            "d_ht_li": "</li>",
            "ht_li": "<li>"
        };
        var tmpString = string;
        for (let tag in homit_tags) {
            tmpString = tmpString.replace(new RegExp(tag, 'g'), "");
        }
        return tmpString;
    }

    /**
     * Prepares for Product Page href
     */
    function clearProductUrl(path) {
        var tempPath = path;
        tempPath = tempPath.replace(/[#&',.%/()]/g, "");
        tempPath = tempPath.replace(/[---]/g, "-");
        tempPath = tempPath.replace(/[--]/g, "-");
        return tempPath;
    }

    return {
        restrict: "E", // restrict to element
        scope: {
            inputId: "<inputId",
        },
        templateUrl: '/resources/templates/globalSearch.html',
        link: function (scope, element, attrs) {

            scope.searchListNode = 0;

            function addEvLisToSearch() {
                document.getElementById(scope.inputId).addEventListener('keyup', globalSearch, false);
                window.addEventListener('click', closeSearchOnClick, false);
            }
            
            setTimeout(() => {
                addEvLisToSearch();
            }, 2000);

            function globalSearch(evt) {
                if (scope.searchRequest && scope.searchRequest.length >= 3 && evt.keyCode != 40 && evt.keyCode != 38 && evt.keyCode != 13 && evt.keyCode != 27) {
                    $http({
                        method: 'POST',
                        url: "/api/catalog/search",
                        data: {
                            search: scope.searchRequest.toLowerCase()
                        }
                    }).then(function successCallback(response) {
                        scope.searchDisplay = response.data.result;
                        scope.resultStoreType = prepareTreeSrch(scope.searchRequest, scope.searchDisplay.store_type, "store_type_display_name");
                        scope.resultCategory = prepareTreeSrch(scope.searchRequest, scope.searchDisplay.category, "category_display_name");
                        scope.resultSubcategory = prepareTreeSrch(scope.searchRequest, scope.searchDisplay.subcategory, "subcategory");
                        scope.resultProducts_start = prepareStrtSrch(scope.searchRequest, scope.searchDisplay.products_start);
                        scope.resultProducts_descr = prepareDescrSrch(scope.searchRequest, scope.searchDisplay.products_descr);
                        scope.resultProducts_end = prepareEndSrch(scope.searchRequest, scope.searchDisplay.products_end);
        
                        scope.resultProducts = scope.resultProducts_start.concat(scope.resultProducts_descr.concat(scope.resultProducts_end));
                        scope.searchResult = scope.resultStoreType.concat(scope.resultCategory.concat(scope.resultSubcategory.concat(scope.resultProducts)));
        
                        if (scope.resultProducts.length == 0 && scope.resultSubcategory.length == 0 && scope.resultCategory.length == 0 && scope.resultStoreType.length == 0) {
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

            function closeSearchOnClick(evt){
                if (!evt || (evt.target.className && evt.target.className.includes("search-input")) || $(evt.target).parents("#search-sec").length) return;
                $(".search-btn").click();
            }

            function navigateSearchResult(evt, searchResult) {
                // TODO make arrow selected result node appear in the "input line"
        
                var el = document.querySelectorAll('.navigate-search');
                //Key down
                if (evt.keyCode == 40) {
                    if (scope.searchListNode == 0 && !$("#" + el[0].id).hasClass("highlighted-arrow")) {
                        $("#" + el[0].id).addClass("highlighted-arrow");
                    } else if (scope.searchListNode == scope.searchResult.length - 1) {
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
                        scope.searchListNode = scope.searchResult.length;
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
                    $("#" + el[scope.searchListNode].id)[0].click();
                }
                //event key "esc"
                else if (evt.keyCode == 27) {
                    $(".search-btn").click();
                    $(".search-input").blur();
                }
            }
            
            scope.goToSubcat = function (node) {
                sessionStorage.setSearchSubcategory(node.subcategory);
                $window.location.href = $window.location.origin + "/catalog/" + node.store_type_api_name + "/" + node.category;
            };

            scope.hrefToPrdPage = function (product) {
                var path;
                path = "/catalog/product/" + product.store_type_api_name + "/" + _.toLower(clearProductUrl(_.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-"))) + "/" + product.product_id;
        
                googleAnalytics.addEvent('product_clicked', {
                    "event_label": product.brand + " " + product.name,
                    "event_category": googleAnalytics.eventCategories.catalog_actions
                });
        
                $window.location.href = $window.location.origin + path;
            };

        }
    };
});