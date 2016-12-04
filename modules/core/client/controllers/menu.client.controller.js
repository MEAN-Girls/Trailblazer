'use strict';

angular.module('core').controller('MenuController', ['$scope', 'Authentication', 'Boundaries', 'Trails',
  function ($scope, Authentication) {

    $scope.authentication = Authentication;

    $scope.myInterval = 5000;
    $scope.active = 0;
    $scope.slides = [];
    var currIndex = 0;

    $scope.slides.push({
      image: '/modules/core/client/img/menu/menu1.png',
      id: currIndex++
    });

    $scope.slides.push({
      image: '/modules/core/client/img/menu/menu2.png',
      id: currIndex++
    });

    $scope.slides.push({
      image: '/modules/core/client/img/menu/menu3.png',
      id: currIndex++
    });
}]);
