angular.module('next.controllers', [])
.controller('OverviewCtrl', function($scope, $location, $ionicPlatform, $ionicLoading, $ionicScrollDelegate, $cordovaGeolocation, $ionicViewSwitcher, $timeout, ApiService, StationService) {
    $scope.stations = [];
    $ionicLoading.show({
        template: 'Laster inn stasjoner...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner></div>'
    });

    var lat;
    var lng;
    
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

                var preferredStation = ApiService.getPreferredStation(lat, lng);
                if (preferredStation) {
                    $ionicViewSwitcher.nextTransition('none');
                    StationService.setStation(preferredStation);
                    $location.path('/station-detail');
                }
                getStationsFromApi(lat, lng, 15);
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

                $scope.$broadcast('scroll.refreshComplete');
                $ionicScrollDelegate.scrollTop(true);

                if (stations.length === 0) $scope.hidden = false;
                else $scope.hidden = true;
            })
        });
    }

    $scope.refresh = function() {
        $cordovaGeolocation.getCurrentPosition()
            .then(function(position) {
                lat = position.coords.latitude;
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

.controller('DetailCtrl', function($scope, $ionicSlideBoxDelegate, $ionicPlatform, $ionicLoading, $ionicScrollDelegate, $cordovaGeolocation, $timeout, ApiService, StationService, $filter) {

    $ionicLoading.show({
        template: 'Laster inn avganger...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner></div>'
    });

    $scope.hasDepartures = false;
    $scope.isLoaded = false;

    if (StationService.getStation() !== null) {
        $scope.selectedStation = StationService.getStation();
        getLinesFromApi({
            id: $scope.selectedStation.ID
        });                
    }
    
    function getLinesFromApi(options) {
        ApiService.getDeparturesForStation(options, (function(err, lines) {
            $timeout(function() {
                $scope.lines = lines;
                $scope.isLoaded = true;
                $scope.hasDepartures = $filter('detailFilter')(lines).length > 0;
                $scope.$apply();

                $scope.$broadcast('scroll.refreshComplete');
                $ionicScrollDelegate.scrollTop(true);
                $ionicLoading.hide();
            });
        }));
    }

    $scope.refresh = function(options) {
        var options = options || {};
        if (options.showLoadingOverlay) {
            $ionicLoading.show({
                template: 'Oppdaterer avganger...<div class="loading-icon"><ion-spinner icon="spiral" class="spinner-positive"></ion-spinner></div>'
            });
        }
        getLinesFromApi({
            id: $scope.selectedStation.ID,
            force: true
        });
    };

    $ionicPlatform.on('resume', function() {
        $scope.refresh({
            showLoadingOverlay: true
        });
    })


}).controller('OnboardingCtrl', function($scope, $location) {
    $scope.goToOverview = function() {
        window.localStorage['seenOnboarding'] = true;
        $location.path('/stations-overview');
    }
})
