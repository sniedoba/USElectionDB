(function(){
  'use strict';

  function controller() {
    var ctrl = this;

  }

  /*
      https://docs.angularjs.org/guide/component
      (check out "Component Tree")
   */
  var component = {
    bindings: {
      queryResults: '<',
      auxResults: '<'
    },
    templateUrl: '/templates/electionStatsByYear.html',
    controller: controller
  };

  angular
    .module('prez')
    .component('electionStatsByYear', component);
    /* component names must be camelCase */
})();
