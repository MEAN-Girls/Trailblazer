'use strict';

// Setting up route
angular.module('trails').config(['$stateProvider',
  function ($stateProvider) {
    // trails state routing
    $stateProvider
      .state('trails', {
        abstract: true,
        url: '/trails',
        template: '<ui-view/>'
      })
      .state('trails.list', {
        url: '',
        templateUrl: 'modules/trails/client/views/list-trails.client.view.html'
      })
      .state('trails.create', {
        url: '/create',
        templateUrl: 'modules/trails/client/views/create-trail.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('trails.view', {
        url: '/:trailId',
        templateUrl: 'modules/trails/client/views/view-trail.client.view.html'
      })
      .state('trails.edit', {
        url: '/edit/:trailId',
        templateUrl: 'modules/trails/client/views/edit-trail.client.view.html'
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);
