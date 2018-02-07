app.controller("adminController", function ($location, $scope, $cookies, $http, $rootScope, $window, mapServices, notification) {

        $scope.disRoomMap = undefined;
        $scope.searchCriteria = undefined;
        $scope.searCriteriaIndex = undefined;
        $scope.foundUsers = [];
        $scope.foundOrders = [];
        $scope.foundOrderContent = [];
        $scope.searchBy = undefined;
        $scope.isSearchLisenerOn = false;
        $scope.driverRouteNodes = [];
        $scope.routeNodesMarkers = [];
        $scope.logStreamPrevious = "";
        $scope.logStreamNew = "";

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
        };

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
                    setTimeout(function(){
                        document.getElementById("usrRbtn").click();
                        setTimeout(function(){
                            document.getElementById($scope.searchCriteria).click();
                        }, 10);
                    }, 10);

                }, function errorCallback(response) {
                    Logger.error("error");
                });
            }
        };

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
                for (var tmp in $scope.foundOrders) {
                    $scope.foundOrders[tmp].date_placed = mm_dd_yyyy($scope.foundOrders[tmp].date_placed);
                    if (new Date($scope.foundOrders[tmp].date_assigned) > 0) {
                        $scope.foundOrders[tmp].dispatched = true;
                    } else {
                        $scope.foundOrders[tmp].dispatched = false;
                    }
                }
            }, function errorCallback(response) {
                Logger.error("error");
            });
        };

        $scope.selectOrderId = function (order) {
            $scope.selectedOrder = order;
            $scope.selectedOrder['cartTotal'] = 0;
            $http({
                method: 'POST',
                url: "/api/orders/getorder",
                data: {
                    order_id: order.order_id
                }
            }).then(function successCallback(response) {
                $scope.foundOrderContent = response.data.orders;
                for (item in $scope.foundOrderContent) {
                    $scope.foundOrderContent[item]['modify_number'] = 0;
                    $scope.selectedOrder['cartTotal'] = Math.round((parseFloat($scope.foundOrderContent[item].price) * parseFloat($scope.foundOrderContent[item].quantity) + $scope.selectedOrder['cartTotal']) * 100) / 100;
                }
                $scope.selectedOrder['delFee'] = Math.round((4.99 + parseInt($scope.selectedOrder['cartTotal'] / 100) * 2.99)*100)/100;
                $scope.selectedOrder['GST'] = Math.round(($scope.selectedOrder['delFee'] + $scope.selectedOrder['cartTotal']) * 0.05*100)/100;
                $scope.selectedOrder['totAmount'] = Math.round(($scope.selectedOrder['cartTotal'] + $scope.selectedOrder['delFee'] + $scope.selectedOrder['GST'])*100)/100;
            }, function errorCallback(response) {
                Logger.error("error");
            });
        };

        $scope.logoutBtn = function () {
            $http({
                method: 'POST',
                url: '/api/authentication/signout'
            }).then(function successCallback(response) {
                if (response.data.success) {
                    //delete cookie
                    $cookies.remove("user");
                    $window.location.href = "/main";
                } else {
                    notification.errorMessage("Logout failed, please try again");
                }
            }, function errorCallback(response) {
                notification.errorMessage(response.data.ui_message);
            });
        };

        $scope.reqeustType = null;
        $scope.ref_chr_Money = {};
        $scope.refundList = {};
        $scope.req_1 = {};

        $scope.sendRequest = function (type) {
            if (type == 1) {
                $http({
                    method: 'POST',
                    url: "/api/orders/refundorder'",
                    data: {
                        order_id: $scope.selectedOrder.order_id,
                        note: $scope.req_1.order_comment,
                        date_scheduled: $scope.req_1.date + $scope.req_1.time + ":00",
                        date_scheduled_note: $scope.req_1.time_comment
                    }
                }).then(function successCallback(response) {
                    $scope.ref_chr_Money = response.data;
                }, function errorCallback(response) {
                    Logger.error("error");
                });
            } else if (type != 1 && type != 5) {
                var list_to_send = {};
                for (item_depot_id in $scope.refundList) {
                    list_to_send[item_depot_id] = {
                        "id": $scope.refundList.cart_item_id,
                        "quantity": -$scope.refundList.modify_number
                    };
                }
                $http({
                    method: 'POST',
                    url: "/api/orders/refunditems'",
                    data: {
                        order_id: $scope.selectedOrder.order_id,
                        note: $scope.req_1.order_comment,
                        date_scheduled: $scope.req_1.date + $scope.req_1.time + ":00",
                        date_scheduled_note: $scope.req_1.time_comment,
                        items: list_to_send
                    }
                }).then(function successCallback(response) {
                    $scope.ref_chr_Money = response.data;
                }, function errorCallback(response) {
                    Logger.error("error");
                });
            }
        };

        $scope.reqeustType_change = function (type) {
            updateTotals();
            $scope.reqeustType = type;
            if (type == 1){
                $scope.ref_chr_Money['cartTotal'] = $scope.selectedOrder['cartTotal'];
                $scope.ref_chr_Money['delFee'] = 0;
                $scope.ref_chr_Money['GST'] = Math.round($scope.selectedOrder['cartTotal'] * 0.05*100)/100;
                $scope.ref_chr_Money['totAmount'] = $scope.ref_chr_Money['cartTotal'] + $scope.ref_chr_Money['GST'];
            } else if (type == 3){
                $scope.ref_chr_Money['cartTotal'] = $scope.selectedOrder['cartTotal'];
                $scope.ref_chr_Money['delFee'] = $scope.selectedOrder['delFee'];
                $scope.ref_chr_Money['GST'] = Math.round(($scope.selectedOrder['cartTotal'] + $scope.ref_chr_Money['delFee']) * 0.05*100)/100;
                $scope.ref_chr_Money['totAmount'] = Math.round(($scope.ref_chr_Money['cartTotal'] + $scope.ref_chr_Money['GST'] + $scope.ref_chr_Money['delFee'])*100)/100;
            }
        };

        $scope.addItem = function (item) {
            if ($scope.refundList.hasOwnProperty(item.depot_id) && item.modify_number <= item.quantity - 1) {
                item.modify_number = item.modify_number + 1;
                $scope.refundList[item.depot_id].quantity = item.modify_number;
            } else if ($scope.refundList.hasOwnProperty(item.depot_id) && item.modify_number >= item.quantity) {
                item.modify_number = item.modify_number;
                $scope.refundList[item.depot_id].quantity = item.modify_number;
            } else {
                $scope.refundList[item.depot_id] = {
                    "id": item.cart_item_id,
                    "price": item.price,
                    "quantity": item.modify_number + 1
                };
            }
            totCalculator($scope.refundList);
        };

        $scope.minusItem = function (item) {
            if ($scope.refundList.hasOwnProperty(item.depot_id) && 0 < item.modify_number) {
                item.modify_number = item.modify_number - 1;
                $scope.refundList[item.depot_id].quantity = item.modify_number;
            } else if ($scope.refundList.hasOwnProperty(item.depot_id) && item.modify_number == 0) {
                item.modify_number = 0;
                $scope.refundList[item.depot_id].quantity = item.modify_number;
            }
            totCalculator($scope.refundList);
        };

        function updateTotals() {
            $scope.ref_chr_Money['cartTotal'] = 0;
            $scope.ref_chr_Money['delFee'] = 0;
            $scope.ref_chr_Money['GST'] = 0;
            $scope.ref_chr_Money['totAmount'] = 0;
        }

        function totCalculator(list) {
            var delFee1 = 4.99;
            var delFee2 = 2.99;
            updateTotals();
            for (item in list) {
                $scope.ref_chr_Money['cartTotal'] = Math.round(($scope.ref_chr_Money['cartTotal'] + list[item].price * list[item].quantity) * 100) / 100;
            }
            if ($scope.reqeustType == 3 && $scope.reqeustType == 4) {
                $scope.ref_chr_Money['delFee'] = (delFee1 + parseInt(($scope.selectedOrder['cartTotal']) / 100) * delFee2) - (delFee1 + parseInt(($scope.selectedOrder['cartTotal'] - $scope.ref_chr_Money['cartTotal']) / 100) * delFee2);
            } else if($scope.reqeustType == 5){
                $scope.ref_chr_Money['delFee'] = delFee1 + parseInt(($scope.ref_chr_Money['cartTotal']) / 100) * delFee2;
            }
            $scope.ref_chr_Money['GST'] = Math.round(($scope.ref_chr_Money['cartTotal'] + $scope.ref_chr_Money['delFee']) * 0.05 * 100) / 100;
            $scope.ref_chr_Money['totAmount'] = Math.round(($scope.ref_chr_Money['cartTotal'] + $scope.ref_chr_Money['delFee'] + $scope.ref_chr_Money['GST']) * 100) / 100;
        }

        $scope.page = 2;
        $scope.pageName = "Dispatch Room";
        $scope.disRoomMap = undefined;
        $scope.reqeustType = undefined;
        $scope.isOrderDelivered = undefined;
        $scope.POL_search = undefined;
        $scope.POL_radioGroup = undefined;
        $scope.ADL_radioGroup = undefined;

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
                    $scope.disRoomMap = mapServices.createMap("drMap", {
                        zoom: 11,
                        center: new google.maps.LatLng(51.054637, -114.094996),
                        streetViewControl: false,
                        rotateControl: false,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });
                }
            }
            if (num == 3) {
                $scope.pageName = "Log Stream";
                $scope.page = 3;
                $("html, body").animate({ scrollTop: $(document).height() }, 1000);
            }
        };

        function getListActiveDriverCustomer() {
            $scope.online_driverList = [];
            $scope.customer_pendingList = [];
            $scope.ADL_POL_markers = [];
            $http({
                method: 'GET',
                url: "/api/driver/onlinedrivers",
            }).then(function successCallback(response) {
                $scope.online_driverList = response.data.drivers;
                for (var driver in $scope.online_driverList) {
                    var order_marker = {};
                    $scope.online_driverList[driver].on_shift = Math.round(Math.abs((new Date() - new Date($scope.online_driverList[driver].shift_start)) / (1000 * 60)));
                    $scope.ADL_POL_markers.push(buildMarker("driver", $scope.online_driverList[driver].driver_id, 
                                $scope.online_driverList[driver].driver_id_prefix, $scope.online_driverList[driver].first_name, 
                                $scope.online_driverList[driver].last_name, $scope.online_driverList[driver].phone_number, 
                                $scope.online_driverList[driver].email, 
                                $scope.online_driverList[driver].on_shift, 
                                $scope.online_driverList[driver].latitude, 
                                $scope.online_driverList[driver].longitude));
                }
            }, function errorCallback(response) {
                console.error("error");
            });

            $http({
                method: 'GET',
                url: "/api/orders/pendingorders",

            }).then(function successCallback(response) {
                $scope.customer_pendingList = response.data.orders;
                for (var order in $scope.customer_pendingList) {
                    var order_marker = {};
                    if (new Date($scope.customer_pendingList[order].date_assigned) > 0) {
                        $scope.customer_pendingList[order].dispatched = true;
                    } else {
                        $scope.customer_pendingList[order].dispatched = false;
                    }
                    $scope.customer_pendingList[order].WT = Math.round(Math.abs((new Date() - new Date($scope.customer_pendingList[order].date_placed)) / (1000 * 60)));
                    $scope.ADL_POL_markers.push(buildMarker("customer", $scope.customer_pendingList[order].order_id, 
                                                                        $scope.customer_pendingList[order].user_id_prefix, 
                                                                        $scope.customer_pendingList[order].first_name, 
                                                                        $scope.customer_pendingList[order].last_name, 
                                                                        $scope.customer_pendingList[order].user_phone_number, 
                                                                        $scope.customer_pendingList[order].user_email, 
                                                                        $scope.customer_pendingList[order].WT, 
                                                                        $scope.customer_pendingList[order].delivery_latitude, 
                                                                        $scope.customer_pendingList[order].delivery_longitude));
                }
                mapServices.addMarkerToMap($scope.ADL_POL_markers, $scope.disRoomMap);
            }, function errorCallback(response) {
                console.error("error");
            });
        }

        function getLogs(){
            $scope.logStreamPrevious = $scope.logStreamPrevious + $scope.logStreamNew;
            $http({
                method: 'POST',
                url: "/api/csr/streamlog",
            }).then(function successCallback(response) {
                $scope.logStreamNew = response.data.replace($scope.logStreamPrevious, '');
                $("html, body").animate({ scrollTop: $(document).height() }, 1000);
            }, function errorCallback(response) {
                console.log("Error occured in get logs");
            });
        }

        $scope.showDriverRoute = function (driver) {
            clearInterval($scope.setInterval_ADL_POL);
            clearSelection();
            $http({
                method: 'POST',
                url: "/api/driver/getroutes",
                data: {
                    driver_id: driver.driver_id
                }
            }).then(function successCallback(response) {
                $scope.driverRouteNodes = response.data.routes;
                $scope.routeNodesMarkers.push(buildMarker("driver", driver.driver_id, driver.driver_id_prefix, driver.first_name, driver.last_name, driver.phone_number, driver.email, driver.on_shift, driver.latitude, driver.longitude));
                for (var node in $scope.driverRouteNodes) {
                    $scope.routeNodesMarkers.push(buildMarker($scope.driverRouteNodes[node].node_type, $scope.driverRouteNodes[node].node_id, $scope.driverRouteNodes[node].node_id_prefix, "first_name", "last_name", "phone_number", "email", "time", $scope.driverRouteNodes[node].node_latitude, $scope.driverRouteNodes[node].node_longitude));
                }
                mapServices.addPolylineToMap($scope.routeNodesMarkers, $scope.disRoomMap);
            }, function errorCallback(response) {
                console.error("error");
            });
        };

        $scope.showOrder = function (order) {
            clearSelection();
            clearInterval($scope.setInterval_ADL_POL);
            var order_marker = [];
            order_marker.push(buildMarker("customer", order.order_id, order.user_id_prefix, order.first_name, order.last_name, order.user_phone_number, order.user_email, order.WT, order.delivery_latitude, order.delivery_longitude));
            mapServices.addMarkerToMap(order_marker, $scope.disRoomMap);
        };

        $scope.selectAll = function (type, list) {
            var markers = [];
            if (!$scope.POL_SelectAll && type == 'order' || !$scope.ADL_SelectAll && type == 'driver') {
                clearSelection();
                var marker = {};
                for (var i = 0; i < list.length; i++) {
                    if (list[i].driver_id_prefix == "d_") {
                        marker = buildMarker("driver", list[i].driver_id, list[i].driver_id_prefix, list[i].first_name, list[i].last_name, list[i].phone_number, list[i].email, list[i].on_shift, list[i].latitude, list[i].longitude);
                    } else {
                        marker = buildMarker("customer", list[i].order_id, list[i].user_id_prefix, list[i].first_name, list[i].last_name, list[i].user_phone_number, list[i].user_email, list[i].WT, list[i].delivery_latitude, list[i].delivery_longitude);
                    }
                    markers.push(marker);
                }
                clearInterval($scope.setInterval_ADL_POL);
            } else {
                markers = []; //TODO: already empty?
                $scope.setInterval_ADL_POL = setInterval(getListActiveDriverCustomer, 5000);
                getListActiveDriverCustomer();
            }
            mapServices.addMarkerToMap(markers, $scope.disRoomMap);
        };

        function buildMarker(type, order_id, id_prefix, first_name, last_name, phone_number, email, time, lat, lng) {
            var marker = {};
            marker.type = type;
            marker.order_id = order_id;
            marker.id_prefix = id_prefix;
            marker.first_name = first_name;
            marker.last_name = last_name;
            marker.phone_number = phone_number;
            marker.email = email;
            marker.time = time;
            marker.latLng = {
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
            getLogs();
            setInterval(getLogs, 5000);
            $scope.setInterval_ADL_POL = setInterval(getListActiveDriverCustomer, 5000);
        };

        $(document).ready(function () {
            $scope.init();
        });
    });