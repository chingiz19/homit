app.service('user', function ($cookies, $http) {

    var publicFunctions = {};


    publicFunctions.isUserLogged = function () {
        if (getUser()) {
            return true;
        } else {
            return false;
        }
    };


    publicFunctions.getName = function () {
        if (!publicFunctions.isUserLogged()) {
            return undefined;
        }

        var user = getUser();
        return user.first_name;
    };

    publicFunctions.login = function (email, pass) {
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



    function getUser() {
        try {
            return JSON.parse($cookies.get("user").replace("j:", ""));
        } catch (e) {
            return false;
        }
    }


    return publicFunctions;
});
