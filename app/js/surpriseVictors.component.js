(function(){
  'use strict';

  function controller() {
    var ctrl = this;
  }

  /*
      https://docs.angularjs.org/guide/component (check out "Component Tree")
   */
  var component = {
    bindings: {
      queryResults: '<'
    },
    templateUrl: '/templates/surpriseVictors.html',
    controller: controller
  };

  angular
    .module('prez')
    .component('surpriseVictors', component);
    /* component names must be camelCase */
})();
