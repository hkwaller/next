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

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
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
    
    $ionicConfigProvider.backButton.previousTitleText(false).text('');

})
    
.controller('OverviewCtrl', function($scope, $location, $ionicPlatform, $ionicLoading, $cordovaGeolocation, $ionicViewSwitcher, $timeout, ApiService, StationService) {
    $scope.stations = [];
        $ionicLoading.show({
      template: 'Laster inn stasjoner...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner></div>'
    });
    
    var lat;
    var lng;
    
    $ionicPlatform.ready(function() {
        $cordovaGeolocation.getCurrentPosition()
            .then(function (position) {
              lat  = position.coords.latitude;
              lng = position.coords.longitude;

              // Oslo: 59.932624, 10.734738
              // Ytterby: 57.863906199999995 11.9110967

              console.log("Coordinates from cordova geolocation",lat,lng);

              if ((lng+"").substr(0,4)==="11.9"){
                lat = 59.932624;
                lng = 10.734738;
                console.log("But since you are in Ytterby we'll use",lat,lng,"instead! :)");
              }

              var preferredStation = ApiService.getPreferredStation(lat, lng);
              if (preferredStation) {
                $ionicViewSwitcher.nextTransition('none');
                StationService.setStation(preferredStation);
                $location.path('/station-detail');
              }
              getStationsFromApi(lat, lng, 15);
            $ionicLoading.hide();

            }, function(err) {
              console.log("Error getting current position! :(",err);
            });
    });
    
    $scope.goToStation = function(station) {
        if (station && lat && lng) {
          ApiService.preferStation(station, lat, lng);
        }
        StationService.setStation(station);
        $location.path('/station-detail');
    };
    
    function getStationsFromApi(lat, lng, count) {
        ApiService.getStationList(lat, lng, count, function(err, stations) {
          $timeout(function() {
              $scope.stations = stations;
              $scope.$apply();
          })
      });
    }
    
    $scope.servedByTram = function(station) {
        for (var i = 0; i < station.Lines.length; i++) {
            if (station.Lines[i].LineID > 10 && station.Lines[i].LineID < 20) {
                return true;
            }
        }
        return false;
      }     
    
    $scope.servedByBus = function(station) {
        for (var i = 0; i < station.Lines.length; i++) {
            if (station.Lines[i].LineID > 20 && station.Lines[i].LineID < 100) {
                return true;
            }
        }
        
        return false;
      } 
    
     $scope.servedBySub = function(station) {
        for (var i = 0; i < station.Lines.length; i++) {
            if (station.Lines[i].LineID < 10) {
                return true;
            }
        }
        
        return false;
      }     
    
    $scope.refresh = function() {
        $cordovaGeolocation.getCurrentPosition()
            .then(function (position) {
              lat  = position.coords.latitude;
              lng = position.coords.longitude;
              getStationsFromApi(lat, lng, 15);
        })
        $scope.$broadcast('scroll.refreshComplete');
    };
    

    $scope.reset = function(station) {
        console.log("resetting..");
        ApiService.unpreferStation(station, lat, lng);
        getStationsFromApi(lat, lng, 15);
    };

})
    
.controller('DetailCtrl', function($scope, $ionicSlideBoxDelegate, $ionicPlatform, $ionicLoading, $cordovaGeolocation, $timeout, ApiService, StationService) {
    
    $ionicLoading.show({
      template: 'Laster inn avganger...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner></div>'
    });
    
    if (StationService.getStation() != null) {
        $scope.selectedStation = StationService.getStation();
        getLinesFromApi($scope.selectedStation.ID);
    }

    function getLinesFromApi(id) {
        ApiService.getDeparturesForStation(id, (function(err, lines) {
            $timeout(function() {
                $scope.lines = lines;
                $scope.$apply();
                $ionicLoading.hide();
            });
        }));
    }

    $scope.refresh = function() {
        getLinesFromApi($scope.selectedStation.ID);
        $scope.$broadcast('scroll.refreshComplete');
    };

})


