'use strict';

// Boundarys controller
angular.module('boundarys').controller('BoundarysController', ['$scope', 
                                                              '$stateParams', 
                                                              '$rootScope', 
                                                              '$location', 
                                                              'Authentication', 
                                                              'Boundarys', 
                                                              '$state', 
                                                              'leafletData', 
                                                              
  function ($scope, $stateParams, $rootScope, $location, Authentication, Boundarys, $state, leafletData) {
    $scope.authentication = Authentication;

    /*
    for now the geojson data dissapears everytime you refresh so we will reroute to home page. eventually the boundary
    id will be set in url so we won't have to worry about this and on refresh it will stay in solid state.
    */

    var boundaryFeature = $stateParams.boundaryFeature;
    var bname = $stateParams.boundaryFeature.properties.Name;

    //reroute because we came here from somewhere other than home page
    if (boundaryFeature === null){
      console.log('rerouting');
      $state.go('home');
    }

    angular.extend($scope, {
      alachua: {
        lat: 29.59599854794921,
        lng: -82.24021911621094, 
        zoom: 15
        },
        controls: {
          fullscreen: {
            position: 'topleft'
          }
        },
        geojson: {
          data: boundaryFeature,
          style: {
            color: 'red'
          }
        }
    });

    $scope.map = null; 

    leafletData.getMap('boundary').then(function(map) {
        $scope.map = map;
    });

    /*
    The queries below are the standard ones created with the generator. we may or may not need them for 
    admin portal. i will leave them up for now in case we need them. Once we go into production, we can remove as needed
    */

    // Create new Boundary
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'boundaryForm');

        return false;
      }

      // Create new  Boundary object
      var boundary = new Boundarys({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      boundary.$save(function (response) {
        $location.path('boundarys/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Boundary
    $scope.remove = function (boundary) {
      if (boundary) {
        boundary.$remove();

        for (var i in $scope.boundarys) {
          if ($scope.boundarys[i] === boundary) {
            $scope.boundarys.splice(i, 1);
          }
        }
      } else {
        $scope.boundarys.$remove(function () {
          $location.path('boundarys');
        });
      }
    };

    // Update existing Boundary
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'boundaryForm');

        return false;
      }

      var boundary = $scope.boundary;

      boundary.$update(function () {
        $location.path('boundarys/' + boundary._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Boundarys
    $scope.find = function () {
      $scope.boundarys = Boundarys.query();
    };

    // Find existing Boundary
    $scope.findOne = function () {
      $scope.boundary = Boundarys.get({
        boundaryId: $stateParams.boundaryId
      });
    };
  }
]).directive('offCanvasMenu', function ($stateParams) {
  var bFeature = $stateParams.boundaryFeature;
    return {
        restrict: 'A',
        replace: false,
        link: function (scope, element) {
            scope.isMenuOpen = false;
            scope.toggleMenu = function () {
                scope.isMenuOpen = !scope.isMenuOpen;
            };
        }
    };
});
