'use strict';

// Setting up route
angular.module('boundarys').config(['$stateProvider',
  function ($stateProvider) {
    // Boundarys state routing
    $stateProvider
      .state('boundarys', {
        abstract: true,
        url: '/boundarys',
        template: '<ui-view/>'
      })
      .state('boundarys.list', {
        url: '',
        templateUrl: 'modules/boundarys/client/views/list-boundarys.client.view.html'
      })
      .state('boundarys.create', {
        url: '/create',
        templateUrl: 'modules/boundarys/client/views/create-boundary.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      //switch url to url: '/:boundaryId', when database is set up
      .state('boundarys.view', {
        url: '/:boundaryName/',
        templateUrl: 'modules/boundarys/client/views/view-boundary.client.view.html',
        params: {
          boundaryFeature: null
        }
      })
      .state('boundarys.edit', {
        url: '/:boundaryId/edit',
        templateUrl: 'modules/boundarys/client/views/edit-boundary.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
