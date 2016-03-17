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
        url: '/edit',
        templateUrl: 'modules/boundaries/client/views/edit-boundary.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
