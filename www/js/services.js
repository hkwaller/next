var api = require('/lib/api');

angular.module('next.services', [])

.factory('ApiService', function() {
  return api
})
