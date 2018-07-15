app.service('user', function ($cookies, $http, localStorage) {

    var publicFunctions = {};

    publicFunctions.login = function(email, pass){
        return $http({
            method: 'POST',
            url: '/api/authentication/signin',
            data: {
                email: email,
                password: pass,
                coupon_details: getGuestUserCoupons()
            }
        });
    };

    publicFunctions.logout = function () {
        return $http.post('/api/authentication/signout');
    };

    publicFunctions.signup = function (account) {
        return $http({
            method: 'POST',
            url: '/api/authentication/signup',
            data: {
                password: account.password,
                email: account.email,
                fname: account.fname,
                lname: account.lname
            }
        });
    };

    publicFunctions.forgotPassword = function (email) {
        return $http({
            method: 'POST',
            url: '/api/authentication/forgotpassword',
            data: {
                email: email
            }
        });
    };

    publicFunctions.update = function(user){
        return $http({
            method: 'POST',
            url: 'api/account/update',
            data: {
                user: user
            }
        });
    };

    publicFunctions.user = function(){
        return $http.get('/api/account/user');
    };

    publicFunctions.updateCardInfo = function(token){
        return $http({
            method: "POST",
            url: 'api/account/paymentmethod/update',
            data: {
                token: token
            }
        });
    };

    publicFunctions.removeCard = function(){
        return $http({
            method: "POST",
            url: 'api/account/paymentmethod/remove'
        });
    };

    publicFunctions.updatePassword = function(currentPass, newPass){
        return $http({
            method: "POST",
            url: 'api/account/resetpassword',
            data: {
                current_password: currentPass,
                new_password: newPass
            }
        });
    };

    publicFunctions.orders = function(){
        return $http({
            method: "POST",
            url: 'api/account/viewallorders'
        });
    };

    publicFunctions.resendVerificationEmail = function(){
        return $http({
            method: "POST",
            url: 'api/account/reverify'
        });
    };

    publicFunctions.updateUserCoupons = function(coupons){
        return $http({
            method: "POST",
            url: '/api/account/updateStoreCoupon',
            data: {
                coupon_details: coupons,
            }
        });
    };

    function getGuestUserCoupons(){
        let tmpCoupons = localStorage.getUserCoupons();
        let coupons = {};
        for(let key in tmpCoupons){
            coupons[tmpCoupons[key]] = true;
        }
        return coupons;
    }
    return publicFunctions;
});
