'use strict';

angular.module('boundaries').service('fileUpload', ['$http', '$location', function ($http, $location) {
    this.uploadFileToUrl = function(file, uploadUrl){
        console.log('here');
        var fd = new FormData();
        fd.append('file', file);
        console.log(file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        })
        .success(function(){
        })
        .error(function(){
        });
    };
}]);