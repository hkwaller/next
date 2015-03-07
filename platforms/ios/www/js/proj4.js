var proj4 = require('proj4'),
request = require('superagent'),
async = require('async'),
_ = require('lodash');

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs');


/*
 * Feed in latitude, longitude and number of wanted stops, will call callback with (err,result)
 * where result is an array of station objects. For example of a station object, see below!
 */
 var getStationList = function(lat,long,numberofstops,callback){
 	var coords = proj4('EPSG:25832', { x: long, y: lat }),
 	url = "http://reis.ruter.no/reisrest/stop/getcloseststopsbycoordinates/?coordinates=(x="+Math.round(coords.x)+",y="+Math.round(coords.y)+")&proposals="+numberofstops;
 	request.get(url, function(res){ callback(null,res.res.body); });
 };

/*
 * Feed in a station id, will call callback with (err,result) where result
 * is an array of departures. For example of a departure object, see below!
 */
 var getDeparturesForStation = function(ID,callback){
 	request.get("http://api.trafikanten.no/ReisRest/RealTime/GetAllDepartures/"+ID,function(res){
 		callback(null,res.res.body);
 	});
 };


// *************** Test ****************************

 getStationList(59.932624,10.734738,5,console.log.bind(console));
 getDeparturesForStation(3010314,console.log.bind(console));


// *************** Example data ****************************

 var stationExample = {
 	District: "Oslo",
	ID: 3010314, // This id is what is used in getDeparturesForStation
	Name: "Adamstuen",
	Rank: 0,
	ShortName: "AD",
	Stops: [ ],
	Type: 0,
	X: 596949,
	Y: 6645178,
	Zone: "1",
	AlightingAllowed: false,
	ArrivalTime: null,
	BoardingAllowed: false,
	DepartureTime: null,
	Deviations: [ ],
	Lines: [],
	RealTimeStop: true,
	StopPoints: [ ],
	WalkingDistance: 0
};

var departureExample = {
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


