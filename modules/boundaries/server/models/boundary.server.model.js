'use strict';

/**
 * Module dependencies.
 */



var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Boundary Schema
 */
var BoundarySchema = new Schema({

 type: String,
 properties: {
   AREA: Number, 
   PERIMETER: Number,
   MA_ID: Number,
   MACODE_BCD: String,
   MANAME: String,
   MAJORMA: String,
   MATYPE: String,
   MANAGING_A: String,
   MATYPE2: String,
   OWNER: String,
   COONERS: String,
   TOTACRES: Number,
   LTF_ACRES: Number,
   COUNTY: String,
   PROTSTAT: Number,
   MANAGER: String,
   MGRINST: String,
   MGRCITY: String,
   MGRPHONE: String,
   DESC1: String,
   DESC2: String,
   COMMENTS1: String,
   COMMENTS2: String,
   DIG_COM: String,
   MANAME_AB: String,
   MA_WEBSITE: String,
   OWNERTYPES: String,
   ESTMT_HOLD: String
 },
 geometry: {
   type: Object,
   required: true
 }
});

mongoose.model('Boundary', BoundarySchema);
