var proj4 = require('proj4');
var request = require('superagent');
var geolib = require('geolib');
var moment = require('moment');
var GeoHash = require('geo-hash');
var StorageLRU = require('storage-lru').StorageLRU;
var asyncify = require('storage-lru').asyncify;

var STATION_LIST_TIMEOUT = 20000;
var DEPARTURES_TIMEOUT = 20000;

var STATION_LIST_GEO_HASH_PRECISION = 8; // ≤ 38.2m × 19.1m
var PREFER_STATION_GEO_HASH_PRECISION = 7; // ≤ 153m  × 153m

if (!global.localStorage) {
    global.localStorage = require('localStorage');
}

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs');

var preferredStationsByGeoHash;
try {
    preferredStationsByGeoHash = JSON.parse(localStorage.getItem('preferred-stations')) || {};
} catch (error) {
    preferredStationsByGeoHash = {};
}

var lruCache = new StorageLRU(asyncify(localStorage));

/*
 * Feed in latitude, longitude and number of wanted stops, will call callback with (err,result)
 * where result is an array of station objects. For example of a station object, see below!
 */
exports.getStationList = function(lat, lng, numberofstops, callback) {

    var cacheKey = 'getStationList:' + GeoHash.encode(lng, lat, STATION_LIST_GEO_HASH_PRECISION) + ':' + numberofstops;

    var coords = proj4('EPSG:25832', {
        x: lng,
        y: lat
    });
    var url = "https://crossorigin.me/http://reis.ruter.no/reisrest/stop/getcloseststopsbycoordinates/?coordinates=(x=" + Math.round(coords.x) + ",y=" + Math.round(coords.y) + ")&proposals=" + numberofstops;

    request
        .get(url)
        .timeout(STATION_LIST_TIMEOUT)
        .end(function(err, res) {
            if (err) return callback(err);

            var stations = res.body;

            lruCache.setItem(cacheKey, stations, {
                json: true,
                cacheControl: 'max-age=' + (86400 * 30),
            }, function(error) {
                if (error) throw error;
            });

            callback(null, augmentStations(stations));
        });

    function augmentStations(stations) {
        stations.forEach(function(station, index) {
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

            var geoHash = GeoHash.encode(lng, lat, PREFER_STATION_GEO_HASH_PRECISION);
            station.Preference = (
                preferredStationsByGeoHash[geoHash] &&
                preferredStationsByGeoHash[geoHash][station.ID] &&
                preferredStationsByGeoHash[geoHash][station.ID].preference
            ) ||  0;
            station.Index = index;
        });

        stations.sort(function(a, b) {
            var dPreference = b.Preference - a.Preference;
            var dIndex = a.Index - b.Index;
            return dPreference === 0 ? dIndex : dPreference;
        });

        return stations;
    }
};



/*
 * Feed in an options object containing a station id, will call callback with (err,result) where result
 * is an array of departures. For example of a departure object, see below!
 */
exports.getDeparturesForStation = function(options, callback) {

    var ID = options.id;

    request.get("http://crossorigin.me/http://reisapi.ruter.no/StopVisit/GetDepartures/" + ID)
    .timeout(DEPARTURES_TIMEOUT)
    .end(function(err, res) {
      if (err) return callback(err);

      var departures = res.body;

      callback(null, augmentDepartures(departures));
    });

    function augmentDepartures(departures) {
        return (departures || []).map(function(departure) {
            departure.MonitoredVehicleJourney.MinutesToDeparture = moment(departure.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime).diff(moment(), 'minutes');
            return departure.MonitoredVehicleJourney;
        });
    }
};

exports.preferStation = function(station, lat, lng) {
    var geoHash = GeoHash.encode(lng, lat, PREFER_STATION_GEO_HASH_PRECISION);
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
};


exports.unpreferStation = function(station, lat, lng) {
    var geoHash = GeoHash.encode(lng, lat, PREFER_STATION_GEO_HASH_PRECISION);

    if (
        geoHash in preferredStationsByGeoHash &&
        station.ID in preferredStationsByGeoHash[geoHash]
    ) {
        delete preferredStationsByGeoHash[geoHash][station.ID];
    }

    localStorage.setItem('preferred-stations', JSON.stringify(preferredStationsByGeoHash));
};


exports.getPreferredStation = function(lat, lng) {
    var geoHash = GeoHash.encode(lng, lat, PREFER_STATION_GEO_HASH_PRECISION);
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
};

exports.getStationByName = function(searchString, lat, lng, callback) {
//
    var stations = [];
    var filteredStations = [];
    var url = "https://crossorigin.me/http://api.trafikanten.no/ReisRest/Place/FindPlaces/" + searchString;
    request
        .get(url)
        .timeout(STATION_LIST_TIMEOUT)
        .end(function(err, res) {
            if (err) return callback(err);
            stations = res.body;
            callback(null, augmentStations(stations));
        });

    var coords = proj4('EPSG:25832', {
                x: lng,
                y: lat
            });

    function augmentStations(stations) {
        stations.forEach(function(station, index) {
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

    }
};

// *************** Test ****************************

// exports.getStationList(59.932624, 10.734738, 5, console.log.bind(console));
// exports.getDeparturesForStation(3010314, console.log.bind(console));


// *************** Example data ****************************

var stationExample = {
    Distance: 45, // Distance in meters, hacked in by töntcop
    District: "Oslo",
    ID: 3010314, // This id is what is used in getDeparturesForStation
    Name: "Adamstuen",
    Rank: 0,
    ShortName: "AD",
    Stops: [],
    Type: 0,
    X: 596949,
    Y: 6645178,
    Zone: "1",
    AlightingAllowed: false,
    ArrivalTime: null,
    BoardingAllowed: false,
    DepartureTime: null,
    Deviations: [],
    Lines: [],
    RealTimeStop: true,
    StopPoints: [],
    WalkingDistance: 0
};

var departureExample = {
    MinutesToDeparture: 5, // hacked in by tuffvid
    AimedArrivalTime: "/Date(1425677880000+0100)/",
    AimedDepartureTime: "/Date(1425677880000+0100)/",
    ArrivalBoardingActivity: null,
    BlockRef: "1716",
    Delay: "PT0S",
    DepartureBoardingActivity: null,
    DeparturePlatformName: "11",
    DestinationDisplay: "Ljabru",
    DestinationName: "Ljabru",
    DestinationRef: 3010870,
    DirectionName: "1",
    DirectionRef: "1",
    ExpectedArrivalTime: "/Date(1425677880000+0100)/",
    ExpectedDepartureTime: "/Date(1425677880000+0100)/",
    Extensions: {
        Deviations: [{
            Header: "Trikk 18/19: Holdeplassen St. Halvards plass flyttes 100 meter tilbake",
            ID: 30022
        }],
        OccupancyData: {
            OccupancyAvailable: false,
            OccupancyPercentage: 0
        }
    },
    FramedVehicleJourneyRef: {
        DataFrameRef: "2015-03-06",
        DatedVehicleJourneyRef: "67409"
    },
    InCongestion: false,
    LineRef: "18",
    Monitored: true,
    OperatorRef: "Sporvognsdrift",
    OriginName: "Rikshospitalet",
    OriginRef: "3012324",
    PublishedLineName: "18",
    StopVisitNote: null,
    TrainBlockPart: null,
    VehicleAtStop: false,
    VehicleFeatureRef: "lowFloor",
    VehicleJourneyName: "18815",
    VehicleMode: 3,
    VehicleRef: "200159",
    ViaName1: null,
    VisitNumber: 7
};
