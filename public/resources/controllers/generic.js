var app = angular.module('mainModule', ["ngRoute", "ngCookies", "ngMaterial", "ngMessages"])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });