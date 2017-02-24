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
    templateUrl: '/templates/nonContiguous.html',
    controller: controller
  };

  angular
    .module('prez')
    .component('nonContiguous', component);
    /* component names must be camelCase */
})();
