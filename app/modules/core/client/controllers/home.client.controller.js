'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    // center map
	angular.extend($scope, {
		alachua: {
			//lat: 29.6520,
			//lng: -82.3250,
			zoom: 10,
			autoDiscover: true
    	},
    	controls: {
    		fullscreen: {
    			position: 'topleft'
    		}
    	}
    });
	}
]);
