import limitMap from 'google-map-bounds-limit';

const minZoomLevel = 3;
const map = new google.maps.Map(document.getElementById('mapArea'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
});
map.addListener('zoom_changed', zoomChanged);
var maxBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-85.00, -180.00), 
    new google.maps.LatLng(85.00, 180.00)
);

limitMap(map, maxBounds);

function zoomChanged() {
    if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
}
