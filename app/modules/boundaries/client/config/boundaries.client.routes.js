'use strict';

// Setting up route
angular.module('boundaries').config(['$stateProvider',
  function ($stateProvider) {
    // Boundaries state routing
    $stateProvider
      .state('boundaries', {
        abstract: true,
        url: '/boundaries',
        template: '<ui-view/>'
      })
      .state('boundaries.list', {
        url: '/list',
        templateUrl: 'modules/boundaries/client/views/list-boundaries.client.view.html'
      })
      .state('boundaries.create', {
        url: '/create',
        templateUrl: 'modules/boundaries/client/views/create-boundary.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      //switch url to url: '/:boundaryId', when database is set up
      .state('boundaries.view', {
        url: '/:boundaryId/',
        templateUrl: 'modules/boundaries/client/views/view-boundary.client.view.html',
        params: {
          boundaryFeature: null,
          center: null
        }
      })
      .state('boundaries.edit', {
<<<<<<< HEAD:app/modules/boundarys/client/config/boundarys.client.routes.js
        url: '/edit',
        templateUrl: 'modules/boundarys/client/views/edit-boundary.client.view.html',
=======
        url: '/:boundaryId/edit',
        templateUrl: 'modules/boundaries/client/views/edit-boundary.client.view.html',
>>>>>>> 07fc7f16bd22aa1a1563f1ce814fc3d3921f271a:app/modules/boundaries/client/config/boundaries.client.routes.js
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
