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
			lat: 29.671316,
			lng: -82.327766,
			zoom: 13
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

    //Creating Mapbox Tile
    var mapboxTile = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
      id: 'meangurlz.pc7i20mi',
      accessToken: 'pk.eyJ1IjoibWVhbmd1cmx6IiwiYSI6ImNpa2g1cnF4YjAxNGx2dGttcGFmcm5nc3MifQ.ftvskKymYXv1VfqJPU9tnQ'
    });

    var marker;
    $scope.map = null;

    leafletData.getMap('county').then(function(map) {

        mapboxTile.addTo(map); //added MapBox tile to Map

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
            if(feature.properties.kind !== 'county'){
                layer.on('click', function(e){

                    $scope.feature = feature;
                    $scope.name_test = feature.properties.Name;
                    var poly = L.geoJson(feature);
                    $scope.center = poly.getBounds().getCenter();
                    console.log(e);
                    $rootScope.tempName = feature.properties.Name;
                    $rootScope.tempCoords = feature.geometry.coordinates;
                    var popup = L.popup()
                        .setLatLng(e.latlng)
                        .setContent($compile('<button type="button" ng-click="expand()">{{name_test}} - See More!!</button>')($scope)[0]) //need to $compile to introduce ng directives
                        .openOn($scope.map);

            });
            }
        },
        expand : function(feature){
            $state.go('boundarys.view', { 'boundaryName': $scope.name_test, 'center': $scope.center, 'boundaryFeature':  $scope.feature });
        }

    });

    $http.get('https://raw.githubusercontent.com/cduica/geojsontest/master/PCP_combined.geojson').success(function(data, status) {
            angular.extend($scope, {
                geojson: {
                    data: data,
                    style:
                    function(feature){

                    switch (feature.properties.Name) {
                    case 'Prop6': return { color: 'orange', 'weight' : 2 };
                    case 'Prop5': return { color: 'blue', 'weight' : 2 };
                    default: return { color: '#9ABBB4', 'weight' : 2 };
                    }

                    },
                    onEachFeature: $scope.onEachFeature
            }
            });

    });


	}
]);
