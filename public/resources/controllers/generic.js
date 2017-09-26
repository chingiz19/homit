var app = angular.module('mainModule', ["ngRoute", "ngCookies", "ngMaterial", "ngMessages", "ngMdIcons"])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });