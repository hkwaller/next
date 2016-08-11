angular.module('next.filters', [])

.filter('favouriteFilter', function() {
    return function(input) {
        return (input || []).filter(function(station) {
            return station.Preference > 0;
        });
    }
})

.filter('noFavouriteFilter', function() {
    return function(input) {
        return (input || []).filter(function(station) {
            return station.Preference === 0;
        });
    }
})

.filter('favouriteDepartureFilter', function() {
    return function(input) {
        return (input || []).filter(function(departure) {
            return departure.Preference > 0;
        });
    }
})

.filter('noFavouriteDepartureFilter', function() {
    return function(input) {
        return (input || []).filter(function(departure) {
            return departure.Preference === 0;
        });
    }
})



.filter('detailFilter', function() {
    return function(input) {
        return (input || []).filter(function(line) {
            return line.LineRef.length <= 3 && line.MinutesToDeparture < 20 && line.LineRef < 500;
        });
    }
})

.filter('maxCharFilter', function() {
    return function(input) {
        if (input === undefined) return;
        return input.substr(0, 30);
    }
});
