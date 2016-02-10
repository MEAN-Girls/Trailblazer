'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http',
  function ($scope, Authentication, $http) {
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

	angular.extend($scope, {
		alachua: {
			//lat: 29.6520,
			//lng: -82.3250,
			zoom: 10,
			autoDiscover: true
    	},
    	controls: {
    		fullscreen: {
    			position: 'topleft'
    		}
        },

        //This is an example of how to draw polygons on the map
        paths: {
            polygon: {
                type: "polygon",
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
    $http.get("https://raw.githubusercontent.com/johan/world.geo.json/master/countries/USA/FL/Alachua.geo.json").success(function(data, status) {
        angular.extend($scope, {
            geojson: {
                data: data,
                style: {
                    fillColor: 'green',
                    weight: 2,
                    opacity: 0.5,
                    color: 'green',
                    dashArray: '1',
                    fillOpacity: 0.1
                }
            }
        });
    });
	}
]);
