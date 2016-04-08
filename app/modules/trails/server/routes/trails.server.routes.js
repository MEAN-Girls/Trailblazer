'use strict';

/**
 * Module dependencies.
 */
var trailsPolicy = require('../policies/trails.server.policy'),
  trails = require('../controllers/trails.server.controller');

module.exports = function (app) {
  // Trails collection routes
  app.route('/api/trails').all(trailsPolicy.isAllowed)
    .get(trails.list)
    .post(trails.create);

  // Single trail routes
  app.route('/api/trails/:trailId')
    .get(trails.read)
    .put(trails.update)
    .delete(trails.delete);

  // Finish by binding the trail middleware
  app.param('trailId', trails.trailByID);
};
