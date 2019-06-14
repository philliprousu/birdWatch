var map, lat, lng, infoWindow;
var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.357546, lng: -100.169472},
    zoom: 4
    // disableDoubleClickZoom: true
  });
  google.maps.event.addListener(map,'click',function(event) {                
    lat = event.latLng.lat();
    lng = event.latLng.lng();
    eBirdApi(lat, lng);
  });

  infoWindow = new google.maps.InfoWindow;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
      map.zoom = 9;
    }, 
    function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
  'Error: The Geolocation service failed. Please enable Location services for this website.'
  :
  'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function eBirdApi(lat, lng) {
  let url = `https://ebird.org/ws2.0/data/obs/geo/recent/notable?lat=${lat}&lng=${lng}&dist=100`;
  const options = {
    headers: new Headers({
      "X-eBirdApiToken": 'g3upaqed0lml'
    })
  };
  fetch(url, options)
  .then(response => {
    if (response.ok) {
        return response.json()
    } 
    throw new Error(response.statusText)
  })
  .then(responseJson => {
    console.log(responseJson)
    addBirdSightings(responseJson);
  })
  .catch(err => {
    //$('.results').empty();
    $('#errorMessage').empty();
    $('#errorMessage').text(`Something went wrong: ${err.message}`);
  });
}

function addBirdSightings(responseJson) {
  for (let bird of responseJson) {
    addMarker(bird);
  }
  // setMapOnAll();
}
function addMarker(bird) {
  var marker = new google.maps.Marker({
    position: {lat: bird.lat, lng: bird.lng},
    map: map
    });
    var infoWindow = new google.maps.InfoWindow({
      content: `<h1 class='infoWindowName'>Common Name: ${bird.comName}</h1>
                <h1 class='infoWindowName'>Scientific Name: ${bird.sciName}</h1>
                `
    });
    marker.addListener('click', function() {
    infoWindow.open(map, marker);
    })
    markers.push(marker);  
}

function clearMarkers() {
  setMapOnAll(null);
}

function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function showMarkers() {
  setMapOnAll(map);
}

function deleteMarkers() {
  clearMarkers();
  markers = [];
}

function mapButtonHandler() {
  $('#clearMarkers').on('click', event => clearMarkers())
  $('#showMarkers').on('click', event => showMarkers())
  $('#deleteMarkers').on('click', event => deleteMarkers())
}

$(function() {
  mapButtonHandler();
});


