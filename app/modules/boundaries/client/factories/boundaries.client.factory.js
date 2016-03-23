angular.module('boundaries').factory('Boundaries', ['$http', 
  function($http) {
    var methods = {
      getAll: function() {
        return $http.get('http://localhost:3000/api/boundaries');
      },

      create: function(boundary) {
        return $http.post('http://localhost:3000/api/boundaries', boundary);
      }, 

      read: function(id) {
        return $http.get('http://localhost:3000/api/boundaries/' + id);
      }, 

      update: function(id, boundary) {
        return $http.put('http://localhost:3000/api/boundaries/' + id, boundary);
      }, 

      delete: function(id) {
        return $http.delete('http://localhost:3000/api/boundaries/' + id);
      }
    };

    return methods;
  }
]);