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
    templateUrl: '/templates/swingCandidates.html',
    controller: controller
  };

  angular
    .module('prez')
    .component('swingCandidates', component);
    /* component names must be camelCase */
})();
