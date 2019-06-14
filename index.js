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

// Adds a marker to the map and push to the array.
function addMarker(bird) {
  var marker = new google.maps.Marker({
    position: {lat: bird.lat, lng: bird.lng},
    map: map,
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



// // Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

//Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}


// function watchButton() {
//   $('#enableLocation').on('click', event => {
//     getLatLng();
//   })
// }

// $(function() {
//   watchButton();
// });


//var infoWindow = new google.maps.InfoWindow({
//         content: `<h1 class='infoWindowName'>${brewery.name}</h1>
//                   <p>Address:</p>
//                   <p>${brewery.street}</p>
//                   <p class='margin'>${brewery.city}, ${brewery.state} ${brewery.postal_code}</p>
//                   <a href="${brewery.phone}" class='phone'>Phone Number: ${brewery.phone}</a>
        
//                   `
//     })
//     marker.addListener('click', function(){
//     infoWindow.open(map, marker);