'use strict';
var boundarys = angular.module('boundarys', []);

boundarys.directive('fileModel', [$parse, function ($parse) {
	var bFeature = $stateParams.boundaryFeature;
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;
			
		element.bind('change' function(){
			scope.$apply(function(){
				modelSetter(scope, element[0].files[0]);
				});
			});
			scope.isMenuOpen = false;
            scope.toggleMenu = function () {
                scope.isMenuOpen = !scope.isMenuOpen;
		}
	};
}]);

boundarys.service('fileUpload', ['$http', function($http) {
	this.uploadFileToUrl = function(file, uploadUrl){
		var fd = new FormData();
		fd.append('file',file);
		
		$http.post(uploadUrl, fd {
			transformRequest: angular.identity,
			headers: {'Content-Type': undefined}
		})
		
		.success(function(){
		})
		
		.error(function(){
		});
	}]);
	
boundarys.controller('boundarysController', [	'$scope', 
												fileUpload,
												'$stateParams',
												'$rootScope',
												'$location',
												'Authentication',
												'Boundarys',
												'$state',
												'leafletData',
function ($scope, fileUpload, $stateParams, $rootScope, $location, Authentication, Boundarys, $state, leafletData) {
    $scope.authentication = Authentication;

    /*
    for now the geojson data dissapears everytime you refresh so we will reroute to home page. eventually the boundary
    id will be set in url so we won't have to worry about this and on refresh it will stay in solid state.
    */
    if($state.current.name === 'boundaries.view') {
      var boundaryFeature = $stateParams.boundaryFeature;
      var center = $stateParams.center;
  
    //reroute because we came here from somewhere other than home page
    if (boundaryFeature === null){
      console.log('rerouting');
      $state.go('home');
    }

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
        }
    });

    var mapboxTile = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'meangurlz.pc7i20mi',
      accessToken: 'pk.eyJ1IjoibWVhbmd1cmx6IiwiYSI6ImNpa2g1cnF4YjAxNGx2dGttcGFmcm5nc3MifQ.ftvskKymYXv1VfqJPU9tnQ'
    });

    $scope.map = null;

    leafletData.getMap('boundary').then(function(map) {
        mapboxTile.addTo(map);
        $scope.map = map;
    });
  }


    /*
    The queries below are the standard ones created with the generator. we may or may not need them for
    admin portal. i will leave them up for now in case we need them. Once we go into production, we can remove as needed
    */
    else{

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

        for (var i in $scope.boundarys) {
          if ($scope.boundarys[i] === boundary) {
            $scope.boundarys.splice(i, 1);
          }
        }
      } else {
        $scope.boundarys.$remove(function () {
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

    // Find a list of Boundarys
    $scope.find = function () {
      Boundarys.query().$promise.then(function (res) {
        $scope.boundarys = res;
      });
    };

    // Find existing Boundary
    $scope.findOne = function () {
      $scope.boundary = Boundarys.get({
        boundaryId: $stateParams.boundaryId
      });
    };
	
	$scope.uploadFile = function(){
		var file = $scope.boundaryFile;
		console.log('file: ');
		console.dir(file);
		var uploadUrl = "/uploads";
		fileUpload.uploadFileToUrl(file, uploadUrl);
	}
  }
}
]);