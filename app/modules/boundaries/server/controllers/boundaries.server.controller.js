'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Boundary = mongoose.model('Boundary'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a boundary
 */
exports.create = function (req, res) {
  var boundary = new Boundary(req.body);

  boundary.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(boundary);
    }
  });
};

/**
 * Show the current boundary
 */
exports.read = function (req, res) {
  res.json(req.boundary);
};

/**
 * Update a boundary
 */
exports.update = function (req, res) {
  var boundary = req.boundary;

  //For security purposes only merge these parameters
  boundary.properties.MANAME = req.body.properties.MANAME;
  boundary.properties.OWNER = req.body.properties.OWNER;

  boundary.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(boundary);
    }
  });
};

/**
 * Delete an boundary
 */
exports.delete = function (req, res) {
  var boundary = req.boundary;

  boundary.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(boundary);
    }
  });
};

/**
 * List of boundaries
 */
exports.list = function (req, res) {
  Boundary.find().exec(function (err, boundaries) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(boundaries);
    }
  });
};

/**
 * Boundary middleware
 */
exports.boundaryByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Boundary is invalid'
    });
  }
  
  Boundary.findById(id).exec(function (err, boundary) {
    if (err) {
      return next(err);
    } else if (!boundary) {
      return res.status(404).send({
        message: 'No boundary with that identifier has been found'
      });
    }
    req.boundary = boundary;
    next();
  });
};
