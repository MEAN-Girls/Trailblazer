'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 
                                            'ngAnimate', 
                                            'ngMessages', 
                                            'ui.router', 
                                            'ui.bootstrap', 
                                            'ui.utils', 
                                            'leaflet-directive',
                                            'angularAwesomeSlider'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('boundaries');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('trails');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

'use strict';

// Setting up route
angular.module('boundaries').config(['$stateProvider',
  function ($stateProvider) {
    // Boundaries state routing
    $stateProvider
      .state('boundaries', {
        abstract: true,
        url: '/boundaries',
        template: '<ui-view/>'
      })
      .state('boundaries.list', {
        url: '',
        templateUrl: 'modules/boundaries/client/views/list-boundaries.client.view.html'
      })
      .state('boundaries.create', {
        url: '/create',
        templateUrl: 'modules/boundaries/client/views/create-boundary.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('boundaries.view', {
        url: '/:boundaryId',
        templateUrl: 'modules/boundaries/client/views/view-boundary.client.view.html',
        params: {
          boundaryFeature: null,
          center: null
        }
      })
      .state('boundaries.edit', {
        url: '/edit/:boundaryId',
        templateUrl: 'modules/boundaries/client/views/edit-boundary.client.view.html',
        params: {
          boundaryFeature: null,
        },
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

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
        alachua: {
          lat: center.lat,
          lng: center.lng,
          zoom: setZoom()
        },
        controls: {
          fullscreen: {
            position: 'topleft'
          }
        },
        geojson: {
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

      $scope.boundary_items = [
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

      Trails.query().$promise.then(function (res) {
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
      $scope.onEachFeature = function(feature, layer){
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
    $scope.navFunction = function(lat, long){

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

'use strict';

angular.module('boundaries').directive('offCanvasMenu', ["$stateParams", function ($stateParams) {
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
}]);
'use strict';

angular.module('boundaries').directive('onReadFile', ["$parse", function ($parse) {
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);
            
			element.on('change', function(onChangeEvent) {
				var reader = new FileReader();
                
				reader.onload = function(onLoadEvent) {
					scope.$apply(function() {
						fn(scope, { $fileContent:onLoadEvent.target.result });
					});
				};
				reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
			});
		}
	};
}]);
'use strict';

//Boundaries service used for communicating with the boundaries REST endpoints
angular.module('boundaries').factory('Boundaries', ['$resource',
  function ($resource) {
    return $resource('api/boundaries/:boundaryId', {
      boundaryId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
    });
  }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

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
      $scope.rad_search = $scope.radius_filter(undefined);
      
      $scope.sliderValue = '15';
    };

    $scope.customStyle = {};
    $scope.turnClear = function (){
        
        $scope.customStyle.style = { 'background-color':'#a32f2f' };
        
    };

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
            $scope.turnClear();
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
        
        window.open('maps://maps.google.com/maps/dir/' + $rootScope.currLocation.lat + ',' + $rootScope.currLocation.lng + '/' + lat + ',' + long);
        else
      
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

'use strict';

angular.module('core').directive('filtersMenu', ["$stateParams", function ($stateParams) {
    return {
        restrict: 'A',
        replace: false,
        link: function (scope, element) {
            scope.isFilterOpen = false;
            scope.toggleFilterMenu = function () {
                scope.isFilterOpen = !scope.isFilterOpen;
            };
        }
    };
}]);
'use strict';

angular.module('core').directive('offCanvasMenu', ["$stateParams", function ($stateParams) {
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
}]);
'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

// Setting up route
angular.module('trails').config(['$stateProvider',
  function ($stateProvider) {
    // trails state routing
    $stateProvider
      .state('trails', {
        abstract: true,
        url: '/trails',
        template: '<ui-view/>'
      })
      .state('trails.list', {
        url: '',
        templateUrl: 'modules/trails/client/views/list-trails.client.view.html'
      })
      .state('trails.create', {
        url: '/create',
        templateUrl: 'modules/trails/client/views/create-trail.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('trails.view', {
        url: '/:trailId',
        templateUrl: 'modules/trails/client/views/view-trail.client.view.html'
      })
      .state('trails.edit', {
        url: '/edit/:trailId',
        templateUrl: 'modules/trails/client/views/edit-trail.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// trails controller
angular.module('trails').controller('TrailsController', ['$scope',
                                                              '$stateParams',
                                                              '$rootScope',
                                                              '$location',
                                                              'Authentication',
                                                              'Trails',
                                                              '$state',
                                                              'leafletData',
  function ($scope, $stateParams, $rootScope, $location, Authentication, Trails, $state, leafletData) {
    $scope.authentication = Authentication;
    $scope.loading = true;
    
    // Create new Trail
    $scope.create = function (content) {
      $scope.error = null;
      var trail = new Trails(JSON.parse(content));

      console.log(trail);

      trail.$save(function (response) {
        $scope.success = true;
        $scope.statusMessage = 'Added';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Trail
    $scope.remove = function (trail) {
      if (confirm('Are you sure you want to delete this user?')) {
        Trails.delete({ trailId: $stateParams.trailId })
              .$promise.then(function (res) {
                    $scope.success = true;
                    $scope.statusMessage = 'Deleted';
              }, function(error) {
                $scope.error = 'Unable to remove trail!\n' + error;
              });
        }    
    };

    // Update existing trail
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'trailForm');
        return false;
      }

      var trail = $scope.trail;

      trail.$update(function () {
        $scope.success = true;
        $scope.statusMessage = 'Updated';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of trails
    $scope.find = function () {
      Trails.query().$promise.then(function (res) {
        $scope.trails = res;
        $scope.loading = false;
        console.log('EXECUTED FIND');
      });
    };

    // Find existing trail
    $scope.findOne = function () {
      angular.extend($scope, {
          edit: {
                lat: 29.671316,
                lng: -82.327766,
                zoom: 10
          }
      });

      Trails.get({ trailId: $stateParams.trailId })
        .$promise.then(function (res) {
            $scope.trail = res;
            console.log($scope.trail);
            var previewData = $scope.trail;
            var poly = L.geoJson($scope.trail);
            var center = poly.getBounds().getCenter();
            console.log(center);
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
]);


'use strict';

angular.module('boundaries').directive('offCanvasMenu', ["$stateParams", function ($stateParams) {
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
}]);
'use strict';

angular.module('boundaries').directive('onReadFile', ["$parse", function ($parse) {
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);
            
			element.on('change', function(onChangeEvent) {
				var reader = new FileReader();
                
				reader.onload = function(onLoadEvent) {
					scope.$apply(function() {
						fn(scope, { $fileContent:onLoadEvent.target.result });
					});
				};
				reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
			});
		}
	};
}]);
'use strict';

//trails service used for communicating with the trails REST endpoints
angular.module('trails').factory('Trails', ['$resource',
  function ($resource) {
    return $resource('api/trails/:trailId', {
      trailId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
