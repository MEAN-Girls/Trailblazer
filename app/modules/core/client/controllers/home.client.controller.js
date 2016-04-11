'use strict';

angular.module('core').controller('HomeController', ['$scope', '$filter', '$rootScope', 'Authentication', '$http','$stateParams', '$state', 'leafletData', '$compile', 'Boundaries',
  function ($scope, $filter, $rootScope, Authentication, $http, $stateParams, $state, leafletData, $compile, Boundaries) {
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
//        console.log($rootScope.boundaries[0]);
        L.geoJson($rootScope.boundaries, {
            style: {
                color: '#8AAAB5',
                weight : 2
            },
            onEachFeature: $scope.onEachFeature

        }).addTo($scope.map);
      });

    //};

    var regions = { //defines corner coordinates for maxboundary
        alachua: {
            northEast: {
                /*lat: 30.02065233044293,
                lng: -82.90171655273438*/
                /*lat: 30.147827,
                lng: -81.648200*/
                lat: 30.349500,
                lng: -81.510871
            },
            southWest: {
                /*lat: 29.3742238956322,
                lng: -83.01408227539062*/
                /*lat: 29.222027,
                lng: -82.845709*/
                lat: 29.181269,
                lng: -82.928107
            }
        }
    };


    $scope.focusBoundary = function(boundary){

        var poly = L.geoJson(boundary);
        var center = poly.getBounds().getCenter();
       // console.log(center);
        //openPopup(boundary);
        openPopup(boundary, center);
        /*$scope.map.setView(center, 13,
            {
                pan: { animate: true, duration: 1 }
            });*/
//        var panCoords = center;
//        panCoords.lat = center.lat + 0.03;
//        $scope.map.setView(panCoords);
        $scope.toggleMenu();
        /*function onZoom(e) {
            $scope.map.closePopup();
        }
        $scope.map.once('zoomstart', onZoom);

        $scope.map.once('zoomstart', onZoom);*/


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
    var innerCircle;
    var outerCircle;
    var radiusCircle;
    $scope.map = null;
    $scope.current_location = null;

    leafletData.getMap('county').then(function(map) {

        $scope.map = map;
        $scope.map.options.minZoom = 10;
        $scope.map.locate({ setView : true, maxZoom : 13 });
        $scope.map.on('locationfound', function (e){
            $scope.current_location = e.latlng;
            /*if(marker){
            $scope.map.removeLayer(marker);
            }
            marker = new L.marker(e.latlng).addTo($scope.map);*/
            if(radiusCircle){
                $scope.map.removeLayer(radiusCircle);
            }

            radiusCircle = L.circle(e.latlng, e.accuracy, {
                stroke: false,
                fillColor: 'blue',
                opacity: 0.2,
                fillOpacity: 0.2

            }).addTo($scope.map);
            if(outerCircle){
                $scope.map.removeLayer(outerCircle);
            }

            outerCircle = L.circleMarker(e.latlng, {
                fillColor: 'blue',
                opacity: 0.5,
                weight: 1,
                fillOpacity: 0.5

            }).setRadius(10).addTo($scope.map);
            if(innerCircle){
                $scope.map.removeLayer(innerCircle);
            }

            innerCircle = L.circleMarker(e.latlng, {
                fillColor: 'blue',
                color: 'white',
                opacity: 1,
                weight: 2,
                fillOpacity: 1

            }).setRadius(7).addTo($scope.map);

        });
        mapboxTile.addTo(map); //added MapBox tile to Map
        $scope.map.on('popupopen', function(e) {
        var px = $scope.map.project(e.popup._latlng); // find the pixel location on the map where the popup anchor is
        px.y -= e.popup._container.clientHeight/2; // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
        $scope.map.panTo($scope.map.unproject(px),{ animate: true, duration: 1 }); // pan to new center
        });
    });

    // $scope.filter('acre_space', function() {
    //   return function(acres) {
    //     var out = [];
    //
    //     angular.forEach(acres, function() {
    //
    //
    //
    //     })
    //
    //     return out;
    //   }
    //
    //
    //
    // })

    

    // $scope.acreSize = function(minSize, maxSize) {
    //   // console.log(minSize);
    //
    //   if (minSize === undefined) minSize = 0;
    //   if (maxSize === undefined) maxSize = 1000;
    //
    //   return function predicateFunc(item) {
    //
    //     // console.log(item.properties.TOTACRES);
    //     return minSize <= item.properties.TOTACRES && item.properties.TOTACRES <= maxSize;
    //   };
    //
    // };

     // setTimeout(function(){
     //        console.log("HERE");
     //        console.log($scope.current_location);
     //        var circle = L.circle($scope.current_location, 10000, {
     //            clickable: false,
     //            stroke: true,
     //            fillColor: 'blue',
     //            opacity: 0.1,
     //            fillOpacity: 0.05
        
     //        }).addTo($scope.map);
            
     //    }, 6000);
    
    $scope.radius_filter = {};
    var circle;
    $scope.radius_filter = function(chosen){
        console.log('CALLED');
        if(chosen === undefined) {
            if(circle){
                $scope.map.removeLayer(circle);
            }
        }
        else if (chosen.small === ''){
            if(circle){
                $scope.map.removeLayer(circle);
            }
        } else {
            if(circle){
                $scope.map.removeLayer(circle);
            }
            circle = L.circle($scope.current_location, chosen.small*1609.34, {
                clickable: false,
                stroke: true,
                fillColor: 'blue',
                opacity: 0.08,
                fillOpacity: 0.03
                
            }).addTo($scope.map);
            
            return function containsFunction(item) {
                if(circle){
                    var poly = L.geoJson(item);
                    return circle.getBounds().contains(poly.getBounds().getCenter());
                }
                else{
                    return item;
                }
            };
        }
    };
    /*The above function is constantly updating. Consider storing the filtered results in a temporary list, and reading from there, rather
    than computing*/
    $scope.acreSize = {};
    $scope.acreSize = function(chosen) {
    console.log('CALLING ACRE');
    console.log(chosen);
//      console.log(chosen);
      var minSize;
      var maxSize;
      if(chosen === undefined){
//        console.log("No size initialized");
        minSize = 0;
        maxSize = 10001;
      } else {
        minSize = 0;
        maxSize = 10001;
        if(chosen.large === 1){
          minSize = 1000;
          maxSize = 10000;
        }

        if(chosen.medium === 1){
          minSize = 400;
          if(maxSize !== 10000) {
            maxSize = 999;
          }
        }

        if(chosen.small === 1){
          minSize = 0;
          if(maxSize === 10001){
            maxSize = 399;
          }
        }
      }


      // if (minSize === undefined) minSize = 0;
      // if (maxSize === undefined) maxSize = 1000;

      return function predicateFunc(item) {

        // console.log(item.properties.TOTACRES);
        return minSize <= item.properties.TOTACRES && item.properties.TOTACRES <= maxSize;
        // return item;
      };

    };
    var lastChecked = -1;
  $scope.uncheck = function (event) {
    if(event.target.value === lastChecked){
      delete $scope.forms.selected;
      lastChecked = -1;
    }else{
      lastChecked = event.target.value;
    }
  };


   /*
        Draw Markers
    */
    function openPopup(feature, latlng){

                    // console.log(feature.properties.kind);

                    $scope.feature = feature;
                    $scope.boundaryId = $scope.feature._id;
                    // console.log($scope.boundaryId);
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
//                    $scope.map.setView(latlng, 13);
                    var popup = L.popup(
                    {
                        minWidth: 200,
                        maxHeight: 300
                    })
                        .setLatLng(latlng)
                        .setContent($compile('<p><b>{{name}}</b><br><br>{{area}}</br><br>{{managing_a}}</br><br>{{description}}</br><br><button class="btn btn-success" type="button" ng-click="expand(feature)">See More...</button></p>')($scope)[0])
                        //need to $compile to introduce ng directives
                        .openOn($scope.map);


    }

    angular.extend($scope, {
        tiles : mapboxTile,
        findUser : function(){
            $scope.map.locate({ setView : true, maxZoom : 13 });
            $scope.map.on('locationfound', $scope.onLocationFound);
        },

        homeView : function(){
          var alachuaZoom = L.latLng(29.651300, -82.326752);
            $scope.map.setView(alachuaZoom, 10);

        },

        onLocationFound : function(e){
            /*if(marker){
                $scope.map.removeLayer(marker);
            }
            marker = new L.marker(e.latlng).addTo($scope.map);*/
            if(outerCircle){
                $scope.map.removeLayer(radiusCircle);
            }

            radiusCircle = L.circle(e.latlng, e.accuracy, {
                stroke: false,
                fillColor: 'blue',
                opacity: 0.2,
                fillOpacity: 0.2

            }).addTo($scope.map);
            if(outerCircle){
                $scope.map.removeLayer(outerCircle);
            }

            outerCircle = L.circleMarker(e.latlng, {
                fillColor: 'blue',
                opacity: 0.5,
                weight: 1,
                fillOpacity: 0.5

            }).setRadius(10).addTo($scope.map);
            if(innerCircle){
                $scope.map.removeLayer(innerCircle);
            }

            innerCircle = L.circleMarker(e.latlng, {
                fillColor: 'blue',
                color: 'white',
                opacity: 1,
                weight: 2,
                fillOpacity: 1

            }).setRadius(7).addTo($scope.map);


         },
        onEachFeature : function(feature, layer){

                layer.on('click', function(e) {
                    openPopup(feature, e.latlng);
                    // console.log(e);
//                    var clickCoords = e.latlng;
//                    clickCoords.lat = clickCoords.lat + 0.04;
//                    $scope.map.setView(clickCoords);

                });

        },
        expand : function(feature){


            $state.go('boundaries.view', { 'boundaryName': $scope.name_test, 'center': $scope.center, 'boundaryFeature':  $scope.feature });

        }

    });

	}
]).directive('offCanvasMenu', function () {
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
