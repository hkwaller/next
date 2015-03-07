var api = require('/lib/api');

angular.module('next.services', [])

.factory('ApiService', function() {
  return api
})

.service('StationService', function() {
    var station;
    
    return {
        getStation: function() {
            return this.station
        },
        setStation: function(station) {
            this.station = station;
        }
    } 
})