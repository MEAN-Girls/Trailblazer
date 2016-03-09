'use strict';

//Boundarys service used for communicating with the boundarys REST endpoints
angular.module('boundarys').factory('Boundarys', ['$resource',
  function ($resource) {
    return $resource('api/boundarys/:boundaryId', {
      boundaryId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
