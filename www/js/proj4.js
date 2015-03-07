var proj4 = require('proj4'),
	request = require('superagent'),
	async = require('async'),
	_ = require('lodash');

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs');


/*
Davids fantastic method! Will (eventually) call callback with (err,result) where result is an array
of objects. Each object has a `stationdata` property which describes the station, and a `departures`
prop which is an array of departures.
*/
var getstuffomg = function(lat,long,numberofstops,callback){
	var coords = proj4('EPSG:25832', { x: long, y: lat }),
		url = "http://reis.ruter.no/reisrest/stop/getcloseststopsbycoordinates/?coordinates=(x="+Math.round(coords.x)+",y="+Math.round(coords.y)+")&proposals="+numberofstops;
	request.get(url, function(res){
		async.reduce(res.res.body,{},function(data,station,done){
			request.get("http://api.trafikanten.no/ReisRest/RealTime/GetAllDepartures/"+station.ID,function(res){
				done(null,_.extend(data,_.object([station.ID],[{stationdata:station,departures:res.res.body}])));
			});
		},callback);
	});
};

var testfunc = function(err,data){
	console.log("FAKKING DONE! Lets spam the result :)");
	_.each(data,function(station,id){
		console.log("from station",station.stationdata.Name);
		_.each(station.departures,function(dep){
			console.log(" ..... ",dep.LineRef,dep.DestinationName);
		});
	});
};

getstuffomg(59.932624,10.734738,5,testfunc);

