'use strict';

angular.module('core').controller('HomeController', ['$scope', '$rootScope', 'Authentication', '$http','$stateParams', '$state', 'leafletData', '$compile', 'Boundaries', 
  function ($scope, $rootScope, Authentication, $http, $stateParams, $state, leafletData, $compile, Boundaries) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

    /*
        Some quick references for leaflet use in the docs,

        L.Class = angular module. whenever you want to add some functionality

        Later on we will be adding factories to work with new classes.

        This is a simple rendering of our map.
    */
    //$scope.find = function () {
    Boundaries.query().$promise.then(function (res) {
        $rootScope.boundaries = res;
        console.log($rootScope.boundaries[0]);
        L.geoJson($rootScope.boundaries, { 
            style: 
            function(feature){

                    switch (feature.properties.Name) {
                    case 'Prop6': return { color: 'orange', 'weight' : 2 };
                    case 'Prop5': return { color: 'blue', 'weight' : 2 };
                    default: return { color: '#8AAAB5', 'weight' : 2, 'fillOpacity' : 0 };
                    }

            },
            onEachFeature: $scope.onEachFeature

        }).addTo($scope.map);
      });

    //};
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

    //Creating Mapbox Tile
    var mapboxTile = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
      id: 'meangurlz.cd22205e',
      accessToken: 'pk.eyJ1IjoibWVhbmd1cmx6IiwiYSI6ImNpa2g1cnF4YjAxNGx2dGttcGFmcm5nc3MifQ.ftvskKymYXv1VfqJPU9tnQ'
    });
    var marker;
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
        mapboxTile.addTo(map); //added MapBox tile to Map
    });

   /*
        Draw Markers
    */

    angular.extend($scope, {
        tiles : mapboxTile,
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

                    console.log(feature.properties.kind);

                    $scope.feature = feature;
                    $scope.boundaryId = $scope.feature._id;
                    console.log($scope.boundaryId);
                    $scope.name = feature.properties.MANAME;
                    $scope.area = feature.properties.TOTACRES + ' acres';
                    $scope.type = feature.properties.MATYPE; 
                    $scope.managing_a = feature.properties.MANAGING_A;
                    if(feature.properties.DESC2 !== 'ZZ'){
                        $scope.description = feature.properties.DESC1 + feature.properties.DESC2;
                    }
                    else if (feature.properties.DESC1 !== 'ZZ'){
                        $scope.description = feature.properties.DESC1;
                    } 
                    else {
                        $scope.description = 'No description available. ';
                    }
                    

                    var poly = L.geoJson(feature);
                    $scope.center = poly.getBounds().getCenter();
                    var popup = L.popup(
                    {
                        minWidth: 200,
                        maxHeight: 300
                    })
                        .setLatLng(e.latlng)
                        .setContent($compile('<p><b>{{name}}</b><br><br>{{area}}</br><br>{{managing_a}}</br><br>{{description}}</br><br><button class="btn btn-success" type="button" ng-click="expand()">See More...</button></p>')($scope)[0])
                        //need to $compile to introduce ng directives
                        .openOn($scope.map);

            });
            }
        },
        expand : function(feature){
            $state.go('boundaries.view', { 'boundaryId': $scope.boundaryId, 
                                            'center': $scope.center, 
                                            'boundaryFeature':  $scope.feature });
        }

    });

	}
]).directive('offCanvasMenu', function ($stateParams) {
  var bFeature = $stateParams.boundaryFeature;
    return {
        restrict: 'A',
        replace: false,
        link: function (scope, element) {
            scope.isMenuOpen = false;
            scope.toggleMenu = function () {
                scope.isMenuOpen = !scope.isMenuOpen;
            };
        }
    };
});
