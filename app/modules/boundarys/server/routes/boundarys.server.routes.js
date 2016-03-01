'use strict';

/**
 * Module dependencies.
 */
var boundarysPolicy = require('../policies/boundarys.server.policy'),
  boundarys = require('../controllers/boundarys.server.controller');

module.exports = function (app) {
  // Boundarys collection routes
  app.route('/api/boundarys').all(boundarysPolicy.isAllowed)
    .get(boundarys.list)
    .post(boundarys.create);

  // Single boundary routes
  app.route('/api/boundarys/:boundaryId').all(boundarysPolicy.isAllowed)
    .get(boundarys.read)
    .put(boundarys.update)
    .delete(boundarys.delete);

  // Finish by binding the boundary middleware
  app.param('boundaryId', boundarys.boundaryByID);
};
