app.service('user', function ($cookies, $http) {

    var publicFunctions = {};

    publicFunctions.login = function(email, pass){
        return $http({
            method: 'POST',
            url: '/api/authentication/signin',
            data: {
                email: email,
                password: pass,
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
            url: 'api/account/vieworders'
        });
    };

    return publicFunctions;
});
