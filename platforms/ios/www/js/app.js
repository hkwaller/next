// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('next', ['ionic', 'next.services', 'ngCordova.plugins.geolocation'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('detail', {
    url: '/station-detail',
    controller: 'MainCtrl',
    templateUrl: 'templates/station-detail.html'
  })
  .state('overview', {
    url: '/station-overview',
    controller: 'OverviewCtrl',
    templateUrl: 'templates/stations-overview.html'
  })
  
   $urlRouterProvider.otherwise("/station-overview");
})

.controller('MainCtrl', function($scope, $ionicSlideBoxDelegate, $ionicPlatform, $cordovaGeolocation, ApiService) {

    ApiService.getStationList(59.932624, 10.734738, 5, console.log.bind(console));

    $scope.lines = [
        {"number":17, "destination":"Rikshospitalet", "time":"06:31", "class":"line-17"},
        {"number":18, "destination":"Rikshospitalet", "time":"22:57", "class":"line-18"},
        {"number":37, "destination":"Ullevål Stadion", "time":"22:58", "class":"line-37"},
        {"number":54, "destination":"Sinsen", "time":"23:00", "class":"line-54"},
        {"number":17, "destination":"Rikshospitalet", "time":"23:05", "class":"line-17"}
    ];

    $ionicPlatform.ready(function() {
        $cordovaGeolocation.getCurrentPosition()
            .then(function (position) {
              var lat  = position.coords.latitude
              var long = position.coords.longitude
              console.log(lat + " " + long);
            }, function(err) {
              // error
        });
    });

    $scope.stations = [
        "Adamstuen", "Stensgata", "Colletts Gate", "Bislett"
    ];

    $scope.selectedStation = "";
    $scope.activeIndex = 0;
    $scope.slideChanged = function(index) {
        $scope.selectedStation = $scope.stations[index];
        $scope.activeIndex = index;
    }

    $scope.refresh = function() {
        console.log("refreshing..");
    }

    $scope.calcTime = function(departureTime) {
        var now = new Date();
        var str = departureTime.split(":");
        var dep = new Date(2015, 2, 7, str[0], str[1]);

        var date1_ms = now.getTime();
        var date2_ms = dep.getTime();

        var diff = Math.round((date2_ms - date1_ms)/(1000*60));
        if (diff < 10 && diff !== 0) return diff + " min";
        else if (diff === 0 || diff === -0) return "Nå";
        else return departureTime;
    }

})

.controller('OverviewCtrl', function($scope, ApiService) {
    
    $scope.stations = [];
    
    ApiService.getStationList(59.932624, 10.734738, 5, (function(err, stations) {
        $scope.stations = stations;
        console.log($scope.stations);
        $scope.$apply();
    }));
    
    
});
