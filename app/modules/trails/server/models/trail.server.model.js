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
   NAME: String, 
 },
 geometry: Object 

});

mongoose.model('Trail', TrailSchema);
