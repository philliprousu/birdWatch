let map, lat, lng, infoWindow, geoCoder;
let markers = [];

//Flickr api
function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
  return queryItems.join('&');
}

function flickrApi(tag) {
  const flickrUrl = 'https://www.flickr.com/services/rest/'
  const params = {
    api_key: '184b7834265d7088dc66cc2fcd42c109',
    method: 'flickr.photos.search',
    format: 'json',
    nojsoncallback: 1,
    page: 1,
    per_page: 50,
    tags: tag
  };
  const queryString = formatQueryParams(params)
  const url = flickrUrl + '?' + queryString;

  console.log(url);
  
  fetch(url)
  .then(response => {
    if (response.ok) {
      console.log(response)
      return response.json()
    } 
    throw new Error(response.statusText)
  })
  .then(responseJson => {
    console.log(responseJson);
    displayBirdPictures(responseJson, tag);
  })
  .catch(err => {
    //$('.results').empty();
    $('#errorMessage').empty();
    $('#errorMessage').text(`Something went wrong: ${err.message}`);
  });
}

function displayBirdPictures(responseJson, tag) {
  console.log(tag)
  $('#birdResults').empty();
  $('#birdResults').append(`<h2>${tag}</h2>`);
  for (let i = 0; i < 50; i++) {
    $('#birdPictureResults').append(
      `<img class='birdPicture' src='http://farm${responseJson.photos.photo[i].farm}.staticflickr.com/${responseJson.photos.photo[i].server}/${responseJson.photos.photo[i].id}_${responseJson.photos.photo[i].secret}.jpg' alt='Picture of a ${tag}.'/>`
    )
  }
  
}

function birdPictureSearchButtonHandler() {
  $('#map').on('click', 'button', function(event) {
    event.preventDefault();
    flickrApi($(this).attr("value"));
  });
}























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
  geocoder = new google.maps.Geocoder();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      // infoWindow.setPosition(pos);
      // infoWindow.setContent('Location found.');
      // infoWindow.open(map);
      map.zoom = 10;
      map.setCenter(pos);
    }, 
    function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

}

function formSubmit() {
$('#addressSubmit').on('submit', function(event) {
    event.preventDefault();
    let streetValue = $('#streetValue').val();
    let cityValue = $('#cityValue').val();
    let stateValue = $('#stateValue').val();
    let zipCodeValue = $('#zipCodeValue').val();
    let address = `${streetValue} ${cityValue} ${stateValue} ${zipCodeValue}`
    console.log(address)
    geocodeAddress(geocoder, map, address);
  });
}

function geocodeAddress (geocoder, resultsMap, address) {
  var address = address;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      let lat = results[0].geometry.location.lat();
      let lng = results[0].geometry.location.lng();
      eBirdApi(lat, lng);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
    })
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
  'Error: The Geolocation service failed. Please enable Location services for faster service or zoom in on map manually.'
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
                <button value="${bird.sciName}">See Pictures Below</button>
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
  formSubmit();
  birdPictureSearchButtonHandler();
});