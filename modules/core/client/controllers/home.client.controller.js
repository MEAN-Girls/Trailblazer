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

     var tilesDict = {          //dictionary of Mapbox tile styles
       street: mapboxSatellite,
       light: mapboxTile,
       dark: mapboxDark
     };

    var setFilter = function(feature){   //used by leaflet filter to decide which properties are private on page load
        if(feature.properties.OWNER === 'Private Individual(s)'){
            return false;
        }
        else{
            return true;
        }
    };

    $scope.clearFilter = function() {    //clear all of the filters
      console.log('Cleared filters');
      $scope.customStyle.style = { 'background-color':'#b8bbbc' };  //revert button style
      $scope.searchingBar = {}; //clear search bar text
      $scope.acres_search = {}; //clear acre search
      $scope.checkBoxAcres = false; //clear acre radio buttons
      $scope.rad_search = $scope.radius_filter(undefined);  //clear radius search
      $scope.sliderValue = '15';                            //revert slider value
    };

    $scope.customStyle = {};          //custom styles used for clear button
    $scope.turnClear = function (){
        $scope.customStyle.style = { 'background-color':'#a32f2f' };  //clear button pressed
    };

    Boundaries.query().$promise.then(function (res) { //retrieve all the boundaries from db and add them to the map
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

    $scope.focusBoundary = function(boundary){ //opens a popup when a boundary is clicked on the sidebar
        var poly = L.geoJson(boundary);
        var center = poly.getBounds().getCenter();
        openPopup(boundary, center);
        $scope.toggleMenu();
    };
    $scope.filterPrivate = '!Private Individual(s)';
    $scope.showAll = function(){  //A function that deletes and redraws boundaries on map depending on show private toggle
            $scope.map.removeLayer($scope.geoLayer);
            console.log($scope.checked);
            if($scope.checked === false){ //if show private properties is unchecked, delete them and draw nonprivate
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
            else{ //else draw all properties including private
                $scope.geoLayer = L.geoJson($rootScope.boundaries, {
            style:
            { color: '#9BC152', 'weight' : 2 },
            onEachFeature: $scope.onEachFeature
            }).addTo($scope.map);
            $scope.filterPrivate = '';
            }
    };

	angular.extend($scope, {
        maxbounds: regions.alachua, // Restricts map panning based on region set in alachua
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

    //Created Mapbox Tile

    var marker;
    var innerCircle;
    var outerCircle;
    var radiusCircle;
    $scope.map = null;
    $scope.current_location = null;

    leafletData.getMap('county').then(function(map) { // gets map and performs various functions

        $scope.map = map;
        $scope.map.options.minZoom = 10; //set minzoom so users cant zoom out completely
        $scope.map.locate({ setView : true, maxZoom : 13 }); //locates user and centers on them
        $scope.map.on('locationfound', function (e){ //when location is found, draw a circle on users location

            $rootScope.currLocation = e.latlng;
            $scope.current_location = e.latlng;
            if(radiusCircle){
                $scope.map.removeLayer(radiusCircle);
            }

            //draw blue radius marker
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
    $scope.sliderOptions = {       //filter radius slider
        from: 1,                  //slider min
        to: 15,                    //slider max
        step: 1,                   //slider inrement
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
            $scope.turnClear();
            if (value === '15'){
                $scope.rad_search = $scope.radius_filter(undefined);  //default slider
            }
            else{
                $scope.rad_search = $scope.radius_filter(value);      //take in slider data
            }
        }
    };

    $scope.radius_filter = {};
    var circle;
    $scope.radius_filter = function(chosen){          //filter baseed on radius from user
        if(chosen === undefined) {                    //no filter raidus chosen
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
            circle = L.circle($scope.current_location, chosen*1609.34, {  //determine user location and draws circle
                clickable: false,
                stroke: true,
                fillColor: '#3473e2',
                opacity: 0.08,
                fillOpacity: 0.03

            }).addTo($scope.map);
            $scope.map.panTo($scope.current_location,{ animate: true, duration: 0.5 }); //centers to current location
            return function containsFunction(item) {
                if(circle){
                    var poly = L.geoJson(item);
                    return circle.getBounds().contains(poly.getBounds().getCenter());   //bounds of circle filter list
                }
                else{
                    return item;
                }
            };
        }
    };

    $scope.clearRadius = function(){            //clear the radius search box
        document.getElementById('rad_search_box').value = '';
    };

    $scope.changeTiles = function(tiles) {      //change displayed tiles
      $scope.map.removeLayer(mapboxTile);       //removes all displayed tiles to avoid multi-layering
      $scope.map.removeLayer(mapboxSatellite);
      $scope.map.removeLayer(mapboxDark);

      tilesDict[tiles].addTo($scope.map);       //add tile to map
    };

    //set the acre filter range
    $scope.acreText = 'Acres:';
    $scope.acreSize = {};
    $scope.acreSize = function(chosen) {
      var minSize;
      var maxSize;
      var maxString;
      var minString;
      var acreString;
      if(chosen === undefined){ //if no filter selected
        minSize = 0;
        maxSize = 10001;
      } else {                  //all case if filter selected
        minSize = 0;
        maxSize = 10001;
        if(chosen.large === 1){  //large filter selected
          minSize = 1000;
          maxSize = 10000;
        }
        if(chosen.medium === 1){  // medium filter selected
          minSize = 400;
          if(maxSize !== 10000) {
            maxSize = 999;
          }
        }
        if(chosen.small === 1){  //small filter selected
          minSize = 0;
          if(maxSize === 10001){
            maxSize = 399;
          }
        }

        //range text handling
        if (maxSize === 10000) {      //range to positive infinity
          acreString = minSize + '+';
        } else if (minSize === 0 && maxSize === 10001) {    //no range
          acreString = '';
        }
        else {                       //normal range
          acreString = minSize + ' - ' + (maxSize+1);
        }
        $scope.acreText = 'Acres: ' + acreString;     //set range text
      }

      return function predicateFunc(item) {
        return minSize <= item.properties.TOTACRES && item.properties.TOTACRES <= maxSize;  //filter range set
      };

    };
    var lastChecked = -1;

  $scope.uncheck = function (event) {   //radio button checking
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
    function openPopup(feature, latlng){ //function that gets data from boundary and opens popup
      $scope.feature = feature;
      $scope.boundaryId = $scope.feature._id;
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
          .setLatLng(latlng)
          .setContent($compile('<p><b>{{name}}</b><br><br>{{area}}</br><br>{{managing_a}}</br><br>{{description}}</br><br><a style="cursor: pointer;" ng-click="navFunction(center.lat, center.lng)">Take me there!</a><br><br><button class="btn btn-success" type="button" ng-click="expand(feature)">See More...</button></p>')($scope)[0])
          //need to $compile to introduce ng directives
          .openOn($scope.map);
    }

    $scope.navFunction = function(lat, long){ //creates a url that opens google maps for directions

        if((navigator.platform.indexOf('iPhone') !== -1) || (navigator.platform.indexOf('iPod') !== -1) || (navigator.platform.indexOf('iPad') !== -1))

        window.open('maps://maps.google.com/maps/dir/' + $rootScope.currLocation.lat + ',' + $rootScope.currLocation.lng + '/' + lat + ',' + long);
        else

        window.open('http://maps.google.com/maps/dir/' + $rootScope.currLocation.lat + ','+ $rootScope.currLocation.lng + '/' + lat + ',' + long);

    };

    angular.extend($scope, {
        tiles : mapboxTile,
        findUser : function(){ //finds user when find user button is pressed
            $scope.map.locate({ setView : true, maxZoom : 13 });
            $scope.map.on('locationfound', $scope.onLocationFound);
        },

        homeView : function(){

        var alachuaZoom = L.latLng(29.651300, -82.326752);  //sets view for all of Alachua
            $scope.map.setView(alachuaZoom, 10);
        },

        onLocationFound : function(e){    //draws current location marker
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
        onEachFeature : function(feature, layer){ //what gets done on each boundary in feature collection
            layer.on('click', function(e) { //event listener for clicked boundary
                openPopup(feature, e.latlng);
            });
        },
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
