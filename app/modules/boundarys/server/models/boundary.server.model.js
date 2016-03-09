'use strict';

/**
 * Module dependencies.
 */
var GeoJSON = require('mongoose-geojson-schema');
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Boundary Schema
 */
var BoundarySchema = new Schema({
  geoFeature:GeoJSON.Feature
});

mongoose.model('Boundary', BoundarySchema);
