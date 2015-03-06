var proj4 = require('proj4'),
	request = require('superagent'),
	async = require('async'),
	_ = require('lodash');

proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs');

var getstuffomg = function(lat,long,callback){
	var coords = proj4('EPSG:25832', { x: long, y: lat }),
		url = "http://reis.ruter.no/reisrest/stop/getcloseststopsbycoordinates/?coordinates=(x="+Math.round(coords.x)+",y="+Math.round(coords.y)+")&proposals=7",
		data = {};
	request.get(url, function(res){
		async.each(res.res.body,function(station,done){
			data[station.ID] = { stationdata: station };
			request.get("http://api.trafikanten.no/ReisRest/RealTime/GetAllDepartures/"+station.ID,function(res){
				data[station.ID].departures = res.res.body;
				done();
			});
		},function(err){
			console.log("FAKKING DONE! should callback here, but now I will just spam the result :)");
			_.each(data,function(station,id){
				console.log("from station",station.stationdata.Name);
				_.each(station.departures,function(dep){
					console.log(" ..... ",dep.LineRef,dep.DestinationName);
				});
			});
		});
	});
};

var cb = function(){};

getstuffomg(59.932624,10.734738,cb);

