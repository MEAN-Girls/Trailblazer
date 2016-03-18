'use strict';

/**
 * Module dependencies.
 */
var boundariesPolicy = require('../policies/boundaries.server.policy'),
  boundaries = require('../controllers/boundaries.server.controller');

module.exports = function (app) {
  // Boundaries collection routes
  app.route('/api/boundaries').all(boundariesPolicy.isAllowed)
    .get(boundaries.list)
    .post(boundaries.create);

  // Single boundary routes
  app.route('/api/boundaries/:boundaryId').all(boundariesPolicy.isAllowed)
    .get(boundaries.read)
    .put(boundaries.update)
    .delete(boundaries.delete);

  // Finish by binding the boundary middleware
  app.param('boundaryId', boundaries.boundaryByID);
};
