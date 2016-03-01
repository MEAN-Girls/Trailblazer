'use strict';

// Boundarys controller
angular.module('boundarys').controller('BoundarysController', ['$scope', '$stateParams', '$location', 'Authentication', 'Boundarys',
  function ($scope, $stateParams, $location, Authentication, Boundarys) {
    $scope.authentication = Authentication;

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
]);
