'use strict';

angular.module('core').controller('HomeController', ['$scope', '$rootScope', 'Authentication', '$http','$stateParams', '$state', 'leafletData', '$compile',
  function ($scope, $rootScope, Authentication, $http, $stateParams, $state, leafletData, $compile) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    
    /*
        Some quick references for leaflet use in the docs, 

        L.Class = angular module. whenever you want to add some functionality

        Later on we will be adding factories to work with new classes.

        This is a simple rendering of our map. 
    */

    var regions = { //defines corner coordinates for maxboundary
        alachua: {
            northEast: {
                lat: 30.00965233044293,
                lng: -81.89071655273438
            },
            southWest: {
                lat: 29.3642238956322,
                lng: -83.00308227539062
            }
        }
    };

	angular.extend($scope, {
        maxbounds: regions.alachua, // Added maxbounds declaration
		alachua: {
			lat: 29.59599854794921,
			lng: -82.24021911621094, 
			zoom: 14
			//autoDiscover: true
    	},
    	controls: {
    		fullscreen: {
    			position: 'topleft'
    		}
        },

    }); 

    
    
    /*
    This polygon is drawn using Geojson.
    */
    

    /* 
        Get Map data
    */
    $scope.map = null; 

    leafletData.getMap('county').then(function(map) {
        $scope.map = map;
        $scope.map.locate({ setView : true, maxZoom : 13 });
        $scope.map.on('locationfound', function (e){
            if(marker){
            $scope.map.removeLayer(marker);
            }
            marker = new L.marker(e.latlng).addTo($scope.map);
        });
    });

   /*
        Draw Markers
    */
    var marker;
    angular.extend($scope, {

        findUser : function(){
            $scope.map.locate({ setView : true, maxZoom : 13 });
            $scope.map.on('locationfound', $scope.onLocationFound);
        },

        onLocationFound : function(e){
            if(marker){
                $scope.map.removeLayer(marker);
            }
            marker = new L.marker(e.latlng).addTo($scope.map);
         },
        onEachFeature : function(feature, layer){
            layer.on('click', function(e){

                $scope.name_test = feature.properties.Name;
                $rootScope.tempName = feature.properties.Name;
                $rootScope.tempCoords = feature.geometry.coordinates;
                var popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent($compile('<button type="button" ng-click="expand()">{{name_test}} - See More!!</button>')($scope)[0]) //need to $compile to introduce ng directives
                    .openOn($scope.map);
            });
        },
        expand : function(feature){
            $state.go('boundary', { 'boundaryName': $scope.name_test });
        }
         
    });
    
    $http.get('https://raw.githubusercontent.com/cduica/geojsontest/master/PCP_combined.geojson').success(function(data, status) {
            angular.extend($scope, {
                geojson: {
                    data: data,
                    style: 
                    function(feature){
                    
                    switch (feature.properties.Name) {
                    case 'Prop6': return { color: 'orange', 'weight' : 2, 'opacity' : .30 };
                    case 'Prop5': return { color: 'blue', 'weight' : 2, 'opacity': .30 };
                    default: return { color: 'green', 'weight' : 2, 'opacity' : .30 };
                    }
                    
                    },
                    onEachFeature: $scope.onEachFeature            
            }
            });

    });


	}
]);
