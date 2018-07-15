app.controller("storePageController", function ($scope, $location, $http, $window, helpers, $timeout, sessionStorage, googleAnalytics, localStorage, notification, user) {

    $scope.init = function () {
        $scope.bannerDot = 1;
        $scope.bannerPosition = 0;
        $scope.windowWidth = $window.innerWidth;

        $scope.storePage = {};
        $scope.storeCoupons = [];
        $scope.categories = [];
        $scope.storeName = $location.path().split("/")[2];

        $http({
            method: 'GET',
            url: "/api/hub/" + $scope.storeName
        }).then(function successCallback(response) {
            let userUsedCoupons = {};
            if (_.isEmpty(response.data.applied_coupons)) {
                userUsedCoupons = localStorage.getUserCoupons();
            } else {
                userUsedCoupons = response.data.applied_coupons;
            }
            $scope.storePage = response.data;
            $scope.categories = helpers.buildCategoryUrl(response.data.categories, $scope.storeName);
            $scope.storeCoupons = helpers.formatCoupons(response.data.store_coupons, userUsedCoupons);
        }, function errorCallback(response) {
            notification.addErrorMessage("Ups.. Error loading page");
        });
    };

    /**
     * Used to slide to the previous banner
     */
    $scope.previousBanner = function () {
        let element = $(".sp-banners-images");
        if ($scope.bannerPosition != 0) $scope.bannerPosition = $scope.bannerPosition - $(".sp-banners-images").width() / 5;
        if ($scope.bannerPosition == 0) {
            $scope.bannerDot = 3;
            setTimeout(() => {
                $scope.bannerPosition = element.width() * 0.6;
                element.css({ "left": "-" + $scope.bannerPosition / ($(".sp-banners-images").width() / 5) * 100 + "%", "transition": "left 0s ease" });
            }, 600);
        } else {
            $scope.bannerDot = $scope.bannerDot - 1;
        }
        element.css({ "left": "-" + $scope.bannerPosition / ($(".sp-banners-images").width() / 5) * 100 + "%", "transition": "left 0.8s ease" });
    };

    /**
     * Used to slide to the next banner
     */
    $scope.nextBanner = function () {
        let element = $(".sp-banners-images");
        if ($scope.bannerPosition == 0) $scope.bannerPosition = $scope.bannerPosition + $(".sp-banners-images").width() / 5;
        $scope.bannerPosition = $scope.bannerPosition + $(".sp-banners-images").width() / 5;
        if ($scope.bannerPosition == element.width() * 0.8) {
            $scope.bannerDot = 1;
            setTimeout(() => {
                $scope.bannerPosition = element.width() / 5;
                element.css({ "left": "-" + $scope.bannerPosition / ($(".sp-banners-images").width() / 5) * 100 + "%", "transition": "left 0s ease" });
            }, 600);
        } else {
            $scope.bannerDot = $scope.bannerDot + 1;
        }
        element.css({ "left": "-" + $scope.bannerPosition / ($(".sp-banners-images").width() / 5) * 100 + "%", "transition": "left 0.5s ease" });
    };

    /**
     * Used to slide to the banner upon click
     */
    $scope.selectBanner = function (selected) {
        if (selected == $scope.bannerDot) return;
        let element = $(".sp-banners-images");
        $scope.bannerPosition = element.width() / 5 * selected;
        element.css({ "left": "-" + $scope.bannerPosition / ($(".sp-banners-images").width() / 5) * 100 + "%", "transition": "left 0.5s ease" });
        $scope.bannerDot = selected;
    };

    /**
     * Used as a decision point to href based on Banners content
     * @param {object} product 
     * @param {string} subcategory 
     * @param {string} category 
     */
    $scope.hrefBanner = function (product, subcategory, category) {
        let label = "";
        if (product){
            label = product.name + " " + product.brand; 
        } else {
            label = category;
            if (subcategory){
                label += " (" + subcategory + ")";
            }
        }
        googleAnalytics.addEvent('banner_clicked', {
            "event_label": label,
            "event_category": googleAnalytics.eventCategories.store_page_actions
        });
        if (product) {
            $scope.hrefPrdPage(product);
        } else if (subcategory || category) {
            $scope.hrefToCatSubcat(subcategory, category);
        }
    };

    /**
     * Redirects to catalog with necessary category and filtered to subcategory, or just category
     * @param {string} category 
     * @param {string} subcategory
     */
    $scope.hrefToCatSubcat = function (subcategory, category) {
        if (subcategory) {
            sessionStorage.setUserSelectedSubcategory(subcategory);
        }
        googleAnalytics.addEvent('category_clicked', {
            "event_label": category + "(" + subcategory + ")",
            "event_category": googleAnalytics.eventCategories.store_page_actions
        });
        $window.location.href = $window.location.origin + "/hub/" + $scope.storeName + "/" + helpers.urlReplaceSpaceWithDash(category);
    };

    /**
     * Redirects to product page
     * @param {string} product 
     */
    $scope.hrefPrdPage = function (product) {
        googleAnalytics.addEvent('product_clicked', {
            "event_label": product.brand + " " + product.name,
            "event_category": googleAnalytics.eventCategories.store_page_actions
        });
        $window.location.href = $window.location.origin + helpers.buildProductPagePath(product);
    };

    /**
     * 
     * @param {string} code 
     * @param {integer} index 
     * @param {string} assigned_by 
     * @param {boolean} userLoggedIn 
     */
    $scope.updateCoupon = function (code, index, assigned_by, userLoggedIn) {
        if (userLoggedIn) {
            let requestObject = {};
            requestObject[code] = !$scope.storeCoupons[index].applied;
            user.updateUserCoupons(requestObject).then(function (response) {
                if (response.data.success) {
                    notification.addSuccessMessage(response.data.ui_message);
                    $timeout(function () {
                        $scope.storeCoupons[index].applied = !$scope.storeCoupons[index].applied;
                    }, 0);
                } else {
                    notification.addErrorMessage(response.data.ui_message);
                }

            }, function (error) {
                notification.addErrorMessage("Sorry, couldn't apply coupon");
            });
        } else {
            let usedCoupons = localStorage.getUserCoupons();
            if (usedCoupons.hasOwnProperty(assigned_by) && usedCoupons[assigned_by] != code) {
                notification.addErrorMessage("1 coupon per store can be applied only.");
                return;
            }
            if (!$scope.storeCoupons[index].applied) {
                usedCoupons[assigned_by] = code;
                notification.addSuccessMessage("Applied! Will be used at checkout");
            } else {
                delete usedCoupons[assigned_by];
                notification.addSuccessMessage("Successfully Removed!");
            }
            localStorage.setUserCoupons(usedCoupons);
            $timeout(function () {
                $scope.storeCoupons[index].applied = !$scope.storeCoupons[index].applied;
            }, 0);
        }
    };

    $window.onload = function () {
        AOS.init();
        setInterval(function () {
            let windowWidthCurrent = $window.innerWidth;
            if ($scope.windowWidth != windowWidthCurrent) {
                $scope.windowWidth = windowWidthCurrent;
                return;
            }
            $timeout(function () {
                $scope.nextBanner();
            }, 0);
            $scope.windowWidth = windowWidthCurrent;
        }, 5000);
    };

    $scope.init();
});