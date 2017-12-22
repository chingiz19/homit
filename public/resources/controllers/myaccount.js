app.controller("myaccountController", ["$location", "$scope", "$cookies", "$window", "$http", "$rootScope", "$timeout", "$mdSidenav", "$log", "sessionStorage", "$mdToast", "date", "user", "mapServices",
    function ($location, $scope, $cookies, $window, $http, $rootScope, $timeout, $mdSidenav, $log, sessionStorage, $mdToast, date, user, mapServices) {

        var myaccount = this;
        myaccount.init = function () {
            myaccount.user = {};
            myaccount.foundOrders = [];
            myaccount.foundTheOrder = [];
            myaccount.date = date;
            myaccount.selectedTab = 0;
            myaccount.edit = false;
            myaccount.isOrderHistoryShown = false;
            myaccount.passwordError = false;
            myaccount.info_updated = false;
            myaccount.address_valid = undefined;

            $scope.user = JSON.parse($cookies.get("user").replace("j:", ""));

            myaccount.user.firstName = $scope.user['first_name'];
            myaccount.user.lastName = $scope.user['last_name'];
            myaccount.user.birthYear = $scope.user['birth_date'].slice(0, 4);
            myaccount.user.birthMonth = new Date(parseInt($scope.user['birth_date'].slice(5, 7), 10) + ", 11 , 2017").getMonth() + 1;
            myaccount.user.birthDay = parseInt($scope.user['birth_date'].slice(8, 10), 10);
            myaccount.user.email = $scope.user['user_email'];
            myaccount.user.phoneNumber = $scope.user['phone_number'];
            myaccount.user.address = $scope.user['address'];

            myaccount.b_years = date.getYears();
            myaccount.b_months = date.getMonths();
            myaccount.b_days = date.getDays(myaccount.user.birthMonth, myaccount.user.birthYear);

            mapServices.createCoveragePolygon().then(function (polygon) {
                if (polygon) {
                    $scope.coveragePolygon = polygon;
                }
            });
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

        myaccount.editButton = function (type) {
            myaccount.edit = !myaccount.edit;
            myaccount.user.fname_valid = false;
            myaccount.user.lname_valid = false;
            myaccount.user.email_valid = false;
            myaccount.user.phone_valid = false;
            myaccount.user.crPsswrd_valid = false;
            myaccount.user.new1Psswrd_valid = false;
            myaccount.user.new2Psswrd_valid = false;
            if(type == 2){
                myaccount.user.address = sessionStorage.getAddress().formatted_address;
            }
        }

        myaccount.cancelEdit = function () {
            myaccount.edit = !myaccount.edit;
            myaccount.user.firstName = $scope.user['first_name'];
            myaccount.user.lastName = $scope.user['last_name'];
            myaccount.user.birthYear = $scope.user['birth_date'].slice(0, 4);
            myaccount.user.birthMonth = new Date(parseInt($scope.user['birth_date'].slice(5, 7), 10) + ", 11 , 2017").getMonth() + 1;
            myaccount.user.birthDay = parseInt($scope.user['birth_date'].slice(8, 10), 10);
            myaccount.user.email = $scope.user['user_email'];
            myaccount.user.phoneNumber = $scope.user['phone_number'];
            myaccount.user.address = $scope.user['address'];
        }

        myaccount.updateMe = function () {
            if (myaccount.user.fname_valid || myaccount.user.lname_valid || (myaccount.user.birthDay && myaccount.user.birthMonth && myaccount.user.birthYear) || (!myaccount.user.birthDay && !myaccount.user.birthMonth && !myaccount.user.birthYear)) {
                $http({
                    method: 'POST',
                    url: '/api/myaccount/update',
                    data: {
                        user: {
                            fname: myaccount.user.firstName,
                            lname: myaccount.user.lastName,
                            birth_year: myaccount.user.birthYear,
                            birth_month: date.convertMonth(myaccount.user.birthMonth),
                            birth_day: myaccount.user.birthDay
                        }
                    }
                }).then(function successCallback(response) {
                    if (response.data["success"] === true) {
                        myaccount.user.fname_valid = false;
                        myaccount.user.lname_valid = false;
                        myaccount.update_success();
                        console.log("Success:  Me updated");
                    } else {
                        console.log("Fail: Me failed to update");
                    }
                }, function errorCallback(response) {
                    console.log("Error: in me update");
                });
            } else {
                myaccount.input_invalid_message = "Please make sure input data is correct.";
            }
        }

        myaccount.updateContact = function () {
            if (myaccount.user.email_valid || myaccount.user.phone_valid) {
                $http({
                    method: 'POST',
                    url: '/api/myaccount/update',
                    data: {
                        user: {
                            email: myaccount.user.email,
                            phone_number: myaccount.user.phoneNumber.replace(/[() +-]/g, ""),
                        }
                    }
                }).then(function successCallback(response) {
                    if (response.data["success"] === true) {
                        myaccount.user.email_valid = false;
                        myaccount.user.phone_valid = false;
                        myaccount.update_success();
                        console.log("Success: Contact updated");
                    } else {
                        console.log("Fail: Contact failed to update");
                    }
                }, function errorCallback(response) {
                    console.log("ERROR in contact update");
                });
            } else {
                myaccount.input_invalid_message = "Please make sure input data is correct.";
            }
        }

        myaccount.updateAddress = function () {
            if(myaccount.address_valid){
                $http({
                    method: 'POST',
                    url: '/api/myaccount/update',
                    data: {
                        user: {
                            address1: myaccount.address,
                            address_latitude: myaccount.address_latitude,
                            address_longitude: myaccount.address_longitude
                        }
                    }
                }).then(function successCallback(response) {
                    if (response.data["success"] === true) {
                        console.log("Success: Address updated");
                    } else {
                        console.log("Fail: Address failed to update");
                    }
                }, function errorCallback(response) {
                    console.log("ERROR in address update");
                });
            }
        }

        myaccount.changePassword = function () {
            if (myaccount.user.crPsswrd_valid && myaccount.user.new1Psswrd_valid && myaccount.user.new2Psswrd_valid && !myaccount.passwordError) {
                $http({
                    method: 'POST',
                    url: '/api/myaccount/resetpassword',
                    data: {
                        old_password: myaccount.password,
                        new_password: myaccount.new_password
                    }
                }).then(function successCallback(response) {
                    if (response.data["success"] === true) {
                        myaccount.user.crPsswrd_valid = false;
                        myaccount.user.new1Psswrd_valid = false;
                        myaccount.user.new2Psswrd_valid = false;
                        myaccount.passwordError = false;
                        myaccount.update_success();
                        console.log("Success: Password reset");
                    } else {
                        console.log("Error: Password failed to reset");
                    }
                }, function errorCallback(response) {
                    console.log("ERROR in password reset");
                });
            } else {
                myaccount.input_invalid_message = "Please make sure input data is correct.";
            }
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
                    myaccount.foundOrders[tmp]['date_placed'] = myaccount.mm_dd_yyyy(inDate);
                    myaccount.foundOrders[tmp]['delivery_address'] = myaccount.foundOrders[tmp]['delivery_address'].substring(0, 13) + "..";
                }
            }, function errorCallback(response) {
                console.log("Error in getting user Orders.");
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
                console.log("Error in getting the requested Order");
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

        $scope.gotAddressResults = function () {
            var latLng = $scope.autocomplete.getLatLng();
            if (mapServices.isPlaceInsidePolygon(latLng, $scope.coveragePolygon)) {

                sessionStorage.setAddress($scope.autocomplete.getPlace());
                sessionStorage.setAddressLat(latLng.lat());
                sessionStorage.setAddressLng(latLng.lng());

                myaccount.address_latitude = latLng.lat();
                myaccount.address_longitude = latLng.lng();
                myaccount.address = $scope.autocomplete.getText();

                if(myaccount.edit && myaccount.selectedTab == 2){
                    myaccount.user.address = sessionStorage.getAddress().formatted_address;
                }
                myaccount.address_valid = true;
            } else {
                myaccount.address_valid = false;
            }
        }

        myaccount.updateBDays = function () {
            myaccount.b_days = date.getDays(myaccount.user.birthMonth, myaccount.user.birthYear);
        }

        myaccount.checkPassword = function () {
            if (myaccount.passwordError == true || myaccount.passwordError == false) {
                myaccount.passwordError = (myaccount.new_password != myaccount.confirm_password);
            } else {
                myaccount.passwordError = (myaccount.new_password != myaccount.confirm_password);
            }
            return myaccount.passwordError;
        }

        myaccount.sanitizeInput = function (text, type) {
            var pattern = { "fname": /^[a-zA-Z]*$/, "lname": /^[a-zA-Z]*$/, "email": /^.+@.+\..+$/, "phone": /^[0-9()+ -]*$/, "cd_1": /^[0-9]*$/, "cd_2": /^[0-9]*$/, "cd_3": /^[0-9]*$/, "crPsswrd_valid": /^(?:([^\?\$\{\}\^\(\)\!\'\[\<\ \>\,\+\”\/\;\\\|\%\&\#\@]))*$/, "new1Psswrd": /^(?:([^\?\$\{\}\^\(\)\!\'\[\<\ \>\,\+\”\/\;\\\|\%\&\#\@]))*$/, "new2Psswrd": /^(?:([^\?\$\{\}\^\(\)\!\'\[\<\ \>\,\+\”\/\;\\\|\%\&\#\@]))*$/, "cd_1": /^[0-9]*$/, "cd_2": /^[0-9/]*$/, "cd_3": /^[0-9]*$/};
            if (text && type) {
                if (text.match(pattern[type])) {
                    myaccount.user[type + "_valid"] = true;
                }
                else {
                    myaccount.user[type + "_valid"] = false;
                }
            }
        }

        myaccount.mm_dd_yyyy = function (inDate) {
            return parseInt(inDate.slice(5, 7), 10) + "/" + parseInt(inDate.slice(8, 10), 10) + "/" + parseInt(inDate.slice(0, 4), 10);
        }

        jQuery(function($){
            $("#gP_number").mask("(999) 999-9999");
         });
        myaccount.update_success = function(){
            myaccount.info_updated = true;ma
            setTimeout(() => {
                myaccount.info_updated = false;
                document.getElementById("cancelEdit").click();
            }, 1500);
        }

        $scope.$on("checkUserLogin", function (event, args) {
            if (!user.isUserLogged()){
                $window.location.href = "/main";
            }
        });

        myaccount.init();
    }]);

