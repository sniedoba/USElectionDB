(function() {
  'use strict';

  /*
    https://docs.angularjs.org/api/ng/service/$http
   */
  function factory($http){
    var api = "http://localhost:3000/api/";
    var queryRoute = api + "query/";

    function getQuery(queryName) {
      var config = {};
      return $http.get(queryRoute + queryName, config);
    }

    return {
      getQuery: getQuery
    };
  }
  /* This is here in case we were to "minify" our files */
  factory.$inject = ['$http']; // any dependencies as string names

  angular
    .module('prez')
    .factory('QueriesFactory', factory);
})();
