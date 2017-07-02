var app = angular.module('mainModule', ["ngRoute", "ngCookies"])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });
