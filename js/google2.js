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
  //create marker
  var marker = setmarkers(point.latLng);
  markersArray.push( marker );    

  polyPoints = poly.getPath();
  if( polyPoints.length > 1 ){
    var midmarker = setmidmarkers( point.latLng, false );
    midmarkers.push( midmarker );
  }

  if( markersArray.length > 2 && markersArray.length != midmarkers.length ){
    var mid = setmidmarkers( markersArray[markersArray.length-1].position, true );
    midmarkers.push( mid );
  }

  if( markersArray.length > 3 ){
    movemidmarker( markersArray.length-1 );
  }

  //check if has some point near and put same latlong
  marker.setPosition( sameLatLng( marker, true ) );
  polyPoints.insertAt( polyPoints.length, marker.getPosition() );
}

function setmarkers(point) {
  var marker = new google.maps.Marker({
      position: point,
      map: map,
      draggable: true,
      id: markerId++
    });

  allPoints.push(point);

  google.maps.event.addListener(marker, "dragend", function() {    
    marker.setPosition(sameLatLng(marker, true));
    for (var i = 0; i < markersArray.length; i++) {
      if (markersArray[i] == marker) {
        poly.getPath().setAt(i, marker.getPosition());
        movemidmarker(i);
        break;
      }
    }
    var stringtobesaved = marker.getPosition().lat().toFixed(6) + ',' + marker.getPosition().lng().toFixed(6);
    pointsArray.splice(i,1,stringtobesaved);
  });

  google.maps.event.addListener( marker, "click", function(){
    for( var i = 0; i < markersArray.length; i++ ){
        if( markersArray[i] == marker && markersArray.length > 2 ){
            marker.setMap(null);
            markersArray.splice(i, 1);
            poly.getPath().removeAt(i);
            removemidmarker(i);
            break;
        }
    }

    if(markersArray.length > 1) {
        pointsArray.splice(i,1);
    }
  });

  google.maps.event.addListener( marker, "rightclick", function(event) { console.log("event", event);
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();   
    //after test remove marker with right click
  });
  return marker;
}

function sameLatLng(marker, drag) {
  var smallestDist;
  var foundObject;

  var found = false;


  for( var i in pointsFloatArray ){
    var current = pointsFloatArray[i].position;
    var distance = distHaversine(current, marker.position);


    if (distance < smallestDist || i == 0) {
      smallestDist = distance;
      foundObject  = pointsFloatArray[i];


      if (distance < 0.3)
        found = true;
    }
  }

  if(found){
    marker.position = foundObject.position;
    addMultiPoint(marker);

    if(drag){
      for(var k in pointsFloatEquals){
        if (pointsFloatEquals[k] == marker && !recents[k]){
          recents[k] = true;
        }
      }
    }
  }
  return marker.position;
}

function addMultiPoint(marker){
  for(var i in pointsFloatArray){
    var posicao1 = '|'+pointsFloatArray[i].position+'|';
    var posicao2 = '|'+marker.position+'|';


    if(posicao1 == posicao2){
      pointsFloatEquals.push(marker);
      recents.push(false);
      break;
    }
  }
}

function setmidmarkers(point, last) {
  var prevpoint;
  
  if(last){
    prevpoint = markersArray[0].getPosition();            
  }else{
    prevpoint = markersArray[markersArray.length-2 ].getPosition();            
  }

  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(
      point.lat() - (0.5 * (point.lat() - prevpoint.lat())),
      point.lng() - (0.5 * (point.lng() - prevpoint.lng()))
    ),

    map: map,          
      raiseOnDrag: false,
    draggable: true
  });

  google.maps.event.addListener(marker, "dragend", function() {
    
    marker.setPosition(sameLatLng(marker, true));

    for (var i = 0; i < midmarkers.length; i++) {
      if (midmarkers[i] == marker) {
        var newpos = marker.getPosition();
        var startMarkerPos = markersArray[i].getPosition();
        var firstVPos = new google.maps.LatLng(
          newpos.lat() - (0.5 * (newpos.lat() - startMarkerPos.lat())),
          newpos.lng() - (0.5 * (newpos.lng() - startMarkerPos.lng()))
        );

        var endMarkerPos;
        if(markersArray[i+1]){
          endMarkerPos = markersArray[i+1].getPosition();
        }else{
          endMarkerPos = markersArray[0].getPosition();
        }

        var secondVPos = new google.maps.LatLng(
          newpos.lat() - (0.5 * (newpos.lat() - endMarkerPos.lat())),
          newpos.lng() - (0.5 * (newpos.lng() - endMarkerPos.lng()))
        );

        var newVMarker = setmidmarkers(secondVPos, false);
        newVMarker.setPosition(secondVPos);//apply the correct position to the midmarker
        var newMarker = setmarkers(newpos);
        markersArray.splice(i+1, 0, newMarker);
        poly.getPath().insertAt(i+1, newpos);
        marker.setPosition(firstVPos);
        midmarkers.splice(i+1, 0, newVMarker);
        break;
      }
    }
    var stringtobesaved = newpos.lat().toFixed(6) + ',' + newpos.lng().toFixed(6);
    pointsArray.splice(i+1,0,stringtobesaved);
  });

  return marker;
}

