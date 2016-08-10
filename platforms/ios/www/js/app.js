// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('next', ['ionic', 'next.controllers', 'next.services', 'next.filters', 'ngCordova.plugins.geolocation', 'ngCordova.plugins.statusbar'])

.run(function($rootScope, $ionicPlatform, $cordovaStatusbar, $location) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        $cordovaStatusbar.style(1);
    });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    
    $stateProvider
        .state('detail', {
            url: '/station-detail',
            controller: 'DetailCtrl',
            templateUrl: 'templates/station-detail.html'
        })
        .state('overview', {
            url: '/stations-overview',
            controller: 'OverviewCtrl',
            templateUrl: 'templates/stations-overview.html'
        })
        .state('search', {
            url: '/search',
            controller: 'SearchCtrl',
            templateUrl: 'templates/search.html'
        })
        .state('onboarding', {
            url: '/onboarding',
            controller: 'OnboardingCtrl',
            templateUrl: 'templates/onboarding.html',
            onEnter: function($state) {
                var store = window.localStorage.seenOnboarding;
                if (store) {
                    $state.go('overview');
                }
            }
        })

    $urlRouterProvider.otherwise("/onboarding");

    $ionicConfigProvider.backButton.previousTitleText(false).text('');

})

