const map = new google.maps.Map(document.getElementById('mapArea'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
});
var maxBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-85.00, -180.00), 
    new google.maps.LatLng(85.00, 180.00)
);
limitMap(map, maxBounds);
