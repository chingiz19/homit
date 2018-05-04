app.controller("headerController", function ($scope, $window, $http, user, notification, $cookies, sessionStorage, googleAnalytics) {
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
                $scope.resultStoreType = prepareTreeSrch($scope.searchRequest, $scope.searchDisplay.store_type, "store_type_display_name");
                $scope.resultCategory = prepareTreeSrch($scope.searchRequest, $scope.searchDisplay.category, "category_display_name");
                $scope.resultSubcategory = prepareTreeSrch($scope.searchRequest, $scope.searchDisplay.subcategory, "subcategory");
                $scope.resultProducts_start = prepareStrtSrch($scope.searchRequest, $scope.searchDisplay.products_start);
                $scope.resultProducts_descr = prepareDescrSrch($scope.searchRequest, $scope.searchDisplay.products_descr);
                $scope.resultProducts_end = prepareEndSrch($scope.searchRequest, $scope.searchDisplay.products_end);

                $scope.resultProducts = $scope.resultProducts_start.concat($scope.resultProducts_descr.concat($scope.resultProducts_end));
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

    /**
     * Search request matched in "Store name, Category or Subcategory" string - prepared for display
     */
    function prepareTreeSrch(searchedString, searchResult, type) {
        let tmpSearchResult = searchResult;
        let str = searchedString;
        if (tmpSearchResult.length > 0) {
            for (let i = 0; i < tmpSearchResult.length; i++) {
                tmpSearchResult[i]["tree_end"] = tmpSearchResult[i][type].substring(str.length);
                tmpSearchResult[i]["tree_matched"] = capitalizeStrg(str);
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
                    tmpSearchResult[i]["description_matched"] = searchedString.charAt(0).toUpperCase() + searchedString.slice(1);
                } else {
                    tmpSearchResult[i]["description_matched"] = tmpSearchResult[i]["description_matched"].toLowerCase();
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

    /**
     * Clears the string content from tags
     */
    function clearHomitTags(string) {
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

    $scope.goToSubcat = function (node) {
        sessionStorage.setSearchSubcategory(node.subcategory);
        $window.location.href = $window.location.origin + "/catalog/" + node.store_type_api_name + "/" + node.category;
    };

    /**
     * Prepares for Product Page href
     */
    function clearProductUrl(path) {
        var tempPath = path;
        let characters = ["#", "&", "'", ",", ".", "%","/"];
        for (let i = 0; i < characters.length; i++) {
            tempPath = tempPath.replace(characters[i], "");
        }
        tempPath = tempPath.replace("---", "-");
        tempPath = tempPath.replace("--", "-");
        return tempPath;
    }

    /**
     * href's to product page
     */
    $scope.hrefToPrdPage = function (product) {
        var path;
        path = "/catalog/product/" + product.store_type_api_name + "/" + _.toLower(clearProductUrl(_.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-"))) + "/" + product.product_id;

        googleAnalytics.addEvent('product_clicked', {
            "event_label": product.brand + " " + product.name,
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });

        $window.location.href = $window.location.origin + path;
    };

    $scope.init();
});