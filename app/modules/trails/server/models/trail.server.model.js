'use strict';

/**
 * Module dependencies.
 */



var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Trail Schema
 */
var TrailSchema = new Schema({

 type: String,
 properties: {
   Name: String, 
   boundary: String
 },
 geometry: {
 	type: Object,
 	required: true
 }
});

mongoose.model('Trail', TrailSchema);
