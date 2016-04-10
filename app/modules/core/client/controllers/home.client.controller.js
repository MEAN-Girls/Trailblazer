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
    Boundaries.query().$promise.then(function (res) {
        $rootScope.boundaries = res;

        $scope.geoLayer = L.geoJson($rootScope.boundaries, { 
            style: 
            { color: '#8AAAB5', 'weight' : 2 },
            onEachFeature: $scope.onEachFeature,
            filter: function(feature, layer) {
            return setFilter(feature);
            }

        }).addTo($scope.map);
      });

    var setFilter = function(feature){
        if(feature.properties.OWNER === 'Private Individual(s)'){
            return false;
        }
        else{
            return true;
        }
    };
    

    var regions = { //defines corner coordinates for maxboundary
        alachua: {
            northEast: {
                lat: 30.349500,
                lng: -81.510871
            },
            southWest: {
                lat: 29.181269,
                lng: -82.928107
            }
        }
    };


    $scope.focusBoundary = function(boundary){

        var poly = L.geoJson(boundary);
        var center = poly.getBounds().getCenter();
        openPopup(boundary, center);
        $scope.toggleMenu();
    };
    $scope.filterPrivate = '!Private Individual(s)';
    $scope.showAll = function(){
            $scope.map.removeLayer($scope.geoLayer);
            console.log($scope.checked);
            if($scope.checked === false){
            $scope.geoLayer = L.geoJson($rootScope.boundaries, { 
            style: 
            { color: '#8AAAB5', 'weight' : 2 },
            onEachFeature: $scope.onEachFeature,
            filter: function(feature, layer) {
            return setFilter(feature);
            }
            }).addTo($scope.map);
            $scope.filterPrivate = '!Private Individual(s)';
            }
            else{
                $scope.geoLayer = L.geoJson($rootScope.boundaries, { 
            style: 
            { color: '#8AAAB5', 'weight' : 2 },
            onEachFeature: $scope.onEachFeature
            }).addTo($scope.map);
            $scope.filterPrivate = '';
            }
    };

	angular.extend($scope, {
        maxbounds: regions.alachua, // Added maxbounds declaration
		alachua: {
			lat: 29.671316,
			lng: -82.327766,
			zoom: 13
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

    leafletData.getMap('county').then(function(map) {

        $scope.map = map;
        $scope.map.options.minZoom = 10;
        $scope.map.locate({ setView : true, maxZoom : 13 });
        $scope.map.on('locationfound', function (e){
            $rootScope.currLocation = e.latlng;
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
        $scope.map.panTo($scope.map.unproject(px),{ animate: true }); // pan to new center
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

    $scope.acreSize = {};

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

    $scope.acreSize = function(chosen) {
      // console.log(minSize);
      console.log(chosen);
      var minSize;
      var maxSize;
      if(chosen === undefined){
        console.log("No size initialized");
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
                        .setContent($compile('<p><b>{{name}}</b><br><br>{{area}}</br><br>{{managing_a}}</br><br>{{description}}</br><br><a style="cursor: pointer;" ng-click="navFunction(center.lat, center.lng)">Take me there!</a><br><br><button class="btn btn-success" type="button" ng-click="expand(feature)">See More...</button></p>')($scope)[0])
                        //need to $compile to introduce ng directives
                        .openOn($scope.map);


    }

    $scope.navFunction = function(lat, long){

        if((navigator.platform.indexOf("iPhone") !== -1) || (navigator.platform.indexOf("iPod") !== -1) || (navigator.platform.indexOf("iPad") !== -1))
         //window.open("maps://maps.google.com/maps?daddr=" + lat + "," + long + "&amp;ll=");
        window.open("maps://maps.google.com/maps/dir/" + $rootScope.currLocation.lat + "," + $rootScope.currLocation.lng + "/" + lat + "," + long);
        else
         //window.open("http://maps.google.com/maps?daddr=" + lat + "," + long + "&amp;ll=");
        window.open("http://maps.google.com/maps/dir/" + $rootScope.currLocation.lat + "," + $rootScope.currLocation.lng + "/" + lat + "," + long);


    };

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
