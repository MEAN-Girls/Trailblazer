'use strict';

// Boundaries controller
angular.module('boundaries').controller('BoundariesController', ['$scope',
                                                              '$stateParams',
                                                              '$rootScope',
                                                              '$location',
                                                              'Authentication',
                                                              'Boundaries',
                                                              '$state',
                                                              'leafletData',
                                                              'fileUpload',


  function ($scope, $stateParams, $rootScope, $location, Authentication, Boundaries, $state, leafletData, fileUpload) {
    $scope.authentication = Authentication;
    console.log($stateParams.boundaryId);
    $scope.loading = true;
    /*
      Map logic
    */
    if($state.current.name === 'boundaries.view') {
      var boundaryFeature = $stateParams.boundaryFeature;
      var boundaryId = $stateParams.boundaryId;
      $scope.bname = boundaryFeature.properties.Name;
      var center = $stateParams.center;
  
    //reroute because we came here from somewhere other than home page
      if (boundaryFeature === null && boundaryId !== null){
        $state.go('home');
        //boundaryFeature = $scope.findOne();
        //console.log(boundaryFeature);
      }

      var mapboxTile = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'meangurlz.cd22205e',
        accessToken: 'pk.eyJ1IjoibWVhbmd1cmx6IiwiYSI6ImNpa2g1cnF4YjAxNGx2dGttcGFmcm5nc3MifQ.ftvskKymYXv1VfqJPU9tnQ'
      });

      $scope.map = null;

      leafletData.getMap('boundary').then(function(map) {
        mapboxTile.addTo(map);
        $scope.map = map;
      });

      angular.extend($scope, {
        alachua: {
          lat: center.lat,
          lng: center.lng,
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
        }, 
        tiles: mapboxTile
      });

    }
    //end of boundary map log


    /*
      Admin logic
    */
    else {

    // Create new Boundary
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'boundaryForm');

        return false;
      }

      // Create new  Boundary object
      var boundary = new Boundaries({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      boundary.$save(function (response) {
        $location.path('boundaries/' + response._id);

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

        for (var i in $scope.boundaries) {
          if ($scope.boundaries[i] === boundary) {
            $scope.boundaries.splice(i, 1);
          }
        }
      } else {
        $scope.boundaries.$remove(function () {
          $location.path('boundaries');
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
        $location.path('boundaries/' + boundary._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Boundaries
    $scope.find = function () {
      Boundaries.query().$promise.then(function (res) {
        $scope.boundaries = res;
        $scope.loading = false;
      });
    };

    // Find existing Boundary
    $scope.findOne = function () {
      Boundaries.query().$promise.then(function (res) {
        $scope.boundaries = res;
        for (var i = 0; i < $scope.boundaries.length; i++) {
          if ($scope.boundaries[i]._id === $stateParams.boundaryId) { 
            $scope.boundary = $scope.boundaries[i];
            console.log($scope.boundary);
            $scope.loading = false;
          }
        }
      });
    };

    $scope.uploadFile = function () {
        var file = $scope.myFile;
        console.log('file is ');
        console.dir(file);
        fileUpload.uploadFileToUrl(file);
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
}
]);

