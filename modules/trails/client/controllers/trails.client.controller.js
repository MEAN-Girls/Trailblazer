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
    // boolean for trail toggle menu
    $scope.iconCollapse = false;
    $scope.uploadCollapse = false;

    //icons list
    $scope.icon = [];
    $scope.icons = [
        'bicycle',
        'bus-stop',
        'campsite',
        'first-aid',
        'food',
        'head',
        'hospital',
        'lodging',
        'parking',
        'pets',
        'picnic',
        'restrooms',
        'visitor-center',
        'wheelchair',
        'wi-fi'
    ];

    $scope.authentication = Authentication;
    $scope.loading = true;

    // Create new Trail
    $scope.create = function (content) {
      $scope.error = null;
      var trail = new Trails(JSON.parse(content));

      trail.$save(function (response) {
        $scope.success = true;
        $scope.statusMessage = 'Added';
      }, function (errorResponse) {
          $scope.failure = true;
          $scope.statusMessage = errorResponse.data.message;
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
      $scope.iconCollapse = false;
      $scope.uploadCollapse = false;
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

    // Find existing trail
    $scope.createIcon = function (isValid) {
        $scope.error = null;

        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'iconForm');
          return false;
        }

        var trail = {
            "type": "Feature",
            "properties": {
                "Name": $scope.icon.type ,
                "color": "null",
                "boundary": $scope.icon.boundary
            },
            "geometry": {
                "type": "Point",
                "coordinates": [$scope.icon.lat, $scope.icon.lng]
            }
        };

        var icon = new Trails(trail);
        icon.$save(function (response) {
          $scope.success = true;
          $scope.statusMessage = 'Icon Added';
        }, function (errorResponse) {
            $scope.failure = true;
            $scope.statusMessage = errorResponse.data.message;
        });
        console.log(icon);
    };

}
]);
