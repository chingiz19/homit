app.controller("myaccountController", ["$location", "$scope", "$cookies", "$window", "$http", "$rootScope", "$timeout", "$mdSidenav", "$log", "storage", "$mdToast", "date",
    function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $mdSidenav, $log, storage, $mdToast, date) {

        var myaccount = this;
        myaccount.init = function () {
            myaccount.user = {};
            myaccount.foundOrders = [];
            myaccount.foundTheOrder = [];
            myaccount.edit = false;
            myaccount.isOrderHistoryShown = false;
            myaccount.date = date;
            myaccount.selectedTab = 0;
            myaccount.passwordError = false;

            $scope.user = JSON.parse($cookies.get("user").replace("j:", ""));

            myaccount.user.firstName = $scope.user['first_name'];
            myaccount.user.lastName = $scope.user['last_name'];
            myaccount.user.birthYear = $scope.user['birth_date'].slice(0, 4);
            myaccount.user.birthMonth = new Date(parseInt($scope.user['birth_date'].slice(5, 7), 10) + ", 11 , 2017").getMonth() + 1;
            myaccount.user.birthDay = parseInt($scope.user['birth_date'].slice(8, 10), 10);
            myaccount.user.email = $scope.user['user_email'];
            myaccount.user.phoneNumber = $scope.user['phone_number'];
            myaccount.user.address1_shortname = $scope.user['address1_name'];
            myaccount.user.address1 = $scope.user['address1'];
            myaccount.user.address2_shortname = $scope.user['address2_name'];
            myaccount.user.address2 = $scope.user['address2'];
            myaccount.user.address3_shortname = $scope.user['address3_name'];
            myaccount.user.address3 = $scope.user['address3'];
        }
        myaccount.updateTab = function (tab) {
            myaccount.selectedTab = tab;
            var el = document.querySelector('.selectedTab');
            if (el) {
                document.getElementById(el.id).classList.remove("selectedTab");
            }
            document.getElementById("myAcTi" + tab).classList.add("selectedTab");
            var el = document.querySelector('.selectedTabLn');
            if (el) {
                document.getElementById(el.id).classList.remove("selectedTabLn");
                document.getElementById(el.id).classList.add("myTabsBtmLn");
            }
            document.getElementById("myAcLi" + tab).classList.remove("myTabsBtmLn");
            document.getElementById("myAcLi" + tab).classList.add("selectedTabLn");
            if (myaccount.selectedTab == 5) {
                myaccount.viewUserOrders();
            }
        }

        myaccount.editButton = function () {
            myaccount.edit = !myaccount.edit;
        }

        myaccount.cancelEdit = function () {
            myaccount.edit = false;
            myaccount.user.firstName = $scope.user['first_name'];
            myaccount.user.lastName = $scope.user['last_name'];
            myaccount.user.birthYear = $scope.user['birth_date'].slice(0, 4);
            myaccount.user.birthMonth = new Date(parseInt($scope.user['birth_date'].slice(5, 7), 10) + ", 11 , 2017").getMonth() + 1;
            myaccount.user.birthDay = parseInt($scope.user['birth_date'].slice(8, 10), 10);
            myaccount.user.email = $scope.user['user_email'];
            myaccount.user.phoneNumber = $scope.user['phone_number'];
            myaccount.user.address1_shortname = $scope.user['address1_name'];
            myaccount.user.address1 = $scope.user['address1'];
            myaccount.user.address2_shortname = $scope.user['address2_name'];
            myaccount.user.address2 = $scope.user['address2'];
            myaccount.user.address3_shortname = $scope.user['address3_name'];
            myaccount.user.address3 = $scope.user['address3'];
        }

        var showToast = function (message, action) {
            var toast = $mdToast.simple()
                .textContent(message)
                .highlightAction(true)
                .action(action)
                .highlightClass("md-accent")
                .parent($("#mainPart"))
                .position('top right');

            if (action) {
                toast.action(action);
                $mdToast.show(toast).then(function (response) {
                    if (response === 'ok') {
                        $mdToast.hide(toast);
                    }
                })
            } else {
                $mdToast.show(toast);
            }
        };

        myaccount.checkPassword = function () {
            myaccount.passwordError = (myaccount.new_password != myaccount.confirm_password);
        }

        myaccount.updateMe = function () {
            $http({
                method: 'POST',
                url: '/api/myaccount/update',
                data: {
                    user: {
                        fname: myaccount.user.firstName,
                        lname: myaccount.user.lastName,
                        birth_date: myaccount.user.birthYear + "-" + myaccount.user.birthMonth + "-" + myaccount.user.birthDay
                    }
                }
            }).then(function successCallback(response) {
                if (response.data["success"] === true) {
                    Logger.log("Success:  Me updated");
                } else {
                    Logger.log("Fail: Me failed to update");
                }
            }, function errorCallback(response) {
                Logger.log("Error: in me update");
            });
        }

        myaccount.updateContact = function () {
            $http({
                method: 'POST',
                url: '/api/myaccount/update',
                data: {
                    user: {
                        email: myaccount.user.email,
                        phone_number: myaccount.user.phoneNumber,
                    }
                }
            }).then(function successCallback(response) {
                if (response.data["success"] === true) {
                    Logger.log("Success: Contact updated");
                } else {
                    Logger.log("Fail: Contact failed to update");
                }
            }, function errorCallback(response) {
                Logger.log("ERROR in contact update");
            });
        }

        myaccount.updateAddress = function () {
            $http({
                method: 'POST',
                url: '/api/myaccount/update',
                data: {
                    user: {
                        address1: myaccount.user.address1,
                        address1_name: myaccount.user.address1_shortname,
                        address2: myaccount.user.address2,
                        address2_name: myaccount.user.address2_shortname,
                        address3: myaccount.user.address3,
                        address3_name: myaccount.user.address3_shortname
                    }
                }
            }).then(function successCallback(response) {
                if (response.data["success"] === true) {
                    Logger.log("Success: Address updated");
                } else {
                    Logger.log("Fail: Address failed to update");
                }
            }, function errorCallback(response) {
                Logger.log("ERROR in address update");
            });
        }

        myaccount.changePassword = function () {
            if (myaccount.passwordError) {
                showToast("Password did not match", "Close");
                return;
            }
            $http({
                method: 'POST',
                url: '/api/myaccount/resetpassword',
                data: {
                    old_password: myaccount.password,
                    new_password: myaccount.new_password
                }
            }).then(function successCallback(response) {
                if (response.data["success"] === true) {
                    Logger.log("Success: Password reset");
                } else {
                    Logger.log("Error: Password failed to reset");
                }
            }, function errorCallback(response) {
                Logger.log("ERROR in password reset");
            });
        }

        $scope.mm_dd_yyyy = function (inDate) {
            return parseInt(inDate.slice(5, 7), 10) + "/" + parseInt(inDate.slice(8, 10), 10) + "/" + parseInt(inDate.slice(0, 4), 10);
        }

        myaccount.viewUserOrders = function () {
            $http({
                method: 'POST',
                url: '/api/myaccount/vieworders',
            }).then(function successCallback(response) {
                myaccount.foundOrders = response.data.orders;
                var inDate;
                for (tmp in myaccount.foundOrders) {
                    inDate = myaccount.foundOrders[tmp]['date_placed'];
                    myaccount.foundOrders[tmp]['date_placed'] = $scope.mm_dd_yyyy(inDate);
                    myaccount.foundOrders[tmp]['delivery_address'] = myaccount.foundOrders[tmp]['delivery_address'].substring(0, 13) + "..";
                }
            }, function errorCallback(response) {
                Logger.log("Error in getting user Orders.");
            });
        }

        $scope.reqOrderID = 0;

        myaccount.getOrderContent = function (order_id) {
            myaccount.slctcntBxIsSet = false;
            var el_order_id = document.getElementById(order_id);

            if (order_id == $scope.reqOrderID) {
                if (el_order_id.classList.contains("slctcntBx")) {
                    el_order_id.classList.remove("slctcntBx");
                } else {
                    el_order_id.classList.add("slctcntBx");
                }
            } else {
                var x = document.querySelectorAll(".cntBx");
                if ($scope.reqOrderID == 0) {
                    el_order_id.classList.add("slctcntBx");
                    $scope.reqOrderID = order_id;
                } else {
                    for (var i = 0; i < x.length; i++) {
                        if (x[i].classList.contains("slctcntBx")) {
                            document.getElementById(x[i].id).classList.remove("slctcntBx");
                            el_order_id.classList.add("slctcntBx");
                            $scope.reqOrderID = order_id;
                            myaccount.slctcntBxIsSet = true;
                        } else if (!myaccount.slctcntBxIsSet) {
                            el_order_id.classList.add("slctcntBx");
                        }
                    }
                }
            }
            $http({
                method: 'POST',
                url: 'api/myaccount/getorder',
                data: {
                    order_id: order_id
                }
            }).then(function successCallback(response) {
                myaccount.foundTheOrder = response.data.orders;
            }, function errorCallback(response) {
                Logger.log("Error in getting the requested Order");
            });
        }

        // myAccount Page left-SideNav functionality
        $scope.toggleLeft = buildDelayedToggler('left');
        function debounce(func, wait, context) {
            var timer;
            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function () {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }
        function buildDelayedToggler(navID) {
            return debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        $log.debug("toggle " + navID + " is done");
                    });
            }, 200);
        }
        $scope.close = function () {
            $mdSidenav('right').close()
                .then(function () {
                    $log.debug("close LEFT is done");
                });
        };
        myaccount.init();
    }]);

