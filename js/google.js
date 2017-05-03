var map;
var markerId     = 0;
var allPoints    = [];
var markersArray = [];
var midmarkers   = [];
var pointsArray  = [];
var recents      = [];
var pointsFloatArray  = [];
var pointsFloatEquals = [];

function initialize() {
	showMap('-23.565262', '-46.683653', 14);        
}

function showMap(latitude, longitude, zoom) {	
  var mapDiv = document.getElementById("map");
  var latlng = new google.maps.LatLng(latitude, longitude);

  var mapOptions = {
    zoom: zoom,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map        = new google.maps.Map(mapDiv, mapOptions);  
  polyPoints = new google.maps.MVCArray();

  var polyOptions = {
      strokeOpacity: 0.5,
      strokeWeight: 0.6,
      fillOpacity: 0.19,
      fillColor: "#000"
  };
  poly = new google.maps.Polygon( polyOptions );
  poly.setMap( map );
  poly.setEditable(true);
  google.maps.event.addListener( map, 'click', addLatLng ); 

}

function addLatLng( point ){  
  polyPoints = poly.getPath();
  polyPoints.insertAt( polyPoints.length, point.latLng );

  //when a new point was inserted
  google.maps.event.addListener(polyPoints, 'insert_at', function(index) { 
        //events to test
        //you can use "this" to get more information 
  });   

  //when polygon was modify
  google.maps.event.addListener(polyPoints, 'set_at', function(index) {
    //event to test    
  });

  //when polygon is complete
  google.maps.event.addListener(polyPoints, 'polygoncomplete', function(polygon) {
    var coordinates = (polyPoints.getArray());    
  });
}
