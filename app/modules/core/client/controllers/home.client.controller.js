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


    //these coordinates were used to draw the polygon below
   
    var polygonExample = {
        Waldo: {
            lat: 29.7897,
            lng: -82.1708
        },
        LaCrosse: {
            lat: 29.8500,
            lng: -82.4000
        },
        Micanopy: {
            lat: 29.5064,
            lng: -82.2819
        },
        Al: {
            lat: 29.7792,
            lng: -82.4797
        }
    };
    var regions = { //defines corner coordinates for maxboundary
        alachua: {
            northEast: {
                lat: 29.939227,
                lng: -82.103027
            },
            southWest: {
                lat: 29.478818,
                lng: -82.786926
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

        //This is an example of how to draw polygons on the map
        paths: {
            polygon: {
                type: 'polygon',
                latlngs: [
                    polygonExample.Waldo,
                    polygonExample.LaCrosse,
                    polygonExample.Al,
                    polygonExample.Micanopy
                ],
                color: 'red',
                fillColor: 'red',
                fillOpacity: 0.1,
                weight: 2
            }
        }
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
    });
   
   /*
        Draw Markers
    */
    var marker;
    angular.extend($scope, {

        findUser : function(){
            $scope.map.locate({ setView : true, maxZoom : 17 });
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
                    style: function(feature){
                        
                    switch (feature.properties.Name) {
                    case 'Prop6': return { color: 'orange' };
                    case 'Prop5': return { color: 'blue' };
                    default: return { color: 'green' };
                    }
        
                    },
                    onEachFeature: $scope.onEachFeature            
            }
            });

    });


	}
]);
