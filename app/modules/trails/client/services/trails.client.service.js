'use strict';

//trails service used for communicating with the trails REST endpoints
angular.module('trails').factory('Trails', ['$resource',
  function ($resource) {
    return $resource('api/trails/:trailId', {
      trailId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
