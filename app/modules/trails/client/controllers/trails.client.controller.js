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
    $scope.loading = true;
    
    // Create new Trail
    $scope.create = function (content) {
      $scope.error = null;
      var trail = new Trails(JSON.parse(content));

      console.log(trail);

      trail.$save(function (response) {
        $scope.success = true;
        $scope.statusMessage = 'Added';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Trail
    $scope.remove = function (trail) {
      if (confirm('Are you sure you want to delete this user?')) {
        Trails.delete({ trailId: $stateParams.trailId })
              .$promise.then(function (res) {
                    $scope.success = true;
                    $scope.statusMessage = 'Deleted';
              }, function(error) {
                $scope.error = 'Unable to remove trail!\n' + error;
              });
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

      trail.$update(function () {
        $scope.success = true;
        $scope.statusMessage = 'Updated';
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
          edit: {
                lat: 29.671316,
                lng: -82.327766,
                zoom: 10
          }
      });

      Trails.get({ trailId: $stateParams.trailId })
        .$promise.then(function (res) {
            $scope.trail = res;
            console.log($scope.trail);
            var previewData = $scope.trail;
            var poly = L.geoJson($scope.trail);
            var center = poly.getBounds().getCenter();
            console.log(center);
            angular.extend($scope, {
              edit: {
                  lat: center.lat,
                  lng: center.lng,
                  zoom: 14
              },
              geojson: {
                data: previewData,
                style: {
                  color: 'red'
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

