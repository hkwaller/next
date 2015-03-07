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
    controller: 'DetailCtrl',
    templateUrl: 'templates/station-detail.html'
  })
  .state('overview', {
    url: '/station-overview',
    controller: 'OverviewCtrl',
    templateUrl: 'templates/stations-overview.html'
  })
  
   $urlRouterProvider.otherwise("/station-overview");
})

.controller('DetailCtrl', function($scope, $ionicSlideBoxDelegate, $ionicPlatform, $cordovaGeolocation, ApiService, StationService) {
    
    ApiService.getStationList(59.932624, 10.734738, 5, console.log.bind(console));

    if (StationService.getStation() !== null) {
        $scope.selectedStation = StationService.getStation();
        ApiService.getDeparturesForStation($scope.selectedStation.ID, (function(err, lines) {
            $scope.lines = lines;
            console.log($scope.lines);
            $scope.$apply();
        }));
    }

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

.controller('OverviewCtrl', function($scope, $location, ApiService, StationService) {
    
    $scope.stations = [];

    ApiService.getStationList(59.932624, 10.734738, 5, (function(err, stations) {
        $scope.stations = stations;
        $scope.$apply();
    }));
    
    $scope.goToStation = function(station) {
        StationService.setStation(station);        
        $location.path('/station-detail');
    }
    
});