function movemidmarker(index) { 
    var newpos = markersArray[index].getPosition();

    if (index == 0) { //if only point
      var prevpos = markersArray[markersArray.length-1].getPosition();
      if(midmarkers>0){ //midmarkers - array that contain the points addeds
        midmarkers[midmarkers.length-1].setPosition(new google.maps.LatLng(
          newpos.lat() - (0.5 * (newpos.lat() - prevpos.lat())),
          newpos.lng() - (0.5 * (newpos.lng() - prevpos.lng()))
        ));
      }
    }
    if (index == markersArray.length - 1) {
      var nextpos = markersArray[0].getPosition();
      midmarkers[midmarkers.length-1].setPosition(new google.maps.LatLng(
        newpos.lat() - (0.5 * (newpos.lat() - nextpos.lat())),
        newpos.lng() - (0.5 * (newpos.lng() - nextpos.lng()))
      ));
    }
    if (index != 0) {
      var prevpos = markersArray[index-1].getPosition();
      midmarkers[index-1].setPosition(new google.maps.LatLng(
        newpos.lat() - (0.5 * (newpos.lat() - prevpos.lat())),
        newpos.lng() - (0.5 * (newpos.lng() - prevpos.lng()))
      ));
    }
    if (index != markersArray.length - 1) {
      var nextpos = markersArray[index+1].getPosition();
      midmarkers[index].setPosition(new google.maps.LatLng(
        newpos.lat() - (0.5 * (newpos.lat() - nextpos.lat())),
        newpos.lng() - (0.5 * (newpos.lng() - nextpos.lng()))
      ));
    }
}

function removemidmarker(index) {
    if (markersArray.length > 0) {//clicked marker has already been deleted
      if (index != markersArray.length) {
        midmarkers[index].setMap(null);
        midmarkers.splice(index, 1);
      } else {
        midmarkers[index-1].setMap(null);
        midmarkers.splice(index-1, 1);
      }

    }
    if (index != 0 && index != markersArray.length) {
      var prevpos = markersArray[index-1].getPosition();
      var newpos = markersArray[index].getPosition();
      midmarkers[index-1].setPosition(new google.maps.LatLng(
        newpos.lat() - (0.5 * (newpos.lat() - prevpos.lat())),
        newpos.lng() - (0.5 * (newpos.lng() - prevpos.lng()))
      ));
    }
    if (index == 0) {
      var prevpos = markersArray[markersArray.length-1].getPosition();
      var newpos = markersArray[index].getPosition();
      midmarkers[midmarkers.length-1].setPosition(new google.maps.LatLng(
        newpos.lat() - (0.5 * (newpos.lat() - prevpos.lat())),
        newpos.lng() - (0.5 * (newpos.lng() - prevpos.lng()))
      ));
    }
    if (index == markersArray.length) {
      var prevpos = markersArray[0].getPosition();
      var newpos = markersArray[index-1].getPosition();
      midmarkers[midmarkers.length-1].setPosition(new google.maps.LatLng(
        newpos.lat() - (0.5 * (newpos.lat() - prevpos.lat())),
        newpos.lng() - (0.5 * (newpos.lng() - prevpos.lng()))
      ));
    }
}

function distHaversine(p1, p2) {
  var R = 6371;
  var dLat = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
  Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

function rad(x) {
  return x * Math.PI / 180;
}
