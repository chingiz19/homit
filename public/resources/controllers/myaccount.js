app.controller("myaccountController", ["$location", "$scope", "$cookies", "$window", "$http", "$rootScope", "$timeout", "$mdSidenav", "$log", "storage", "$mdToast", "date",
    function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $mdSidenav, $log, storage, $mdToast, date) {

        var myaccount = this;
        myaccount.init = function () {
            myaccount.user = {};
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
                        id: $scope.user['id'],
                        fname: myaccount.user.firstName,
                        lname: myaccount.user.lastName,
                        birth_date: myaccount.user.birthYear + "-" + myaccount.user.birthMonth + "-" + myaccount.user.birthDay
                    }
                }
            }).then(function successCallback(response) {
                if (response.data["success"] === "true") {
                    console.log("Success:  Me updated");
                } else {
                    console.log("Fail: Me failed to update");
                }
            }, function errorCallback(response) {
                console.log("Error: in me update");
            });
        }

        myaccount.updateContact = function () {
            console.log("email is: " + myaccount.user.email);
            console.log("phone is: " + myaccount.user.phoneNumber);
            $http({
                method: 'POST',
                url: '/api/myaccount/update',
                data: {
                    user: {
                        id: $scope.user['id'],
                        email: myaccount.user.email,
                        phone_number: myaccount.user.phoneNumber,
                    }
                }
            }).then(function successCallback(response) {
                if (response.data["success"] === "true") {
                    console.log("Success: Contact updated");
                } else {
                    console.log("Fail: Contact failed to update");
                }
            }, function errorCallback(response) {
                console.log("ERROR in contact update");
            });
        }

        myaccount.updateAddress = function () {
            $http({
                method: 'POST',
                url: '/api/myaccount/update',
                data: {
                    user: {
                        id: $scope.user['id'],
                        address1: myaccount.user.address1,
                        address1_shortname: myaccount.user.address1_shortname,
                        address2: myaccount.user.address2,
                        address2_shortname: myaccount.user.address2_shortname,
                        address3: myaccount.user.address3,
                        address3_shortname: myaccount.user.address3_shortname
                    }
                }
            }).then(function successCallback(response) {
                if (response.data["success"] === "true") {
                    console.log("Success: Address updated");
                } else {
                    console.log("Fail: Address failed to update");
                }
            }, function errorCallback(response) {
                console.log("ERROR in address update");
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
                    user_id: $scope.user['id'],
                    old_password: myaccount.password,
                    new_password: myaccount.new_password
                }
            }).then(function successCallback(response) {
                if (response.data["success"] === "true") {
                    console.log("Success: Password reset");
                } else {
                    console.log("Error: Password failed to reset");
                }
            }, function errorCallback(response) {
                console.log("ERROR in password reset");
            });

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
                        $log.debug("close RIGHT is done");
                    });
            };
        }
        myaccount.init();
    }]);
    
