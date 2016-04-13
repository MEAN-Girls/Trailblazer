'use strict';

angular.module('core').directive('filtersMenu', function ($stateParams) {
    return {
        restrict: 'A',
        replace: false,
        link: function (scope, element) {
            scope.isFilterOpen = false;
            scope.toggleFilterMenu = function () {
                scope.isFilterOpen = !scope.isFilterOpen;
                console.log("HERE");
            };
        }
    };
});