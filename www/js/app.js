// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('next', ['ionic', 'next.services', 'next.filters', 'ngCordova.plugins.geolocation', 'ngCordova.plugins.statusbar'])

.run(function($ionicPlatform, $cordovaStatusbar) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
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
    
    $ionicPlatform.on('resume', function() {
        $cordovaGeolocation.getCurrentPosition()
            .then(function (position) {
              lat  = position.coords.latitude;
              lng = position.coords.longitude;
              getStationsFromApi(lat, lng, 15);
        })
    })

    $scope.goToStation = function(station) {
        if (station && lat && lng) {
          ApiService.preferStation(station, lat, lng);
          setTimeout(function() {
            getStationsFromApi(lat, lng, 15);
          }, 1000)
        }
        StationService.setStation(station);
        $location.path('/station-detail');
    };
    
    
    function getStationsFromApi(lat, lng, count) {
        ApiService.getStationList(lat, lng, count, function(err, stations) {
          $timeout(function() {
              angular.forEach(stations, function(val, key) {
                val.ServedBy = [];
                angular.forEach(val.Lines, function(lineVal, lineKey) {
                    if (lineVal.LineID < 10 && (val.ServedBy.indexOf("sub") === -1)) {
                        val.ServedBy.push("sub");
                        return;
                    } else if (lineVal.LineID > 10 && lineVal.LineID < 20 && (val.ServedBy.indexOf("trikk") === -1)) {
                        val.ServedBy.push("trikk");
                        return;
                    } else if (lineVal.LineID >= 20 && lineVal.LineID < 100 && (val.ServedBy.indexOf("buss") === -1)) {
                        val.ServedBy.push("buss");
                        return;
                    } else if (lineVal.LineID > 200 && lineVal.LineID < 1000 && (val.ServedBy.indexOf("greenbus") === -1)) {
                        val.ServedBy.push("greenbus");
                        return;
                    }
                })
              })
              $scope.stations = stations;
              $scope.$apply();
              if (stations.length === 0) $scope.hidden = false;
              else $scope.hidden = true;
          })
      });
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
        ApiService.unpreferStation(station, lat, lng);
        getStationsFromApi(lat, lng, 15);
    };

})
    
.controller('DetailCtrl', function($scope, $ionicSlideBoxDelegate, $ionicPlatform, $ionicLoading, $cordovaGeolocation, $timeout, ApiService, StationService, $filter) {
    
    $ionicLoading.show({
      template: 'Laster inn avganger...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner></div>'
    });
    
    $scope.hidden = true;
    
    if (StationService.getStation() !== null) {
        $scope.selectedStation = StationService.getStation();
        getLinesFromApi($scope.selectedStation.ID);
    }

    function getLinesFromApi(id) {
        ApiService.getDeparturesForStation(id, (function(err, lines) {
            $timeout(function() {
                $scope.lines = lines;
                $scope.$apply();
                if (lines.length === 0 || $filter('detailFilter')(lines).length === 0) $scope.hidden = false
                else $scope.hidden = true;
                
                $ionicLoading.hide();
            });
        }));
    }
    
    $ionicPlatform.on('resume', function() {
        $ionicLoading.show({
          template: 'Oppdaterer avganger...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner></div>'
        });
        getLinesFromApi($scope.selectedStation.ID);
    })

    $scope.refresh = function() {
        getLinesFromApi($scope.selectedStation.ID);
        $scope.$broadcast('scroll.refreshComplete');
    };

}).controller('OnboardingCtrl', function($scope, $location) {
    $scope.goToOverview = function() {
        $location.path('/stations-overview');
    }
})


