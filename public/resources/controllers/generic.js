var app = angular.module('mainModule', ["ngRoute", "ngCookies", "ngMaterial", "ngMessages", "ngMdIcons"])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });

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