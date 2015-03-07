// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('next', ['ionic', 'next.services', 'next.filters', 'ngCordova.plugins.geolocation'])

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
  });
  
   $urlRouterProvider.otherwise("/station-overview");
})

.controller('DetailCtrl', function($scope, $ionicSlideBoxDelegate, $ionicPlatform, $cordovaGeolocation, ApiService, StationService) {
    
    ApiService.getStationList(59.932624, 10.734738, 5, console.log.bind(console));

    if (StationService.getStation() != null) {
        $scope.selectedStation = StationService.getStation();
        getLinesFromApi($scope.selectedStation.ID);
    }

    function getLinesFromApi(id) {
        ApiService.getDeparturesForStation(id, (function(err, lines) {
            $scope.lines = lines;
            $scope.$apply();
        }));
    }

    $scope.activeIndex = 0;
    $scope.slideChanged = function(index) {
        $scope.selectedStation = $scope.stations[index];
        $scope.activeIndex = index;
    };

    $scope.refresh = function() {
        getLinesFromApi($scope.selectedStation.ID);
        $scope.$broadcast('scroll.refreshComplete');
    };

})

.controller('OverviewCtrl', function($scope, $location, $ionicPlatform, $cordovaGeolocation, ApiService, StationService) {
    
    $scope.stations = [];

    $ionicPlatform.ready(function() {
        $cordovaGeolocation.getCurrentPosition()
            .then(function (position) {
              var lat  = position.coords.latitude;
              var lng = position.coords.longitude;

              // Oslo: 59.932624, 10.734738
              // Ytterby: 57.863906199999995 11.9110967

              console.log("Coordinates from cordova geolocation",lat,lng);

              if ((lng+"").substr(0,4)==="11.9"){
                lat = 59.932624;
                lng = 10.734738;
                console.log("But since you are in Ytterby we'll use",lat,lng,"instead! :)");
              }

              ApiService.getStationList(lat, lng, 5, function(err, stations) {
                  $scope.stations = stations;
                  $scope.$apply();
              });

            }, function(err) {
              console.log("Error getting current position! :(",err);
            });
    });
    
    $scope.goToStation = function(station) {
        StationService.setStation(station);        
        $location.path('/station-detail');
    };
    
});
