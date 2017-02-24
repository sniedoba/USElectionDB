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
    templateUrl: '/templates/firstNames.html',
    controller: controller
  };

  angular
    .module('prez')
    .component('firstNames', component);
    /* component names must be camelCase */
})();
