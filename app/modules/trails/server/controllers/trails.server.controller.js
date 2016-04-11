'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Trail = mongoose.model('Trail'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a trail
 */
exports.create = function (req, res) {
  var trail = new Trail(req.body);

  trail.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(trail);
    }
  });
};

/**
 * Show the current trail
 */
exports.read = function (req, res) {
  res.json(req.trail);
};

/**
 * Update a trail
 */
exports.update = function (req, res) {
  var trail = req.trail;

  //For security purposes only merge these parameters
  trail.properties.Name = req.body.properties.Name;
  trail.properties.boundary = req.body.properties.boundary;

  trail.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(trail);
    }
  });
};

/**
 * Delete an trail
 */
exports.delete = function (req, res) {
  var trail = req.trail;

  trail.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(trail);
    }
  });
};

/**
 * List of trails
 */
exports.list = function (req, res) {
  Trail.find().exec(function (err, trails) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(trails);
    }
  });
};

/**
 * Trail middleware
 */
exports.trailByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Trail is invalid'
    });
  }
  
  Trail.findById(id).exec(function (err, trail) {
    if (err) {
      return next(err);
    } else if (!trail) {
      return res.status(404).send({
        message: 'No trail with that identifier has been found'
      });
    }
    req.trail = trail;
    next();
  });
};
