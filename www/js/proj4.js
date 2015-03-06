var proj4 = require('proj4');
proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs');

var lat = 59.932624;
var lng = 10.734738;
var xy = proj4('EPSG:25832', { x: lng, y: lat })

console.log(xy);
