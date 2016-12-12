(function () {
  'use strict';

  angular
    .module('sdaConceptBrowser')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, $rootScope, $location, analytics) {
    $log.debug('runBlock end');

    $rootScope.$on('$stateChangeSuccess', function () {
      analytics('send', 'pageview', {
        page: $location.url()
      });
    });
  }

})();
