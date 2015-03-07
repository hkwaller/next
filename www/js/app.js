// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('next', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('index', {
    url: '/',
    controller: 'MainCtrl',
    templateUrl: 'templates/start.html'
  })
  
   $urlRouterProvider.otherwise("/");

})

.controller('MainCtrl', function($scope, $ionicSlideBoxDelegate) {
    $scope.lines = [
        {"number":17, "destination":"Rikshospitalet", "time":"22:55", "class":"line-17"},
        {"number":18, "destination":"Rikshospitalet", "time":"22:57", "class":"line-18"},
        {"number":37, "destination":"Ullevål Stadion", "time":"22:58", "class":"line-37"},
        {"number":54, "destination":"Sinsen", "time":"23:00", "class":"line-54"},
        {"number":17, "destination":"Rikshospitalet", "time":"23:05", "class":"line-17"}
    ];
    
    $scope.stations = [
        "Adamstuen", "Stensgata", "Colletts Gate", "Bislett"
    ];
    
    $scope.selectedStation = "";
    $scope.slideChanged = function(index) {
        $scope.selectedStation = $scope.stations[index];
    }
    
    $scope.refresh = function() {
        console.log("refreshing..");
    }
    
    $scope.calcTime = function(departureTime) {
        var now = new Date();
        var str = departureTime.split(":");
        var dep = new Date(2015, 2, 6, str[0], str[1]);

        var date1_ms = now.getTime();
        var date2_ms = dep.getTime();
        
        return Math.round((date2_ms - date1_ms)/(1000*60));
    }
    
});