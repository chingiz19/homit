var app = angular.module('mainModule', ["ngRoute", "ngCookies", "ngMaterial", "ngMessages", "ngMdIcons", "ngSanitize"])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    })

    // Set up CSRF Header for AJAX calls
    .run(function($http, $cookies){
        $http.defaults.headers.post['CSRF-TOKEN'] = $cookies.get("csrf-token");
    })

app.filter("capitalize", function(){
    return function(str){
        var s = "";
        for (var i = 0; i < str.length; i++){
            s += str.charAt(i);
            if (i==0){
                s = s.toUpperCase();
            }
        }
        return s;
    }
});