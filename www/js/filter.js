angular.module('next.filters', [])

.filter('favouriteFilter', function() {
    return function(input) {        
        var toReturn = [];
        for (var i = 0; i < input.length; i++) {
            if (input[i].Preference > 0) {
                toReturn.push(input[i]);
            }    
        }
        return toReturn;
    }
})

.filter('noFavouriteFilter', function() {
    return function(input) {        
        var toReturn = [];
        for (var i = 0; i < input.length; i++) {
            if (input[i].Preference === 0) {
                toReturn.push(input[i]);
            }    
        }
        return toReturn;
    }
})

.filter('detailFilter', function() {
    return function(input) {        
        var toReturn = [];
        if (input === undefined) return;
        for (var i = 0; i < input.length; i++) {
            if (input[i].LineRef.length <= 2 && input[i].MinutesToDeparture < 15) {
                toReturn.push(input[i]);
            }    
        }
        return toReturn;
    }
});


