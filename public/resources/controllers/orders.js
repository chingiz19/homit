app.filter('totalPrice', function () {
    return function (input) {
        var totalPrice = 0;
        input.forEach(function (cart_item) {
            var price = cart_item["price"];
            var quantity = parseInt(cart_item["quantity"]);
            totalPrice += (price * quantity);
        });
        return totalPrice;
    };
});

app.controller("adminController", ["$location", "$scope", "$cookies", "$http", "$rootScope", "$window", "mapServices",
    function ($location, $scope, $cookies, $http, $rootScope, $window, mapServices, ) {

        $scope.disRoomMap;
        $scope.searchCriteria;
        $scope.searCriteriaIndex;
        $scope.foundUsers = [];
        $scope.foundOrders = [];
        $scope.foundOrderContent = [];
        $scope.searchBy;
        $scope.isSearchLisenerOn = false;


        $scope.callSearch = function () {
            $scope.searchCriteria = "";
            $scope.foundUsers = [];
            $scope.foundOrders = [];
            $scope.foundOrderContent = [];
            var searchRequestElement = document.getElementById("csr_Search");
            if (!$scope.isSearchLisenerOn) {
                searchRequestElement.addEventListener('keyup', checkIfEnter, false);
                $scope.isSearchLisenerOn = true;
            }
            function checkIfEnter(evt) {
                if (evt.keyCode == 13) {
                    $scope.searchUserHistory($scope.searchBy);
                }
            }
        }

        $scope.searchUserHistory = function (searchBy) {
            $scope.searCriteriaIndex = searchBy;
            if ($scope.searCriteriaIndex == 1) {
                $http({
                    method: 'POST',
                    url: "/api/orders/findusersbyemail",
                    data: {
                        user_email: $scope.searchCriteria
                    }
                }).then(function successCallback(response) {
                    $scope.foundUsers = response.data.users;
                }, function errorCallback(response) {
                    Logger.error("error");
                });
            }
            else if ($scope.searCriteriaIndex == 2) {
                $http({
                    method: 'POST',
                    url: "/api/orders/findusersbyphone",
                    data: {
                        phone_number: $scope.searchCriteria
                    }
                }).then(function successCallback(response) {
                    $scope.foundUsers = response.data.users;
                }, function errorCallback(response) {
                    Logger.error("error");
                });
            }
            else if ($scope.searCriteriaIndex == 3) {
                $http({
                    method: 'POST',
                    url: "/api/orders/getorder",
                    data: {
                        order_id: $scope.searchCriteria
                    }
                }).then(function successCallback(response) {

                    $scope.foundUsers.push(response.data.user);
                    setTimeout(() => {
                        document.getElementById("usrRbtn").click();
                        setTimeout(() => {
                            document.getElementById($scope.searchCriteria).click();
                        }, 10);
                    }, 10);

                }, function errorCallback(response) {
                    Logger.error("error");
                });
            }
        }
        $scope.selectedUserID = function (user) {
            $scope.foundOrderContent = [];
            var guestId;
            var userId;
            if (user.is_guest) {
                guestId = user.id;
            } else {
                userId = user.id;
            }
            $http({
                method: 'POST',
                url: "/api/orders/vieworders",
                data: {
                    user_id: userId,
                    guest_id: guestId
                }
            }).then(function successCallback(response) {
                $scope.foundOrders = response.data.orders;
                for (tmp in $scope.foundOrders) {
                    $scope.foundOrders[tmp]["date_placed"] = $scope.mm_dd_yyyy($scope.foundOrders[tmp]["date_placed"]);
                }
            }, function errorCallback(response) {
                Logger.error("error");
            });
        }
        $scope.selectedOrderId = function (order) {
            $http({
                method: 'POST',
                url: "/api/orders/getorder",
                data: {
                    order_id: order.order_id
                }
            }).then(function successCallback(response) {
                $scope.foundOrderContent = response.data.orders;
            }, function errorCallback(response) {
                Logger.error("error");
            });
        }

        $scope.logoutBtn = function () {
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
                    Logger.log("password not reset");
                }
            }, function errorCallback(response) {
                $rootScope.$broadcast("addNotification", { type: "alert-danger", message: response.data["ui_message"] });
                Logger.log("ERROR in password reset");
            });
        };

        $scope.page = 2;
        $scope.pageName = "Dispatch Room";
        $scope.disRoomMap = undefined;
        $scope.adlSearch;
        $scope.polSearch;
        $scope.reqeustType;
        $scope.isOrderDelivered;
        $scope.POL_search;
        $scope.selectAllOrdersChecked = false;
        $scope.POL_radioGroup;

        $scope.toPage = function (num) {
            document.getElementById("pg_" + $scope.page).classList.remove("pageDocSlctBtn");
            document.getElementById("pg_" + num).classList.add("pageDocSlctBtn");
            if (num == 1) {
                $scope.pageName = "Order History";
                $scope.page = 1;
            }
            if (num == 2) {
                $scope.pageName = "Dispatch Room";
                $scope.page = 2;
                if (!$scope.disRoomMap) {
                    $scope.disRoomMap = mapServices.createMap("drMap");
                }
            }
            if (num == 3) {
                $scope.pageName = "Request Center";
                $scope.page = 3;
            }
        }

        function getListActiveDriverCustomer() {
            $scope.online_driverList = [];
            $scope.customer_pendingList = [];
            $scope.ADL_POL_markers = [];
            // $http({
            //     method: 'GET',
            //     url: "/api/driver/onlinedrivers",

            // }).then(function successCallback(response) {
            //     $scope.online_driverList = response.data.drivers;
            // }, function errorCallback(response) {
            //     console.error("error");
            // });

            $http({
                method: 'GET',
                url: "/api/orders/pendingorders",

            }).then(function successCallback(response) {
                $scope.customer_pendingList = response.data.orders;
                for (order in $scope.customer_pendingList) {
                    var order_marker = {};
                    $scope.customer_pendingList[order]['WT'] = Math.round(Math.abs((new Date() - new Date($scope.customer_pendingList[order]['date_placed'])) / (1000 * 60)));
                    var lat_lng = $scope.customer_pendingList[order]['delivery_address'].split("/");
                    $scope.customer_pendingList[order]['lat'] = parseFloat(lat_lng[1]);
                    $scope.customer_pendingList[order]['lng'] = parseFloat(lat_lng[2]);

                    $scope.ADL_POL_markers.push(buildMarker($scope.customer_pendingList[order]['user_id_prefix'], $scope.customer_pendingList[order]['order_id'], $scope.customer_pendingList[order]['user_id_prefix'], $scope.customer_pendingList[order]['first_name'], $scope.customer_pendingList[order]['last_name'], $scope.customer_pendingList[order]['user_phone_number'], $scope.customer_pendingList[order]['user_email'], $scope.customer_pendingList[order]['WT'], $scope.customer_pendingList[order]['lat'], $scope.customer_pendingList[order]['lng']));
                }
                mapServices.addMarkerToMap($scope.ADL_POL_markers, $scope.disRoomMap);
            }, function errorCallback(response) {
                console.error("error");
            });
        }

        $scope.showOrder = function (order) {
            var order_marker = [];
                order_marker.push(buildMarker(order['user_id_prefix'], order['order_id'], order['user_id_prefix'], order['first_name'], order['last_name'], order['user_phone_number'], order['user_email'], order['WT'], order['lat'], order['lng']));
                clearInterval(setInterval_ADL_POL);
            mapServices.addMarkerToMap(order_marker, $scope.disRoomMap);
        }

        $scope.selectAllOrders = function (customer_pendingList) {
            var order_markers = [];
            if (!$scope.selectAllOrdersChecked) {
                var marker = {};
                for (var i = 0; i < customer_pendingList.length; i++) {
                    marker = buildMarker(customer_pendingList[i]['user_id_prefix'], customer_pendingList[i]['order_id'], customer_pendingList[i]['user_id_prefix'], customer_pendingList[i]['first_name'], customer_pendingList[i]['last_name'], customer_pendingList[i]['user_phone_number'], customer_pendingList[i]['user_email'], customer_pendingList[i]['WT'], customer_pendingList[i]['lat'], customer_pendingList[i]['lng']);
                    order_markers.push(marker);
                }
                $scope.selectAllOrdersChecked = true;
                $scope.POL_radioGroup = "";
                clearInterval(setInterval_ADL_POL);
            } else{
                var order_markers = [];
                $scope.selectAllOrdersChecked = false;
                setInterval_ADL_POL = setInterval(getListActiveDriverCustomer, 15000);
            }
            mapServices.addMarkerToMap(order_markers, $scope.disRoomMap);
        }

        var setInterval_ADL_POL = setInterval(getListActiveDriverCustomer, 15000);
        
        /**
         * Generates marker format for google maps
         * @param {string} type - "customer" or "driver"
         * @param {double} order_id
         * @param {string} id_prefix - "g_ or u_ or d_"
         * @param {string} first_name
         * @param {string} last_name
         * @param {string} phone_number
         * @param {string} email
         * @param {double} WT - Waiting Time
         * @param {double} lat - latitude
         * @param {double} lng - longitude
         */
        function buildMarker(type, order_id, id_prefix, first_name, last_name, phone_number, email, WT, lat, lng) {
            var order_marker = {};
            order_marker['type'] = type;
            order_marker['order_id'] = order_id;
            order_marker['id_prefix'] = id_prefix;
            order_marker['first_name'] = first_name;
            order_marker['last_name'] = last_name;
            order_marker['phone_number'] = phone_number;
            order_marker['email'] = email;
            order_marker['WT'] = WT;
            order_marker['latLng'] = {
                lat: lat,
                lng: lng
            };
            return order_marker;
        }
        
        $scope.mm_dd_yyyy = function (inDate) {
            return parseInt(inDate.slice(5, 7), 10) + "/" + parseInt(inDate.slice(8, 10), 10) + "/" + parseInt(inDate.slice(0, 4), 10);
        }

        $scope.init = function () {
            $scope.toPage($scope.page);
            getListActiveDriverCustomer();
        };
        $(document).ready(function () {
            $scope.init();
        });

    }]);