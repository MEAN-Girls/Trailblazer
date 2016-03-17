'use strict';

// Setting up route
angular.module('boundarys').config(['$stateProvider',
  function ($stateProvider) {
    // Boundarys state routing
    $stateProvider
      .state('boundaries', {
        abstract: true,
        url: '/boundaries',
        template: '<ui-view/>'
      })
      .state('boundaries.list', {
        url: '/list',
        templateUrl: 'modules/boundarys/client/views/list-boundarys.client.view.html'
      })
      .state('boundaries.create', {
        url: '/create',
        templateUrl: 'modules/boundarys/client/views/create-boundary.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      //switch url to url: '/:boundaryId', when database is set up
      .state('boundaries.view', {
        url: '/:boundaryName/',
        templateUrl: 'modules/boundarys/client/views/view-boundary.client.view.html',
        params: {
          boundaryFeature: null,
          center: null
        }
      })
      .state('boundaries.edit', {
        url: '/edit',
        templateUrl: 'modules/boundarys/client/views/edit-boundary.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
