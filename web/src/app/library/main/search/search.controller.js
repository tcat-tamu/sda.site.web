(function () {
   'use strict';

   angular
      .module('sda.library')
      .controller('SearchController', SearchController);

   /** @ngInject */
   function SearchController($stateParams, $scope) {
      var vm = this;

      activate();

      function activate() {
         $scope.$emit('set:query', $stateParams.query);
      }
   }

})();