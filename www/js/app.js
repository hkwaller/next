// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('next', ['ionic', 'next.controllers', 'next.services', 'next.filters', 'ngCordova.plugins.geolocation', 'ngCordova.plugins.statusbar'])

.run(function($ionicPlatform, $cordovaStatusbar) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
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
            templateUrl: 'templates/stations-overview.html',
            //      resolve: {
            //            mess:function($location)
            //            {
            //                var t=(sessionStorage.logged).toString();
            //                if(t=="true")
            //                {
            //                    $location.path('/home');
            //                    //redirectTo: '/home';
            //                }
            //            }
            //        }
        })

    .state('onboarding', {
        url: '/onboarding',
        controller: 'OnboardingCtrl',
        templateUrl: 'templates/onboarding.html'
    })

    $urlRouterProvider.otherwise("/stations-overview");

    $ionicConfigProvider.backButton.previousTitleText(false).text('');

})

