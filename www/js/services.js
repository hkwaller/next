var api = require('/lib/api');

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs');

var stations_base_url = "http://api.trafikanten.no/ReisRest/Stop/GetClosestStopsByCoordinates/?coordinates=x=";
var departures_base_url = "http://api.trafikanten.no/ReisRest/RealTime/GetAllDepartures/"

var STATION_LIST_GEO_HASH_PRECISION = 8; // ≤ 38.2m × 19.1m
var PREFER_STATION_GEO_HASH_PRECISION = 7; // ≤ 153m  × 153m

var preferredStationsByGeoHash;
try {
    preferredStationsByGeoHash = JSON.parse(localStorage.getItem('preferred-stations')) || {};
} catch (error) {
    preferredStationsByGeoHash = {};
}

var preferredDepartures;
try {
    preferredDepartures = JSON.parse(localStorage.getItem('preferred-departures')) || {};
} catch (error) {
    preferredDepartures = {};
}

var recentSearches;
try {
    console.log(JSON.parse(localStorage.getItem('recent-searches')));
    recentSearches = JSON.parse(localStorage.getItem('recent-searches')) || [];
} catch (error) {
    recentSearches = [];
}

angular.module('next.services', [])

.factory('ApiService', function() {
    return api
})

.factory('HttpService', function($http) {
  var myService = {
    getStations: function(lat, lng, numberOfStops) {
        var coords = proj4('EPSG:25832', {
            x: lng,
            y: lat
        });

        var url = stations_base_url + Math.round(coords.x) + ",y=" + Math.round(coords.y) + "&proposals=" + numberOfStops;
        var promise = $http.get(url).then(function (stations) {
            var obj = {
                favorites: [],
                regular: [],
                hasStations: false
            }
            stations.data.forEach(function(station, index) {
                var latLngXY = proj4('EPSG:25832', 'WGS84', {
                x: station.X,
                y: station.Y
            });

            station.Distance = geolib.getDistance({
                latitude: lat,
                longitude: lng
            }, {
                latitude: latLngXY.y,
                longitude: latLngXY.x
            });

            var geoHash = geohash.encode(lng, lat, PREFER_STATION_GEO_HASH_PRECISION);
            station.Preference = (
                preferredStationsByGeoHash[geoHash] &&
                preferredStationsByGeoHash[geoHash][station.ID] &&
                preferredStationsByGeoHash[geoHash][station.ID].preference
            ) ||  0;

            station.Index = index;

            station.ServedBy = [];
            station.Lines.forEach(function(lineVal, lineKey) {
                if (lineVal.LineID < 10 && (station.ServedBy.indexOf("sub") === -1)) {
                    station.ServedBy.push("sub");
                    return;
                } else if (lineVal.LineID > 10 && lineVal.LineID < 20 && (station.ServedBy.indexOf("trikk") === -1)) {
                    station.ServedBy.push("trikk");
                    return;
                } else if (lineVal.LineID >= 20 && lineVal.LineID < 100 && (station.ServedBy.indexOf("buss") === -1)) {
                    station.ServedBy.push("buss");
                    return;
                } else if (lineVal.LineID > 200 && lineVal.LineID < 1000 && (station.ServedBy.indexOf("greenbus") === -1)) {
                    station.ServedBy.push("greenbus");
                    return;
                }
            });

            if (station.Preference > 0) {
                obj.favorites.push(station);
            } else {
                obj.regular.push(station);
            }

            });

            if ((obj.favorites.length + obj.regular.length) > 0) obj.hasStations = true;

            return obj;
        });
        return promise;
    },
    getDeparturesForStation(options, station, lat, lng) {
        if (typeof options !== 'object') throw new Error('Options object required');

        var ID = options.id;

        var coords = proj4('EPSG:25832', {
            x: lng,
            y: lat
        });
        
        var url = departures_base_url + "" + ID;
        var promise = $http.get(url).then(function(departures) {
            var obj = {
                favorites: [],
                regular: [],
                hasDepartures: false
            }

            departures.data.map(function(departure, index) {
                departure.MinutesToDeparture = moment(departure.ExpectedDepartureTime).diff(moment(), 'minutes');
                var id = "" + departure.LineRef + departure.DestinationRef;

                var geoHash = geohash.encode(lng, lat, PREFER_STATION_GEO_HASH_PRECISION);
                departure.Preference = (
                    preferredDepartures[geoHash] &&
                    preferredDepartures[geoHash][id] &&
                    preferredDepartures[geoHash][id].Preference
                ) ||  0;
                if (departure.Preference > 0) {
                    obj.favorites.push(departure)
                } else {
                    obj.regular.push(departure)
                }
            });

            obj.regular = obj.regular.slice(0,20);

            if ((obj.favorites.length + obj.regular.length) > 0) obj.hasDepartures = true;

            return obj;
        });

        return promise;
    },
    preferStation(station, lat, lng) {
        var geoHash = geohash.encode(lng, lat, PREFER_STATION_GEO_HASH_PRECISION);
        if (!(geoHash in preferredStationsByGeoHash)) {
            preferredStationsByGeoHash[geoHash] = {};
        }

        if (!(station.ID in preferredStationsByGeoHash[geoHash])) {
            preferredStationsByGeoHash[geoHash][station.ID] = {
                station: station,
                preference: 0
            };
        }

        preferredStationsByGeoHash[geoHash][station.ID].preference++;
        localStorage.setItem('preferred-stations', JSON.stringify(preferredStationsByGeoHash));
    },
    unpreferStation(station, lat, lng) {
        var geoHash = geohash.encode(lng, lat, PREFER_STATION_GEO_HASH_PRECISION);

        if (
            geoHash in preferredStationsByGeoHash &&
            station.ID in preferredStationsByGeoHash[geoHash]
        ) {
            delete preferredStationsByGeoHash[geoHash][station.ID];
        }

        localStorage.setItem('preferred-stations', JSON.stringify(preferredStationsByGeoHash));
    },
    getPreferredStation(lat, lng) {
        var geoHash = geohash.encode(lng, lat, PREFER_STATION_GEO_HASH_PRECISION);
        var preferredStations = preferredStationsByGeoHash[geoHash];
        var largestPreference = 0;
        var preferredStation = null;
        if (preferredStations) {
            Object.keys(preferredStations).forEach(function(ID) {
                if (preferredStations[ID].preference > largestPreference) {
                    largestPreference = preferredStations[ID].preference;
                    preferredStation = preferredStations[ID].station;
                }
            });
        }
        return preferredStation;
    },
    preferDeparture(departure, stationName, lat, lng) {
        var geoHash = geohash.encode(lng, lat, PREFER_STATION_GEO_HASH_PRECISION);
        if (!(geoHash in preferredDepartures)) {
            preferredDepartures[geoHash] = {};
        }

        var departureObject = {
            ID: "" + departure.LineRef + departure.DestinationRef,
            LineRef: departure.LineRef,
            DestinationName: departure.DestinationName,
            Preference: 0
        }

        var found = false;
        Object.keys(preferredDepartures[geoHash]).map(function(key) {
            if (departureObject.ID === key) {
                found = true;
            }
        });

        if (!found) {
            preferredDepartures[geoHash][departureObject.ID] = departureObject;
        }

        preferredDepartures[geoHash][departureObject.ID].Preference++;
        localStorage.setItem('preferred-departures', JSON.stringify(preferredDepartures));
    },
    unpreferDeparture(departure, lat, lng) {
        var geoHash = geohash.encode(lng, lat, PREFER_STATION_GEO_HASH_PRECISION);

        var departureObject = {
            ID: "" + departure.LineRef + departure.DestinationRef,
            LineRef: departure.LineRef,
            DestinationName: departure.DestinationName,
            Preference: 0
        }

        var found = false;
        Object.keys(preferredDepartures[geoHash]).map(function(key) {
            if (departureObject.ID === key) {
                found = true;
            }
        });

        if (found) {
            delete preferredDepartures[geoHash][departureObject.ID];
        }

        localStorage.setItem('preferred-stations', JSON.stringify(preferredDepartures));
    },
    getStationByName(searchString, lat, lng) {
        var stations = [];
        var filteredStations = [];
        var url = "http://api.trafikanten.no/ReisRest/Place/FindPlaces/" + searchString;

        var promise = $http.get(url).then(function (stations) {
            var coords = proj4('EPSG:25832', {
                x: lng,
                y: lat
            });
            
            stations.data.forEach(function(station, index) {
                if (station.__type) {
                    if (station.__type.indexOf("Stop:") > -1) {
                        var latLngXY = proj4('EPSG:25832', 'WGS84', {
                            x: station.X,
                            y: station.Y
                        });

                        station.Distance = geolib.getDistance({
                            latitude: lat,
                            longitude: lng
                        }, {
                            latitude: latLngXY.y,
                            longitude: latLngXY.x
                        });

                        station.Index = index;

                        if (station.Distance < 10000) {
                            filteredStations.push(station);
                        }
                    }
                }
            });

            filteredStations.sort(function(a, b) {
                var dPreference = b.Preference - a.Preference;
                var dIndex = a.Index - b.Index;
                return dPreference === 0 ? dIndex : dPreference;
            });

            return filteredStations;

        });
    return promise;
    },
    getRecentSearches() {
        return recentSearches;
    },
    setRecentSearches(searched) {
        if (searched === undefined) return;
        var recentSearches = JSON.parse(localStorage.getItem('recent-searches'));

        if (recentSearches === null) {
            recentSearches = [];
        }

        recentSearches.push(searched);

        localStorage.setItem('recent-searches', JSON.stringify(recentSearches));
    },
  };
  return myService;
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
