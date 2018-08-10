app.controller("catalogController", function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $mdSidenav, $log, sessionStorage, notification, googleAnalytics, localStorage, helpers) {

    $scope.screenMob = global_screenIsMob;
    $scope.screenTablet = global_screenIsTablet;
    $scope.selection = $location.path();
    $scope.productUrl = '/api' + $scope.selection;
    try {
        $scope.storeType = $scope.selection.split("/")[2];
    } catch (e) {
        // oops
    }

    $scope.init = function () {

        $scope.categoryCoverImage = "";
        $scope.catBoxArrowClass = "";
        $scope.deliveryTime = "";
        $scope.filterBoxClass = "";
        $scope.filterBoxArrowClass = "";
        $scope.mobFilterContent = false;
        $scope.mobSortContent = false;
        $scope.mobFilterArrow = "";
        $scope.mobSortArrow = "";
        $scope.subcategories = [];
        $scope.selectedSubcats = [];
        $scope.storeinfo = {};
        $scope.scroll_top_current = 0;
        $scope.scroll_top_prev = 0;
        $scope.showCategories = false;
        $scope.selectedCategory = undefined;
        $scope.showCatBox = false;
        $scope.showFilterBox = false;
        $scope.showSortBox = false;
        $scope.sortBoxArrowClass = "";
        $scope.sortBoxClass = "";

        // Sorting
        $scope.sorting_options = {
            'Name (A-Z)': {
                'sorting_key': 'name',
                'descending': false
            },
            'Name (Z-A)': {
                'sorting_key': 'name',
                'descending': true
            },
            'Brand (A-Z)': {
                'sorting_key': 'brand',
                'descending': false
            },
            'Brand (Z-A)': {
                'sorting_key': 'brand',
                'descending': true
            },
            'Price: Low to High': {
                'sorting_key': 'price',
                'descending': false
            },
            'Price: High to Low': {
                'sorting_key': 'price',
                'descending': true
            }
        };

        let selectedSubcat = sessionStorage.getUserSelectedSubcategory();
        if (selectedSubcat) {
            $scope.selectedSubcats.push(sessionStorage.getUserSelectedSubcategory());
            sessionStorage.setUserSelectedSubcategory();
        }

        // Get initial list of products
        $http({
            method: 'GET',
            url: $scope.productUrl
        }).then(function successCallback(response) {
            if (response.data.success) {
                $scope.display_storeInfo = response.data.store_info;
                $scope.categories = helpers.buildCategoryUrl(response.data.categories, $scope.storeType);
                $scope.subcategories = response.data.subcategories;
                $scope.productsBySubcat = helpers.buildProductUrl(formatReceivedProducts(response.data.products));                 
                try {
                    let category_name = $scope.selection.split("/")[3];
                    for (let i = 0; i < $scope.categories.length; i++) {
                        if ($scope.categories[i].category_name == category_name) {
                            $scope.userSelectedCategory = $scope.categories[i].category_display_name;
                            $scope.categoryCoverImage = $scope.categories[i].category_cover;
                            break;
                        }
                    }
                } catch (e) {
                    // oops
                }

                for(tmp_key in $scope.productsBySubcat){
                    for(let x=0; x< $scope.productsBySubcat[tmp_key].length; x++){
                        $scope.productsBySubcat[tmp_key][x].variance[0]["preffered_unit_size"] =  helpers.unitConverter($scope.productsBySubcat[tmp_key][x].variance[0]);
                    }
                }

                $timeout(function () {
                    $(".catalog-store-cover").css({ "background-image": "url('/resources/images/catalog-stores/categories/covers/" + $scope.categoryCoverImage, "opacity": "1" });
                }, 500);
            }
        }, function errorCallback(response) {
            notification.addErrorMessage("Sorry. Something went wrong.");
        });

    };

    /**
     * Redirects to store page
     * @param {string} path 
     */
    $scope.hrefToStore = function (path) {
        $window.location.href = $window.location.origin + path;
    };

    /**
     * Extends CATEGORIES section
     */
    $scope.extendCatBox = function () {
        if (!$scope.showCatBox) {
            $scope.catBoxArrowClass = "icon-rot-1";
            $(".cat-ext-box").addClass("cat-ext-box-grow");
            $(".cat-ext-content").addClass("display-content");
            $window.addEventListener('click', closeCatBoxOnClick, false);
        } else {
            $scope.catBoxArrowClass = "icon-rot-2";
            $(".cat-ext-box").removeClass("cat-ext-box-grow");
            $(".cat-ext-content").removeClass("display-content");
            $window.removeEventListener('click', closeCatBoxOnClick, false);
        }
        $scope.showCatBox = !$scope.showCatBox;

        googleAnalytics.addEvent('categories_dropdown', {
            "event_label": "categories dropdown - open = " + $scope.showCatBox.toString(),
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });
    };

    function closeCatBoxOnClick(evt) {
        if (!$scope.showCatBox || $(evt.target).parents(".category-div").length || $(evt.target).parents(".category-extension-div").length || $(evt.target).hasClass("category-div")) return;
        $timeout(function () {
            $scope.extendCatBox();
        }, 0);
    }

    /**
     * Extends FILTER option box
     */
    $scope.extendFilterBox = function () {
        if (!$scope.showFilterBox) {
            $scope.showFilterBox = true;
            $scope.filterBoxArrowClass = "icon-rot-1";
            $scope.filterBoxClass = "fadeIn";
            $window.addEventListener('click', closeFilterBoxOnClick, false);
        } else {
            $scope.showFilterBox = false;
            $scope.filterBoxArrowClass = "icon-rot-2";
            $scope.filterBoxClass = "fadeOut";
            $window.removeEventListener('click', closeFilterBoxOnClick, false);
        }

        googleAnalytics.addEvent('filter_dropdown', {
            "event_label": "filter dropdown - open = " + $scope.showFilterBox.toString(),
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });
    };

    function closeFilterBoxOnClick(evt) {
        if (!$scope.showFilterBox || $(evt.target).parents(".filter-div").length || $(evt.target).parents(".cat-filter-extension").length || $(evt.target).hasClass("filter-div")) return;
        $timeout(function () {
            $scope.extendFilterBox();
        }, 0);
    }

    /**
     * Extends SORT option box
     */
    $scope.extendSortBox = function () {
        if (!$scope.showSortBox) {
            $scope.showSortBox = true;
            $scope.sortBoxArrowClass = "icon-rot-1";
            $scope.sortBoxClass = "fadeIn";
            $window.addEventListener('click', closeSortBoxOnClick, false);
        } else {
            $scope.showSortBox = false;
            $scope.sortBoxArrowClass = "icon-rot-2";
            $scope.sortBoxClass = "fadeOut";
            $window.removeEventListener('click', closeSortBoxOnClick, false);
        }

        googleAnalytics.addEvent('sort_dropdown', {
            "event_label": "sort dropdown - open = " + $scope.showSortBox.toString(),
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });
    };

    function closeSortBoxOnClick(evt) {
        if (!$scope.showSortBox || $(evt.target).parents(".sort-div").length || $(evt.target).parents(".cat-sort-extension").length || $(evt.target).hasClass("sort-div")) return;
        $timeout(function () {
            $scope.extendSortBox();
        }, 0);
    }

    $scope.selectSort = function (key) {
        $scope.sortBy = $scope.sorting_options[key];

        googleAnalytics.addEvent('sort_selected', {
            "event_label": key,
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });
    };

    /**
     * Extends mobile box for search and menu
     * @param {string} type 
     */
    $scope.showFilterOptions = function (type) {
        $timeout(function () {
            if (!$scope.mobFilterContent && !$scope.mobSortContent) {
                $scope.mobFilterSortClass = "mob-grow-filter-bar";
                $window.addEventListener('click', closeMobFilterSortBoxOnTouch, false);
            } else if ((type == "close" || type == "filter" && $scope.mobFilterContent) || (type == "sort" && $scope.mobSortContent)) {
                $scope.mobFilterContent = false;
                $scope.mobSortContent = false;
                $scope.mobFilterSortClass = "";
                $scope.mobFilterArrow = "";
                $scope.mobSortArrow = "";
                $window.removeEventListener('click', closeMobFilterSortBoxOnTouch, false);
                return;
            }
            if (type == "filter") {
                $scope.mobFilterArrow = "icon-rot-1";
                $scope.mobSortArrow = "";
                $scope.mobSortContent = false;
                $scope.mobFilterContent = true;
            } else if (type == "sort") {
                $scope.mobSortArrow = "icon-rot-1";
                $scope.mobFilterArrow = "";
                $scope.mobFilterContent = false;
                $scope.mobSortContent = true;
            }

            googleAnalytics.addEvent('mobile_filter_sort box', {
                "event_label": type,
                "event_category": googleAnalytics.eventCategories.catalog_actions
            });

        }, 0);
    };

    function closeMobFilterSortBoxOnTouch(evt) {
        if ($(evt.target).parents(".mob-filter-sort").length || $(evt.target).hasClass("mob-fs-hdr")) return;
        $timeout(function () {
            $scope.showFilterOptions('close');
        }, 0);
    }

    function formatReceivedProducts(raw) {
        let localObject = {};
        if (raw && raw.length) {
            for (let i = 0; i < raw.length; i++) {
                let item = raw[i];
                localObject[item._id] = item.products;
            }
        }
        return localObject;
    }

    /**
     * 
     * Used to display filtered Subategories
     * @param {array} list 
     */
    $scope.filterProductsBySubcat = function (list) {
        var filtered_list = {};
        if (!list.length) {
            filtered_list = $scope.productsBySubcat;
            return filtered_list;
        }
        for (let i = 0; i < $scope.subcategories.length; i++) {
            for (let j = 0; j < $scope.selectedSubcats.length; j++) {
                if ($scope.subcategories[i] == $scope.selectedSubcats[j]) {
                    filtered_list[$scope.subcategories[i]] = $scope.productsBySubcat[$scope.subcategories[i]];
                    break;
                }
            }
        }
        return filtered_list;
    };

    /**
     * 
     * Used to add selected Subcategory to list
     * @param {string} subcat 
     * @param {array} list 
     */
    $scope.selectSubcat = function (subcat, list) {
        let idx = list.indexOf(subcat);
        if (idx > -1) {
            list.splice(idx, 1);
        }
        else {
            list.push(subcat);
        }
        googleAnalytics.addEvent('subcategory_selected', {
            "event_label": subcat,
            "event_category": googleAnalytics.eventCategories.catalog_actions
        });
    };

    /**
     * 
     * Used to check if Subcategory selected
     * @param {string} subcat 
     * @param {array} list 
     */
    $scope.subcatSelected = function (subcat, list) {
        return list.indexOf(subcat) > -1;
    };

    /**
     * Used to deselect all Subcategories
     */
    $scope.deselectAllSubcats = function () {
        $timeout(function () {
            $scope.selectedSubcats = [];
            googleAnalytics.addEvent('deselected_all_subcats', {
                "event_label": "Cleared subcats in filter dialog",
                "event_category": googleAnalytics.eventCategories.catalog_actions
            });
        }, 0);
    };

    /**
     * Checks if "Select All" is selected
     */
    $scope.isAllSubcatSelected = function () {
        return $scope.selectedSubcats.length === $scope.subcategories.length;
    };

    $(window).on('scroll', function () {
        var scrollTop = $(window).scrollTop();
        $scope.scroll_top_prev = $scope.scroll_top_current;
        $scope.scroll_top_current = scrollTop;

        if ($scope.scroll_top_current >= 300 && !$scope.screenMob && !$scope.screenTablet) {
            $(".catalog-sub-hdr").addClass("catalog-sub-hdr-fixed");
            $(".catalog-content").addClass("sub-hdr-catalog-cnt");
        } else {
            $(".catalog-sub-hdr").removeClass("catalog-sub-hdr-fixed");
            $(".catalog-content").removeClass("sub-hdr-catalog-cnt");
        }
        $timeout(function () {
            if ($scope.screenMob || $scope.screenTablet) {
                if ($(".mob-filter-sort").hasClass("mob-grow-filter-bar")) $scope.showFilterOptions();
                if ($scope.scroll_top_prev > $scope.scroll_top_current || $scope.scroll_top_current <= 10) {
                    $(".mob-filter-sort").removeClass("mob-hide-filter-bar");
                } else if ($scope.scroll_top_prev < $scope.scroll_top_current) {
                    $(".mob-filter-sort").addClass("mob-hide-filter-bar");
                }
            }
        }, 0);
    });

    $scope.init();

});

