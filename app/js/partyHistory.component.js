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
      queryResults: '<',
      auxResults: '<'
    },
    templateUrl: '/templates/partyHistory.html',
    controller: controller
  };

  angular
    .module('prez')
    .component('partyHistory', component);
    /* component names must be camelCase */
})();
