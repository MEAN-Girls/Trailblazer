'use strict';

// Boundaries controller
angular.module('boundaries').controller('BoundariesController', ['$scope',
                                                              '$stateParams',
                                                              '$rootScope',
                                                              '$location',
                                                              'Authentication',
                                                              'Boundaries',
                                                              '$state',
                                                              'leafletData',
                                                              '$http',
                                                              'Trails',
                                                              '$compile',
  function ($scope, $stateParams, $rootScope, $location, Authentication, Boundaries, $state, leafletData, $http, Trails, $compile) {
    $scope.authentication = Authentication;
    console.log($stateParams.boundaryId);
    $scope.loading = true;
    $scope.success = false;
    $scope.statusMessage = '!';


    /*
      Map logic
    */
    if($state.current.name === 'boundaries.view') {
      var boundaryFeature = $stateParams.boundaryFeature;
      var boundaryId = $stateParams.boundaryId;
      var center = $stateParams.center;

      //reroute because we came here from somewhere other than home page
    if ($stateParams.boundaryFeature === null && $stateParams.boundaryId !== null){
      $state.go('home');
    }
      //create a bunch of variables from map data
      $scope.b_maname = boundaryFeature.properties.MANAME;
      $scope.b_mgrinst = boundaryFeature.properties.MGRINST;
      $scope.b_owner = boundaryFeature.properties.OWNER;
      $scope.b_ma_website = boundaryFeature.properties.MA_WEBSITE;
      $scope.b_manager = boundaryFeature.properties.MANAGER;
      $scope.b_ownertypes = boundaryFeature.properties.OWNERTYPES;
      $scope.b_area = boundaryFeature.properties.AREA;
      $scope.b_totacres = boundaryFeature.properties.TOTACRES;

      if(boundaryFeature.properties.DESC2 !== 'ZZ'){
          $scope.b_desc = boundaryFeature.properties.DESC1 + boundaryFeature.properties.DESC2;
      }
      else if (boundaryFeature.properties.DESC1 !== 'ZZ'){
          $scope.b_desc = boundaryFeature.properties.DESC1;
      }
      else {
          $scope.b_desc = 'No description available. ';
      }

      var mapboxTile = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'meangurlz.cd22205e',
        accessToken: 'pk.eyJ1IjoibWVhbmd1cmx6IiwiYSI6ImNpa2g1cnF4YjAxNGx2dGttcGFmcm5nc3MifQ.ftvskKymYXv1VfqJPU9tnQ'
      });

      $scope.map = null;

      leafletData.getMap('boundary').then(function(map) {
        mapboxTile.addTo(map);
        $scope.map = map;
        var firstMarker = $stateParams.boundaryFeature.geometry.coordinates[0];
        var secondMarker = $stateParams.boundaryFeature.geometry.coordinates[$stateParams.boundaryFeature.geometry.coordinates.length - 1];
        var group = new L.featureGroup([firstMarker, secondMarker]);
      });

      var setZoom = function(){
        if($stateParams.boundaryFeature.properties.TOTACRES >= 10000){
           return 12;
        }
        else if ($stateParams.boundaryFeature.properties.TOTACRES >= 5000){
           return 13;
        }
        else if ($stateParams.boundaryFeature.properties.TOTACRES >= 2500){
           return 14;
        }
        else {
           return 15;
        }
      };

      angular.extend($scope, {
        alachua: { //set the center of the view
          lat: center.lat,
          lng: center.lng,
          zoom: setZoom()
        },
        controls: { //position the controls
          fullscreen: {
            position: 'topleft'
          }
        },
        geojson: { //sets the geojson data based on the boundary feature
          data: boundaryFeature,
          style: {
                  color: '#9BC152', 'weight' : 2      
          }
        },
        tiles: mapboxTile
      });

     $scope.showChildren = function(item){
        item.active = !item.active;
      };

      $scope.parkingIcon = L.icon({
      iconUrl: '/modules/core/client/img/icons/parking.png',
      iconSize:     [38, 95], // size of the icon
      iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
      popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
      });

      $scope.boundary_items = [ //info for info sidebar
          {
              name: 'Managing Information',
              subItems: [
                  { desc: 'Managing Institution:' },
                  { name: $scope.b_mgrinst },
                  { desc: 'Manager:' },
                  { name: $scope.b_manager },
                  { desc: 'Manager Website:' },
                  { name: $scope.b_ma_website }
              ]
          },
          {
              name: 'Owner Information',
              subItems: [
                  { desc: 'Owner:' },
                  { name: $scope.b_owner },
                  { desc: 'Owner Type:' },
                  { name: $scope.b_ownertypes }
              ]
          },
          {
              name: 'Property Sizing',
              subItems: [
                  { desc: 'Area:' },
                  { name: $scope.b_area },
                  { desc: 'Total Acres:' },
                  { name: $scope.b_totacres }
              ]
          },
          {
              name: 'About',
              subItems: [
                  { desc: 'Description:' },
                  { name: $scope.b_desc }
              ]
          }
      ];

      Trails.query().$promise.then(function (res) { //query the trails module and draw them on the map
        $scope.trails = res;
        L.geoJson($scope.trails, {
            style: function(feature){
                if(feature.properties.Name === 'parking'){
                  console.log(feature);
                  return { icon: $scope.parkingIcon };
                }
                else if(feature.properties.color !== 'null'){
                  return { color: feature.properties.color, weight : 2, dashArray: '3' };
                }
                else{
                  return { color: 'red', weight : 2 };
                }
            },
            onEachFeature: $scope.onEachFeature
        }).addTo($scope.map);
      });
      $scope.onEachFeature = function(feature, layer){ //if the feature is a parking feature, open popup with nav link
      layer.on('click', function(e) {
          if(feature.properties.Name === 'parking'){
            //openPopup(feature, e.latlng);
            console.log(e.latlng.lat);
            $scope.parkingLat = e.latlng.lat;
            $scope.parkingLng = e.latlng.lng;
            var popup = L.popup(
            {
                  minWidth: 200,
                  maxHeight: 300
            })
            .setLatLng(e.latlng)
            .setContent($compile('<p><a style="cursor: pointer;" ng-click="navFunction(parkingLat, parkingLng)">Take me there!</a><br></p>')($scope)[0])
            //need to $compile to introduce ng directives
            .openOn($scope.map);
          }
      });
     };
    $scope.navFunction = function(lat, long){ //creates a url that opens google maps for directions

        if((navigator.platform.indexOf('iPhone') !== -1) || (navigator.platform.indexOf('iPod') !== -1) || (navigator.platform.indexOf('iPad') !== -1))
         //window.open("maps://maps.google.com/maps?daddr=" + lat + "," + long + "&amp;ll=");
        window.open('maps://maps.google.com/maps/dir/' + $rootScope.currLocation.lat + ',' + $rootScope.currLocation.lng + '/' + lat + ',' + long);
        else
         //window.open("http://maps.google.com/maps?daddr=" + lat + "," + long + "&amp;ll=");
        window.open('http://maps.google.com/maps/dir/' + $rootScope.currLocation.lat + ',' + $rootScope.currLocation.lng + '/' + lat + ',' + long);


    };
    }
    /*
      Admin logic
    */
    else {

    // Create new Boundary
    $scope.create = function (content) {
      $scope.error = null;
      var boundary = new Boundaries(JSON.parse(content));

      boundary.$save(function (response) {
        $scope.success = true;
        $scope.statusMessage = 'Added';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Boundary
    $scope.remove = function () {
      if (confirm('Are you sure you want to delete this user?')) {
        Boundaries.delete({ boundaryId: $stateParams.boundaryId })
              .$promise.then(function (res) {
                    $scope.success = true;
                    $scope.statusMessage = 'Deleted';
              }, function(error) {
                $scope.error = 'Unable to remove boundary\n' + error;
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
        $scope.success = true;
        $scope.statusMessage = 'Updated';
        //$state.go('boundaries.list');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Boundaries
    $scope.find = function () {
      Boundaries.query().$promise.then(function (res) {
        $scope.boundaries = res;
        $scope.loading = false;
      });
    };

    // Find existing Boundary
    $scope.findOne = function () {
      angular.extend($scope, {
          edit: {
                lat: 29.671316,
                lng: -82.327766,
                zoom: 10
          }
      });

      Boundaries.get({ boundaryId: $stateParams.boundaryId })
        .$promise.then(function (res) {
            $scope.boundary = res;
            console.log($scope.boundary);
            var previewData = $scope.boundary;
            var poly = L.geoJson($scope.boundary);
            var center = poly.getBounds().getCenter();
            angular.extend($scope, {
              edit: {
                  lat: center.lat,
                  lng: center.lng,
                  zoom: 14
              },
              geojson: {
                data: previewData,
                style: {
                  color: 'red'
                }
              }
            });
         $scope.loading = false;
      });
    };

    $scope.showContent = function($fileContent){
      $scope.content = $fileContent;
      var previewData = JSON.parse($scope.content);
      angular.extend($scope, {
        center: {
            lat: 29.671316,
            lng: -82.327766,
            zoom: 10
        },
        geojson: {
          data: previewData,
          style: {
            color: 'red'
          }
        }
      });
    };
  }
}
]);
