'use strict';

// trails controller
angular.module('trails').controller('TrailsController', ['$scope',
                                                              '$stateParams',
                                                              '$rootScope',
                                                              '$location',
                                                              'Authentication',
                                                              'Trails',
                                                              '$state',
                                                              'leafletData',
  function ($scope, $stateParams, $rootScope, $location, Authentication, Trails, $state, leafletData) {
    $scope.authentication = Authentication;
    

    // Create new Trail
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'trailForm');

        return false;
      }

      // Create new  Trail object
      var trail = new Trails({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      trail.$save(function (response) {
        $location.path('trails/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Trail
    $scope.remove = function (trail) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (trail) {
          trail.$remove();

          for (var i in $scope.trails) {
            if ($scope.trails[i] === trail) {
              $scope.trails.splice(i, 1);
            }
          }
        } else {
          $scope.trails.$remove(function () {
            $state.go('trails.list');
          });
        }
      }
    };

    // Update existing trail
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'trailForm');

        return false;
      }

      var trail = $scope.trail;
      console.log(trail);

      trail.$update(function () {
        $state.go('trails.list' , {
          trailId: trail._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of trails
    $scope.find = function () {
      Trails.query().$promise.then(function (res) {
        $scope.trails = res;
        $scope.loading = false;
        console.log('EXECUTED FIND');
      });
    };

    // Find existing trail
    $scope.findOne = function () {
      angular.extend($scope, {
          preview: {
                lat: 29.671316,
                lng: -82.327766,
                zoom: 10
          }
      });

      Trails.get({ trailId: $stateParams.trailId })
        .$promise.then(function (res) {
            $scope.trail = res;
            console.log($scope.trail);
            var previewData = $scope.trail.geometry;
            
            angular.extend($scope, {
              geojson: {
                data: previewData,
                style: {
                  color: 'green'
                }
              }
            });
         $scope.loading = false;
      });
    };

    $scope.showContent = function($fileContent){
      $scope.content = $fileContent;
      var previewData = JSON.parse($scope.content);
      angular.extend($scope, {
        center: {
            lat: 29.671316,
            lng: -82.327766,
            zoom: 10
        },
        geojson: {
          data: previewData,
          style: {
            color: 'red'
          }
        }
      });
    };
}
]);

