'use strict';

angular.module('core').controller('HomeController', ['$scope', '$filter', '$rootScope', 'Authentication', '$http','$stateParams', '$state', 'leafletData', '$compile', 'Boundaries', 'Trails',
  function ($scope, $filter, $rootScope, Authentication, $http, $stateParams, $state, leafletData, $compile, Boundaries, Trails) {
    // This provides Authentication context.
    $scope.authentication = Authentication;

     var mapboxTile = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
       id: 'meangurlz.cd22205e',
       accessToken: 'pk.eyJ1IjoibWVhbmd1cmx6IiwiYSI6ImNpa2g1cnF4YjAxNGx2dGttcGFmcm5nc3MifQ.ftvskKymYXv1VfqJPU9tnQ'
     });

     var mapboxSatellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
       id: 'mapbox.satellite',
       accessToken: 'pk.eyJ1IjoibWVhbmd1cmx6IiwiYSI6ImNpa2g1cnF4YjAxNGx2dGttcGFmcm5nc3MifQ.ftvskKymYXv1VfqJPU9tnQ'
     });

     var mapboxDark = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
       id: 'mapbox.dark',
       accessToken: 'pk.eyJ1IjoibWVhbmd1cmx6IiwiYSI6ImNpa2g1cnF4YjAxNGx2dGttcGFmcm5nc3MifQ.ftvskKymYXv1VfqJPU9tnQ'
     });

     var tilesDict = {
       street: mapboxSatellite,
       light: mapboxTile,
       dark: mapboxDark
     };

    var setFilter = function(feature){
        if(feature.properties.OWNER === 'Private Individual(s)'){
            return false;
        }
        else{
            return true;
        }
    };

    $scope.clearFilter = function() {
      console.log('Cleared filters');
      $scope.customStyle.style = { 'background-color':'#b8bbbc' };
      $scope.searchingBar = {};
      $scope.acres_search = {};
      // $scope.rad_search = {};
      $scope.checkBoxAcres = false;
      $scope.clearRadius();
      $scope.rad_search = $scope.radius_filter(undefined);
      // $scope.radius_filter = {};
    };

    $scope.customStyle = {};
    $scope.turnClear = function (){
        $scope.customStyle.style = { 'background-color':'#a32f2f' };
    };


    // ilter: searchingBar | filter:filters.MGRINST | filter:acres_search | filter:rad_search

    Boundaries.query().$promise.then(function (res) {
        $rootScope.boundaries = res;

        $scope.geoLayer = L.geoJson($rootScope.boundaries, {
            style:
            { color: '#9BC152', 'weight' : 2 },
            onEachFeature: $scope.onEachFeature,
            filter: function(feature, layer) {
                return setFilter(feature);
            }
        }).addTo($scope.map);
      });

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
            { color: '#9BC152', 'weight' : 2 },
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
            { color: '#9BC152', 'weight' : 2 },
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
        tiles:mapboxTile,
    	controls: {
            fullscreen: { position: 'topleft' }
        }
    });

    //Creating Mapbox Tile

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

            $rootScope.currLocation = e.latlng;


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
                fillColor: '#3473e2',
                opacity: 0.2,
                fillOpacity: 0.2

            }).addTo($scope.map);
            if(outerCircle){
                $scope.map.removeLayer(outerCircle);
            }

            outerCircle = L.circleMarker(e.latlng, {
                fillColor: '#3473e2',
                opacity: 0.5,
                weight: 1,
                fillOpacity: 0.5

            }).setRadius(10).addTo($scope.map);
            if(innerCircle){
                $scope.map.removeLayer(innerCircle);
            }

            innerCircle = L.circleMarker(e.latlng, {
                fillColor: '#3473e2',
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

    $scope.sliderValue = '35';
    $scope.sliderOptions = {       
        from: 1,
        to: 15,
        step: 1,
        dimension: ' mi',
        scale: [1, 3, 5, 7, 9, 11, 13, { val: 15, label:'15+' }] ,
        limits: false,
        modelLabels: { 15: '15+' },
        css: {
          background: { 'background-color': 'silver' },
          before: { 'background-color': '#407186' },
          default: { 'background-color': 'white' },
          after: { 'background-color': '#407186' },
          pointer: { 'background-color': 'white' }

        },
        callback: function(value, elt){
            console.log(value);
            if (value === '15'){
                $scope.rad_search = $scope.radius_filter(undefined);
            }
            else{
                $scope.rad_search = $scope.radius_filter(value);
            }
        }        
    };

    $scope.radius_filter = {};
    var circle;
    $scope.radius_filter = function(chosen){
        if(chosen === undefined) {
            if(circle){
                $scope.map.removeLayer(circle);
            }
        }
        else if (chosen === ''){
            if(circle){
                $scope.map.removeLayer(circle);
            }
        } else {
            if(circle){
                $scope.map.removeLayer(circle);
            }
            circle = L.circle($scope.current_location, chosen*1609.34, {
                clickable: false,
                stroke: true,
                fillColor: '#3473e2',
                opacity: 0.08,
                fillOpacity: 0.03

            }).addTo($scope.map);
            $scope.map.panTo($scope.current_location,{ animate: true, duration: 0.5 });
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
    $scope.clearRadius = function(){
        document.getElementById('rad_search_box').value = '';
    };

    $scope.changeTiles = function(tiles) {
  console.log(tiles);
  $scope.map.removeLayer(mapboxTile);
  $scope.map.removeLayer(mapboxSatellite);
  $scope.map.removeLayer(mapboxDark);

  tilesDict[tiles].addTo($scope.map);
};

    $scope.acreText = 'Acres:';
    $scope.acreSize = {};
    $scope.acreSize = function(chosen) {
      var minSize;
      var maxSize;
      var maxString;
      var minString;
      var acreString;
      if(chosen === undefined){
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

        if (maxSize === 10000) {
          acreString = minSize + '+';
        } else if (minSize === 0 && maxSize === 10001) {
          acreString = '';
        }
        else {
          acreString = minSize + ' - ' + (maxSize+1);
        }


        $scope.acreText = 'Acres: ' + acreString;

      }

      return function predicateFunc(item) {
        return minSize <= item.properties.TOTACRES && item.properties.TOTACRES <= maxSize;
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
  $scope.showChildrens = function(item){
    console.log('HERE');
        item.active = !item.active;
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

        if((navigator.platform.indexOf('iPhone') !== -1) || (navigator.platform.indexOf('iPod') !== -1) || (navigator.platform.indexOf('iPad') !== -1))
         //window.open("maps://maps.google.com/maps?daddr=" + lat + "," + long + "&amp;ll=");
        window.open('maps://maps.google.com/maps/dir/' + $rootScope.currLocation.lat + ',' + $rootScope.currLocation.lng + '/' + lat + ',' + long);
        else
         //window.open("http://maps.google.com/maps?daddr=" + lat + "," + long + "&amp;ll=");
        window.open('http://maps.google.com/maps/dir/' + $rootScope.currLocation.lat + ','+ $rootScope.currLocation.lng + '/' + lat + ',' + long);


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
                fillColor: '#3473e2',
                opacity: 0.2,
                fillOpacity: 0.2

            }).addTo($scope.map);
            if(outerCircle){
                $scope.map.removeLayer(outerCircle);
            }
            outerCircle = L.circleMarker(e.latlng, {
                fillColor: '#3473e2',
                opacity: 0.5,
                weight: 1,
                fillOpacity: 0.5

            }).setRadius(10).addTo($scope.map);
            if(innerCircle){
                $scope.map.removeLayer(innerCircle);
            }

            innerCircle = L.circleMarker(e.latlng, {
                fillColor: '#3473e2',
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
        // toggleFilterMenu : function(isFilterOpen){
        //     console.log(isFilterOpen);
        //     isFilterOpen = !isFilterOpen;
        //     return{
        //         restrict: 'A',
        //         replace: false,
        //         link: function (scope, element) {
        //             scope.isFilterOpen = false;
        //             scope.toggleFilterMenu = function () {
        //                 scope.isFilterOpen = !scope.isFilterOpen;

        //             };
        //         }
        //     };
        // },
        expand : function(feature){
            $state.go('boundaries.view', { 'boundaryId': $scope.feature._id, 'center': $scope.center, 'boundaryFeature':  $scope.feature });
        }
    });

	}
]).directive('filtersMenu', function () {
    return {
        restrict: 'A',
        replace: false,
        link: function (scope, element) {
            scope.isFilterOpen = false;
            scope.toggleFilterMenu = function () {
                scope.isFilterOpen = !scope.isFilterOpen;
                console.log('here');
            };
        }
    };
});
