app.controller("headerController", function ($scope, $window, $http, user, notification, $cookies, sessionStorage, localStorage, googleAnalytics, $timeout, $location, helpers) {
    $scope.init = function () {
        let locationUrl = $location.path().split("/");
        $scope.storeType = locationUrl[2];
        $scope.categories = [];
        $scope.isCouponSeen = true;
        $scope.user_names = "";
        $scope.user_coupons = [];
        $scope.showHdrBox = "";
        $scope.inputId = "header-search";
        $scope.showModal = false;
        $scope.showAccountBox = false;
        $scope.showHubBox = false;
        $scope.screenMob = global_screenIsMob;
        $scope.screenTablet = global_screenIsTablet;
        $scope.searchListNode = 0;
        $scope.mobMenuType = "1";
        $scope.mobMenuStoresClass = "selected-mob-menu-btn";
        $scope.mobMenuCatClass = "not-selected-mob-menu-btn";

        $scope.notificationClearedByUser = localStorage.getHeaderNotificationCleared();

        if (locationUrl.length >= 4) {
            $scope.userSelectCategoryName = locationUrl[3];
        }

        if (($scope.screenMob || $scope.screenTablet) && locationUrl[1] == "hub" && locationUrl[2] != "product") {
            $http({
                method: 'GET',
                url: "/api/hub/" + $scope.storeType
            }).then(function successCallback(response) {
                $scope.categories = response.data.categories;
            }, function errorCallback(response) {
            });
        } else{
            $scope.mobMenuStoresClass = "selected-mob-menu-btn width-100";
            $scope.mobMenuCatClass = "none";
        }

        $http({
            method: 'GET',
            url: "/api/hub/allstores"
        }).then(function successCallback(response) {
            $scope.hubStores = response.data.store_types;
        }, function errorCallback(response) {
            notification.addErrorMessage("Sorry. Something went wrong.");
        });

        user.user().then(function success(res) {
            if (res.data.success) {
                $scope.user_names = res.data.user.first_name + " " + res.data.user.last_name;
                $scope.user_coupons = res.data.user.coupons || [];

                let couponsSeen = localStorage.getNumberOfCouponsSeen();
                if (couponsSeen < $scope.user_coupons.length) {
                    $scope.isCouponSeen = false;
                }

            } else {
                $scope.user_names = "My Account";
            }
        }, function error(error) {
            notification.addErrorMessage("Couldn't retrieve user information. Please try again later");
        });

    };

    $scope.modal = function (logIn, action) {
        googleAnalytics.addEvent('modal_clicked', {
            "event_label": "modal_clicked",
            "event_category": googleAnalytics.eventCategories.header_actions
        });

        if ($scope.screenMob) {
            $window.location.href = $window.location.origin + "/accounts?action=" + action;
        } else {
            window.addEventListener('click', closeModalOnClick, false);
            $scope.showModal = true;
            $scope.showLogInModal = logIn;
        }
    };

    function closeModalOnClick(evt) {
        if (!$scope.showModal || (evt.target.className && (evt.target.className.includes("logIn-btn") || evt.target.className.includes("signUp-btn"))) || $(evt.target).parents(".modal-content").length) return;
        $scope.showModal = false;
        window.removeEventListener('click', closeModalOnClick, false);
        $scope.$apply();
    }

    $scope.logout = function () {
        user.logout()
            .then(function successCallback(response) {
                if (response.data.success) {
                    googleAnalytics.addEvent('logout', {
                        "event_label": "success",
                        "event_category": googleAnalytics.eventCategories.header_actions
                    });

                    //delete cookie
                    $cookies.remove("user");
                    $window.location.reload();
                } else {
                    googleAnalytics.addEvent('logout', {
                        "event_label": "failed",
                        "event_category": googleAnalytics.eventCategories.header_actions
                    });

                    // TODO: error handling
                    console.log("password not reset");
                    notification.addErrorMessage("Couldn't log out. Please try again");
                }
            }, function errorCallback(response) {
                notification.addErrorMessage("Couldn't log out. Please try again");
            });
    };

    $scope.hrefTo = function (path, num) {
        if (num) {
            sessionStorage.setAccountSection(num);
        }
        $window.location.href = $window.location.origin + path;
    };

    $scope.hrefToCat = function (category) {
        $window.location.href = $window.location.origin + "/hub/" + $scope.storeType + "/" + helpers.urlReplaceSpaceWithDash(category);
    };

    /**
     * Following 2 functions perform "Close upon Click Oustide of My Account Box" event
     */
    function clickedOffAccountBox(e) {
        if ((e.target.className && e.target.className.includes("myAccount-box")) || $(e.target).parents("#hdrMyAcc").length) return;
        window.removeEventListener('click', clickedOffAccountBox, false);
        $timeout(function () {
            $scope.showAccountBox = !$scope.showAccountBox;
        }, 0);
    }

    $scope.showAccountBoxFun = function () {
        if ($scope.showHubBox) $scope.showHubBoxFun();
        if ($scope.showAccountBox) {
            window.removeEventListener('click', clickedOffAccountBox, false);
        } else {
            setTimeout(function () {
                window.addEventListener('click', clickedOffAccountBox, false);
            }, 10);
        }
        $scope.showAccountBox = !$scope.showAccountBox;

        if(!$scope.isCouponSeen) {
            $timeout(function () {
                $scope.isCouponSeen = true;
                $(".coupon-num").addClass("coupon-num-seen");
                localStorage.setNumberOfCouponsSeen($scope.user_coupons.length);
            }, 200);
        }
        googleAnalytics.addEvent('account_box', {
            "event_label": "show = " + $scope.showAccountBox.toString(),
            "event_category": googleAnalytics.eventCategories.header_actions
        });
    };

    /**
    * Following 2 functions perform "Close upon Click Oustide of Hub Box" event
    */
    function clickedOffHubBox(e) {
        if ((e.target.className && e.target.className.includes("header-hub")) || $(e.target).parents("#hdrHub").length) return;
        window.removeEventListener('click', clickedOffHubBox, false);
        $timeout(function () {
            $scope.showHubBox = !$scope.showHubBox;
        }, 0);
    }

    $scope.showHubBoxFun = function () {
        if ($scope.showHubBox) {
            window.removeEventListener('click', clickedOffHubBox, false);
        } else {
            setTimeout(function () {
                window.addEventListener('click', clickedOffHubBox, false);
            }, 10);
        }
        $scope.showHubBox = !$scope.showHubBox;
        googleAnalytics.addEvent('hub_box', {
            "event_label": "show = " + $scope.showHubBox.toString(),
            "event_category": googleAnalytics.eventCategories.header_actions
        });
    };

    /**
     * Changes mobile burger content box from search to menu
     * @param {string (search or menu)} type 
     */
    $scope.changeMobMenu = function (type) {
        if (type == '1') {
            $scope.mobMenuStoresClass = "selected-mob-menu-btn";
            $scope.mobMenuCatClass = "not-selected-mob-menu-btn";
        } else if (type == '2') {
            $scope.mobMenuCatClass = "selected-mob-menu-btn";
            $scope.mobMenuStoresClass = "not-selected-mob-menu-btn";
        }
        $scope.mobMenuType = type;
        googleAnalytics.addEvent('change_mobile_menu', {
            "event_label": type,
            "event_category": googleAnalytics.eventCategories.header_actions
        });
    };

    /**
     * 1 - Stores, 2 - categories 
     * @param {string (1 or 2)} type 
     */
    $scope.showMobBoxFun = function (type) {
        $timeout(function () {
            if ($scope.showHdrBox == type || $scope.showHdrBox == "")
                $(".hdr-ext-content").toggleClass("grow-mob-ext-content");
            if ($scope.showHdrBox == type && $scope.showHdrBox != "") {
                $scope.showHdrBox = "";
            } else {
                $scope.showHdrBox = type;
            }

            googleAnalytics.addEvent('mob_box_fun', {
                "event_label": "show = " + $scope.showHdrBox.toString(),
                "event_category": googleAnalytics.eventCategories.header_actions
            });
        }, 0);
    };

    /**
     * Clears header notification
     */
    $scope.clearNotificationMessage = function () {
        $scope.notificationClearedByUser = true;
        localStorage.setHeaderNotificationCleared($scope.notificationClearedByUser);
        $("#cart-button").css("top", "0px");
    };

    /**
     * Used to href from Header Notification
     * @param {string} path 
     */
    $scope.hrefHdrNotification = function (path) {
        if (!path) return;
        $scope.hrefTo(path);
        $scope.clearNotificationMessage();
    };

    $scope.init();
});