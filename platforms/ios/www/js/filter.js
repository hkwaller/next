angular.module('next.filters', [])

.filter('detailFilter', function() {
    return function(input) {
        return (input || []).filter(function(line) {
            return line.PublishedLineName.length <= 3 && line.MinutesToDeparture < 20;
        });
    }
})

.filter('maxCharFilter', function() {
    return function(input) {
        if (input === undefined) return;
        return input.substr(0, 30);
    }
});
