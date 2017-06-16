var app = angular.module('mainModule', ["ngRoute"])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });

app.controller("LogoSearchController", function ($scope, $http) {

});

app.controller("notificationController", function ($scope, $sce) {
    var notification = this;

    notification.reset = function () {
        notification.type = "";
        notification.message = "";
        notification.show = false;
    }

    $scope.$on("addNotification", function (event, args) {
        notification.type = args.type;
        notification.message = args.message;
        notification.show = true;
        setTimeout(function () {
            window.location.reload();
        }, 2500);
    })

    notification.reset();
});

app.controller("LoginController", function ($scope, $http, $sce, $route, $rootScope) {
    var _nextState = "next",
        _signinState = "signin",
        _signupState = "signup",
        _forgotPasswordState = "forgotPassword";

    var _currentButtonState;

    var login = this;
    login.reset = function () {
        login.modalTitle = "Sign...";
        login.mainButtonText = "Next";
        login.goToSignIn = false;
        login.goToSignUp = false;
        login.goToForgotPassword = false;
        login.error = 0;
        _currentButtonState = _nextState;

        login.email = "";
        login.password = "";
        login.fname = "";
        login.lname = "";
        login.phone = "";
        login.npassword = "";
        login.cpassword = "";
        login.dob = "";
        login.forgotPasswordEmail = "";
    }

    login.reset();

    //check Email -> either go to sign in, or prompt sign up
    login.checkState = function () {
        switch (_currentButtonState) {
            case _nextState: _checkEmail(); break
            case _signinState: _signIn(); break;
            case _signupState: _signUp(); break;
            case _forgotPasswordState: _forgotPassword(); break;
            default: login.email = "error occured@checkStage";
        }
    }

    // Used to show sign in form
    login.goToLogInForm = function () {
        var e = login.email;
        login.reset();
        login.email = e;
        login.goToSignIn = true;
        login.modalTitle = "Sign in";
        login.mainButtonText = "Sign in";
        _currentButtonState = _signinState;
    }

    // Used to show sign up form
    login.goToSignUpForm = function () {
        var tmp_email = login.email;
        login.reset();
        login.email = tmp_email;
        login.goToSignUp = true;
        login.modalTitle = "Sign up";
        login.mainBut7tonText = "Sign up";
        _currentButtonState = _signupState;
    }

    // Used to show forgot password form
    login.goToForgotPasswordForm = function () {
        login.reset();
        login.goToForgotPassword = true;
        login.modalTitle = "Forgot password";
        login.mainButtonText = "Reset";
        _currentButtonState = _forgotPasswordState;
    }

    // Check email 
    var _checkEmail = function () {
        $http({
            method: 'GET',
            url: '/api/authentication/userexists',
            params: {
                email: login.email,
            }
        }).then(function successCallback(response) {
            if (response.data["exists"]) {
                login.goToLogInForm();
            } else {
                login.error = 1;
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    };

    //Sign In 
    var _signIn = function () {
        $http({
            method: 'GET',
            url: '/api/authentication/signin',
            params: {
                email: login.email,
                password: login.password,
            }
        }).then(function successCallback(response) {
            if (!response.data["error"]) {
                login.hideModal();
                $rootScope.$broadcast("addNotification", { type: "alert-success", message: response.data["ui_message"] });
                setTimeout(function () {
                    window.location.reload();
                }, 2500);
            } else {
                login.error = 2;
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }

    //Sign Up
    var _signUp = function () {
        //TODO: find out why this is not working without reassignment
        login.npassword = login.npassword;
        var password = login.npassword;
        $http({
            method: 'POST',
            url: '/api/authentication/signup',
            data: {
                password: password,
                email: login.email,
                fname: login.fname,
                lname: login.lname,
                phone: login.phone,
                dob: login.dob
            }
        }).then(function successCallback(response) {
            if (!response.data["error"]) {
                login.hideModal();
                login.reset();
                $rootScope.$broadcast("addNotification", { type: "alert-success", message: response.data["ui_message"] });
            } else {
                $rootScope.$broadcast("addNotification", { type: "alert-error", message: response.data["error"].ui_message });
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }

    var _forgotPassword = function () {
        $http({
            method: 'POST',
            url: '/api/authentication/resetpassword',
            data: {
                email: login.forgotPasswordEmail
            }
        }).then(function successCallback(response) {
            if (response.data["success"] === "true") {
                console.log("password reset");
            } else {
                console.log("password not reset");
            }
        }, function errorCallback(response) {
            console.log("ERROR in password reset");
        });
    }

    login.hideModal = function () {
        $('#loginModal').modal('hide');
    }
});

app.controller("NavigationController", function ($scope, $http) {
});

//Cart Box Pop Up
function mouseOn() {
    document.getElementById("cart").style.color = "red";
}

function mouseOut() {
    document.getElementById("cart").style.color = "black";
}

var timeHovered = null;
var el = document.getElementById("cart");

el.addEventListener('mouseenter', function () {
    timeHovered = window.setTimeout(function () {
        $(".cartBox").addClass("active");
    }, 500);
});

el.addEventListener('mouseleave', function () {
    window.clearTimeout(timeHovered);
    $(".cartBox").removeClass("active");
});

//AddToCart Controller

app.controller("cartController", function ($scope, $sce, $rootScope, $http) {
    $scope.userCart = {};
    $scope.numberOfItemsInCart = 0;
    $scope.totalAmount = 0;
    $scope.$on("addToCart", function (event, args) {
        var tmp = 1;
        var action = true;
        if ($scope.userCart.hasOwnProperty(args.addedProduct.warehouse_id)) {
            tmp = $scope.userCart[args.addedProduct.warehouse_id]["quantity"];
            tmp++;
            if (tmp >= 10) tmp = 10;
            $scope.userCart[args.addedProduct.warehouse_id]["quantity"] = tmp;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + args.addedProduct.price;
        } else {
            $scope.userCart[args.addedProduct.warehouse_id] = args.addedProduct;
            $scope.userCart[args.addedProduct.warehouse_id]["quantity"] = tmp;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + args.addedProduct.price;
        }
        $scope.prepareItemForDB(args.addedProduct.warehouse_id, tmp, action);
    })

    $scope.plusItem = function (product) {
        var tmp = 1;
        var action = true;
        if ($scope.userCart.hasOwnProperty(product.warehouse_id)) {
            tmp = $scope.userCart[product.warehouse_id]["quantity"];
            tmp++;
            if (tmp >= 10) tmp = 10;
            $scope.userCart[product.warehouse_id]["quantity"] = tmp;
            $scope.numberOfItemsInCart++;
            $scope.totalAmount = $scope.totalAmount + product.price;
        }
        $scope.prepareItemForDB(product.warehouse_id, tmp, action);
    }

    $scope.minusItem = function (product) {
        var tmp = 1;
        var action = true;
        if ($scope.userCart.hasOwnProperty(product.warehouse_id) && $scope.userCart[product.warehouse_id]["quantity"] >= 1) {
            tmp = $scope.userCart[product.warehouse_id]["quantity"];
            tmp--;
            if (tmp < 0) tmp = 0;
            $scope.userCart[product.warehouse_id]["quantity"] = tmp;
            $scope.numberOfItemsInCart--;
            if ($scope.numberOfItemsInCart < 0) $scope.numberOfItemsInCart = 0;
            $scope.totalAmount = $scope.totalAmount - product.price;
            if ($scope.totalAmount < 0) $scope.totalAmount = 0;
        }
        $scope.prepareItemForDB(product.warehouse_id, tmp, action);
    }

    $scope.clearCart = function (product) {
        $scope.userCart = {};
        $scope.numberOfItemsInCart = 0;
        $scope.totalAmount = 0;

        $http({
            method: 'POST',
            url: '/api/cart/clear',
        }).then(function successCallback(response) {
            if (!response.data["error"]) {
                console.log("Cart Clear!");
            } else {
                console.log("NOT Cleared!");
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }

    $scope.removeFromCart = function (product) {
        if ($scope.userCart.hasOwnProperty(product.warehouse_id)) {
            delete $scope.userCart[product.warehouse_id];
            $scope.numberOfItemsInCart = $scope.numberOfItemsInCart - product.quantity;
            $scope.totalAmount = $scope.totalAmount - product.price * product.quantity;
            var action = false;
            $scope.prepareItemForDB(product.warehouse_id, tmp, action);
        }
    }

    $scope.prepareItemForDB = function (warehouse_id, itemQuantity, action) {
        $scope.addItemToUserDB = {};
        $scope.addItemToUserDB["warehouse_id"] = warehouse_id;
        $scope.addItemToUserDB["quantity"] = itemQuantity;
        $scope.addItemToUserDB["action"] = action;

        $http({
            method: 'POST',
            url: '/api/cart/addtocart',
            data: {
                warehouse_id: $scope.addItemToUserDB["warehouse_id"],
                quantity: $scope.addItemToUserDB["quantity"],
                action: $scope.addItemToUserDB["action"]
            }
        }).then(function successCallback(response) {
            if (!response.data["error"]) {
                console.log("Sent to User DB");
            } else {
                console.log("Item wasn't posted to User DB");
            }
        }, function errorCallback(response) {
            console.log("ERROR");
        });
    }

});
