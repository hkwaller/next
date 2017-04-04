angular.module('next.controllers', [])
.controller('OverviewCtrl', function($scope, $rootScope, $location, $ionicPlatform, $ionicLoading, $ionicScrollDelegate, $cordovaGeolocation, $ionicViewSwitcher, $timeout, ApiService, StationService, HttpService) {
    $scope.stations = [];

    $rootScope.cancel = $ionicLoading.hide();
    $scope.hasStations = true;

    $ionicLoading.show({
        template: 'Laster inn stasjoner...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner></div>'
    });

    var lat;
    var lng;

    var NUM_STATIONS = 15;
    
    $ionicPlatform.ready(function() {
        $cordovaGeolocation.getCurrentPosition()
            .then(function(position) {
                lat = position.coords.latitude;
                lng = position.coords.longitude;

                // Oslo: 59.932624, 10.734738
                // Ytterby: 57.863906199999995 11.9110967

                console.log("Coordinates from cordova geolocation", lat, lng);

                if ((lng + "").substr(0, 4) === "11.9") {
                    lat = 59.932624;
                    lng = 10.734738;

                    console.log("But since you are in Ytterby we'll use", lat, lng, "instead! :)");
                }

                var preferredStation = HttpService.getPreferredStation(lat, lng);

                if (preferredStation) {
                    $ionicViewSwitcher.nextTransition('none');
                    StationService.setStation(preferredStation);
                    $location.path('/station-detail');
                }
                getStationsFromApi(lat, lng);
                $ionicLoading.hide();

            }, function(err) {
                console.log("Error getting current position! :(", err);
            });
    });

    $ionicPlatform.on('resume', function() {
        $cordovaGeolocation.getCurrentPosition()
            .then(function(position) {
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                getStationsFromApi(lat, lng);
            })
    })

    $scope.goToSearch = function() {
        $location.path('/search');
    }

    $scope.showOnboarding = function() {
        $location.path('/help');
    }

    $scope.goToStation = function(station) {
        if (station && lat && lng) {
            HttpService.preferStation(station, lat, lng);
            setTimeout(function() {
                getStationsFromApi(lat, lng);
            }, 1000)
        }

        StationService.setStation(station);
        $location.path('/station-detail');
    };


    function getStationsFromApi(lat, lng) {
        HttpService.getStations(lat, lng, 15).then(function(stations) {
            $scope.favorites = stations.favorites;
            $scope.regular = stations.regular;

            $scope.$broadcast('scroll.refreshComplete');
            $ionicScrollDelegate.scrollTop(true);

            $ionicLoading.hide();

            if (stations.regular.length === 0) $scope.hidden = false;
            else $scope.hidden = true;

            $scope.hasStations = stations.hasStations;
        });
    }

    $scope.refresh = function() {
        $ionicLoading.show({
            template: 'Laster inn stasjoner...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner></div>'
        });
        $cordovaGeolocation.getCurrentPosition()
            .then(function(position) {
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                getStationsFromApi(lat, lng);
            });
    };

    $scope.reset = function(station) {
        $ionicLoading.show({
            template: 'Fjerner favoritt... <div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner>'
        });
        HttpService.unpreferStation(station, lat, lng);
        getStationsFromApi(lat, lng);
    };

})

.controller('DetailCtrl', function($scope, $rootScope, $ionicSlideBoxDelegate, $ionicPlatform, $ionicLoading, $ionicScrollDelegate, $cordovaGeolocation, $timeout, HttpService, StationService, $filter) {
/*    $rootScope.cancel = $ionicLoading.hide();
*/
    $scope.hasDepartures = false;
    $scope.isLoaded = false;

    if (StationService.getStation() !== null) {
        $scope.selectedStation = StationService.getStation();
        getLinesFromApi({
            id: $scope.selectedStation.ID
        });
    }

    function getLinesFromApi(options) {
        $ionicLoading.show({
            template: 'Laster inn avganger...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner><br /></div>'
        });
        $cordovaGeolocation.getCurrentPosition()
            .then(function(position) {
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                HttpService.getDeparturesForStation(options, $scope.selectedStation, lat, lng).then(function(lines) {
                    $scope.favorites = lines.favorites;
                    $scope.regular = lines.regular;
                    $scope.isLoaded = true;
                    $scope.hasDepartures = lines.hasDepartures;
                    $scope.$broadcast('scroll.refreshComplete');
                    $ionicScrollDelegate.scrollTop(true);
                    $ionicLoading.hide();
                });;
            });
    }

    $scope.refresh = function(options) {
        $ionicLoading.show({
            template: 'Oppdaterer avganger...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner><br /><button class="button button-outline button-cancel-search" ng-click="$root.cancel()">Avbryt søk</button></div>'
        });
        getLinesFromApi({
            id: $scope.selectedStation.ID,
            force: true
        });
    };

    $scope.preferDeparture = function(departure) {
        console.log(departure);
        $ionicLoading.show({
            template: 'Lagrer favoritt... <div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner>'
        });
        $cordovaGeolocation.getCurrentPosition()
            .then(function(position) {
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                HttpService.preferDeparture(departure, $scope.selectedStation.Name, lat, lng);
                getLinesFromApi({
                    id: $scope.selectedStation.ID,
                });
            })
    };

    $ionicPlatform.on('resume', function() {
        $scope.refresh({
            showLoadingOverlay: true
        });
    });

    $scope.reset = function(departure) {
        var options = options || {};
        if (options.showLoadingOverlay) {
            $ionicLoading.show({
                template: 'Oppdaterer avganger...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner><br /><button class="button button-outline button-cancel-search" ng-click="$root.cancel()">Avbryt søk</button></div>'
            });
        }
        HttpService.unpreferDeparture(departure, lat, lng);
        getLinesFromApi({
            id: $scope.selectedStation.ID,
        });
    };
})

.controller('SearchCtrl', function($scope, $ionicLoading, $rootScope, HttpService, $cordovaGeolocation, $timeout, StationService, $location) {
    $scope.stations = [];
    $scope.searchString = "";
    $rootScope.cancel = $ionicLoading.hide;
    $scope.searchButtonTitle = "";

    $scope.recentSearches = HttpService.getRecentSearches();

    $scope.searched = false;

    $scope.search = function(stationName) {

       if (stationName.length > 0) {
          $scope.searchButtonTitle = "Tøm";
        }

        $scope.stations = [];
        if (stationName.length < 4) {
            $scope.searched = false;
            return;
        }
        
        $ionicLoading.show({
            scope: $scope,
            template: 'Søker...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner><br /></div>'
        });

        $cordovaGeolocation.getCurrentPosition()
            .then(function(position) {
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                HttpService.getStationByName(stationName, lat, lng).then(function(stations) {
                    $scope.stations = stations;
                    $ionicLoading.hide();
                    $scope.searched = true;
                });
            })
    }

    $scope.goToStation = function(station) {
        StationService.setStation(station);

        var found = false;
        $scope.recentSearches.map(function(searchedStation) {
            if (searchedStation.ID === station.ID) {
                found = true;
                return;
            }
        });

        if (!found) {
            $scope.recentSearches.push(station);
            HttpService.setRecentSearches(station);
        }

        $scope.searched = false;
        $location.path('/station-detail');
    };
})

.controller('OnboardingCtrl', function($scope, $location) {
    $scope.goToOverview = function() {
        window.localStorage['seenOnboarding'] = true;
        $location.path('/stations-overview');
    }
})

.controller('HelpCtrl', function($scope, $location) {
    $scope.goToOverview = function() {
        $location.path('/stations-overview');
    }

    
})
