(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.limitMap = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = limitMap;
var TILE_SIZE = 256;
var lastValidCenter = null;
var ignoreNextMapMove = false;

/**
 * Limits panning on the map beyond the given latitude.
 * @param  {google.maps.Map} map  The google maps instance
 * @param  {google.maps.LatLngBounds} maxBounds The maximum visible bounds
 */
function limitMapMove(map, maxBounds) {
  if (ignoreNextMapMove) {
    ignoreNextMapMove = false;
    return;
  }

  var bounds = map.getBounds();

  if (maxBounds.contains(bounds.getNorthEast()) && maxBounds.contains(bounds.getSouthWest())) {
    lastValidCenter = map.getCenter();
    return;
  }

  ignoreNextMapMove = true;

  if (lastValidCenter) {
    map.setCenter(lastValidCenter);
    return;
  }

  lastValidCenter = recalculateMapCenter(map, maxBounds);
  map.setCenter(lastValidCenter);
}

/**
 * Due to limiting boundaries of a map there might be situations
 * where the displayed region of the map is outside of the allowed maps
 * boundary. This method is good for moving the visible map to the defined map
 * boundaries. It should be called by resize or zoom events.
 * @param  {google.maps.Map} map  The google maps instance
 * @param  {google.maps.LatLngBounds} maxBounds The maximum visible bounds
 */
function maybeUpdateMapCenter(map, maxBounds) {
  // The zoom change is triggered when clicked and the new map properties are
  // only available a cycle or so later so we have to wait little bit.
  window.setTimeout(function () {
    lastValidCenter = recalculateMapCenter(map, maxBounds);

    map.setCenter(lastValidCenter);
  }, 0);
}

/**
 * Calculate a new map-center such that the visible area of the map is
 * completely within given max bounds.
 * @param  {google.maps.Map} map  The google maps instance
 * @param  {google.maps.LatLngBounds} maxBounds The maximum visible bounds
 * @return {google.maps.LatLng}  The recalculated map center
 */
function recalculateMapCenter(map, maxBounds) {
  var center = map.getCenter();
  var bounds = map.getBounds();
  var offsets = getBoundsOffsets(bounds, maxBounds);
  var newCenter = {
    lat: center.lat(),
    lng: center.lng()
  };

  if (offsets.north > 0) {
    newCenter.lat = center.lat() - offsets.n;
  }

  if (offsets.east > 0) {
    newCenter.lng = center.lng() - offsets.e;
  }

  if (offsets.south > 0) {
    newCenter.lat = center.lat() + offsets.s;
  }

  if (offsets.west > 0) {
    newCenter.lng = center.lng() + offsets.w;
  }

  return new google.maps.LatLng(newCenter.lat, newCenter.lng);
}

/**
 * Calculates the boundary-offsets in every direction for the given pair of
 * LatLngBounds. Returned values are > 0 if inner is smaller than outer in
 * that direction (when all values are >= 0, inner is a true subset of outer).
 * @param {google.maps.LatLngBounds} inner The first bounds
 * @param {google.maps.LatLngBounds} outer The second bounds
 * @return {Object} The numeric offset per direction.
 */
function getBoundsOffsets(inner, outer) {
  return {
    north: inner.getNorthEast().lat() - outer.getNorthEast().lat(),
    east: inner.getNorthEast().lng() - outer.getNorthEast().lng(),
    south: outer.getSouthWest().lat() - inner.getSouthWest().lat(),
    west: outer.getSouthWest().lng() - inner.getSouthWest().lng()
  };
}

/**
 * Limits the maps minZoom to never make tiles visible which are out of the
 * regular map bounds (-90/-180 | 90/180).
 * @param  {google.maps.Map} map  The map instance
 */
function limitMapMinZoom(map) {
  var currentZoom = map.getZoom();
  var mapElementHeight = map.getDiv().getBoundingClientRect().height;
  var nextVisibleMapHeight = Math.pow(2, currentZoom - 1) * TILE_SIZE;

  if (nextVisibleMapHeight < mapElementHeight) {
    map.setOptions({
      minZoom: currentZoom
    });
  }
}

/**
 * Limits latitude panning to a given limit.
 * @param  {google.maps.Map} map  The google map object
 * @param  {google.maps.LatLngBounds} maxBounds  The bounds limit
 */
function limitMap(map, maxBounds) {
  map.addListener('center_changed', function () {
    limitMapMove(map, maxBounds);
  });
  map.addListener('zoom_changed', function () {
    maybeUpdateMapCenter(map, maxBounds);
    limitMapMinZoom(map);
  });
  map.addListener('resize', function () {
    maybeUpdateMapCenter(map, maxBounds);
    limitMapMinZoom(map);
  });

  // call this once, because the next zoom level might already be too low
  limitMapMinZoom(map);
}

// for standalone build
module.exports = limitMap;

},{}]},{},[1])(1)
});