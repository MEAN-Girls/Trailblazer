'use strict';

//Boundaries service used for communicating with the boundaries REST endpoints
angular.module('boundaries').factory('Boundaries', ['$resource',
  function ($resource) {
    return $resource('api/boundaries/:boundaryId', {
      boundaryId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
