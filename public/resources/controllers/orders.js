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
        $scope.driverRouteNodes = [];
        $scope.routeNodesMarkers = [];

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
            $scope.foundUsers = [];
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
                    $scope.foundOrders[tmp]["date_placed"] = mm_dd_yyyy($scope.foundOrders[tmp]["date_placed"]);
                    if (new Date($scope.foundOrders[tmp]['date_assigned']) > 0) {
                        $scope.foundOrders[tmp]['dispatched'] = true;
                    } else {
                        $scope.foundOrders[tmp]['dispatched'] = false;
                    }
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
        $scope.reqeustType;
        $scope.isOrderDelivered;
        $scope.POL_search;
        $scope.POL_radioGroup;
        $scope.ADL_radioGroup;

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
            $http({
                method: 'GET',
                url: "/api/driver/onlinedrivers",
            }).then(function successCallback(response) {
                $scope.online_driverList = response.data.drivers;
                for (driver in $scope.online_driverList) {
                    var order_marker = {};
                    $scope.online_driverList[driver]['on_shift'] = Math.round(Math.abs((new Date() - new Date($scope.online_driverList[driver]['shift_start'])) / (1000 * 60)));
                    $scope.ADL_POL_markers.push(buildMarker("driver", $scope.online_driverList[driver]['driver_id'], $scope.online_driverList[driver]['driver_id_prefix'], $scope.online_driverList[driver]['first_name'], $scope.online_driverList[driver]['last_name'], $scope.online_driverList[driver]['phone_number'], $scope.online_driverList[driver]['email'], $scope.online_driverList[driver]['on_shift'], $scope.online_driverList[driver]['latitude'], $scope.online_driverList[driver]['longitude']));
                }
            }, function errorCallback(response) {
                console.error("error");
            });

            $http({
                method: 'GET',
                url: "/api/orders/pendingorders",

            }).then(function successCallback(response) {
                $scope.customer_pendingList = response.data.orders;
                for (order in $scope.customer_pendingList) {
                    var order_marker = {};
                    if (new Date($scope.customer_pendingList[order]['date_assigned']) > 0) {
                        $scope.customer_pendingList[order]['dispatched'] = true;
                    } else {
                        $scope.customer_pendingList[order]['dispatched'] = false;
                    }
                    $scope.customer_pendingList[order]['WT'] = Math.round(Math.abs((new Date() - new Date($scope.customer_pendingList[order]['date_placed'])) / (1000 * 60)));
                    $scope.ADL_POL_markers.push(buildMarker("customer", $scope.customer_pendingList[order]['order_id'], $scope.customer_pendingList[order]['user_id_prefix'], $scope.customer_pendingList[order]['first_name'], $scope.customer_pendingList[order]['last_name'], $scope.customer_pendingList[order]['user_phone_number'], $scope.customer_pendingList[order]['user_email'], $scope.customer_pendingList[order]['WT'], $scope.customer_pendingList[order]['delivery_latitude'], $scope.customer_pendingList[order]['delivery_longitude']));
                }
                mapServices.addMarkerToMap($scope.ADL_POL_markers, $scope.disRoomMap);
            }, function errorCallback(response) {
                console.error("error");
            });
        }

        $scope.showDriverRoute = function (driver) {
            clearInterval($scope.setInterval_ADL_POL);
            clearSelection();
            $http({
                method: 'POST',
                url: "/api/driver/getroutes",
                data: {
                    driver_id: driver['driver_id']
                }
            }).then(function successCallback(response) {
                $scope.driverRouteNodes = response.data.routes;
                $scope.routeNodesMarkers.push(buildMarker("driver", driver['driver_id'], driver['driver_id_prefix'], driver['first_name'], driver['last_name'], driver['phone_number'], driver['email'], driver['on_shift'], driver['latitude'], driver['longitude']));
                for (node in $scope.driverRouteNodes) {
                    $scope.routeNodesMarkers.push(buildMarker($scope.driverRouteNodes[node]['node_type'], $scope.driverRouteNodes[node]['node_id'], $scope.driverRouteNodes[node]['node_id_prefix'], "first_name", "last_name", "phone_number", "email", "time", $scope.driverRouteNodes[node]['node_latitude'], $scope.driverRouteNodes[node]['node_longitude']));
                }
                mapServices.addPolylineToMap($scope.routeNodesMarkers, $scope.disRoomMap);
            }, function errorCallback(response) {
                console.error("error");
            });
        }

        $scope.showOrder = function (order) {
            clearSelection();
            clearInterval($scope.setInterval_ADL_POL);
            var order_marker = [];
            order_marker.push(buildMarker("customer", order['order_id'], order['user_id_prefix'], order['first_name'], order['last_name'], order['user_phone_number'], order['user_email'], order['WT'], order['delivery_latitude'], order['delivery_longitude']));
            mapServices.addMarkerToMap(order_marker, $scope.disRoomMap);
        }

        $scope.selectAll = function (type, list) {
            var markers = [];
            if (!$scope.POL_SelectAll && type == 'order' || !$scope.ADL_SelectAll && type == 'driver') {
                clearSelection();
                var marker = {};
                for (var i = 0; i < list.length; i++) {
                    if (list[i]['driver_id_prefix'] == "d_") {
                        marker = buildMarker("driver", list[i]['driver_id'], list[i]['driver_id_prefix'], list[i]['first_name'], list[i]['last_name'], list[i]['phone_number'], list[i]['email'], list[i]['on_shift'], list[i]['latitude'], list[i]['longitude']);
                    } else {
                        marker = buildMarker("customer", list[i]['order_id'], list[i]['user_id_prefix'], list[i]['first_name'], list[i]['last_name'], list[i]['user_phone_number'], list[i]['user_email'], list[i]['WT'], list[i]['delivery_latitude'], list[i]['delivery_longitude']);
                    }
                    markers.push(marker);
                }
                clearInterval($scope.setInterval_ADL_POL);
            } else {
                var markers = [];
                $scope.setInterval_ADL_POL = setInterval(getListActiveDriverCustomer, 15000);
                getListActiveDriverCustomer();
            }
            mapServices.addMarkerToMap(markers, $scope.disRoomMap);
        }

        function buildMarker(type, order_id, id_prefix, first_name, last_name, phone_number, email, time, lat, lng) {
            var marker = {};
            marker['type'] = type;
            marker['order_id'] = order_id;
            marker['id_prefix'] = id_prefix;
            marker['first_name'] = first_name;
            marker['last_name'] = last_name;
            marker['phone_number'] = phone_number;
            marker['email'] = email;
            marker['time'] = time;
            marker['latLng'] = {
                lat: lat,
                lng: lng
            };
            return marker;
        }
        function clearSelection() {
            $scope.POL_radioGroup = "";
            $scope.ADL_radioGroup = "";
            $scope.POL_SelectAll = "";
            $scope.ADL_SelectAll = "";
            $scope.driverRouteNodes = [];
            $scope.routeNodesMarkers = [];
        }
        function mm_dd_yyyy(inDate) {
            return parseInt(inDate.slice(5, 7), 10) + "/" + parseInt(inDate.slice(8, 10), 10) + "/" + parseInt(inDate.slice(0, 4), 10);
        }

        $scope.init = function () {
            $scope.toPage($scope.page);
            getListActiveDriverCustomer();
            $scope.setInterval_ADL_POL = setInterval(getListActiveDriverCustomer, 15000);

        };
        $(document).ready(function () {
            $scope.init();
        });

    }]);