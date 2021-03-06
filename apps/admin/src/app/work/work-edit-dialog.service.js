(function () {
  'use strict';

  angular
    .module('sdaAdmin')
    .factory('workEditDialog', workEditDialogFactory);

  /** @ngInject */
  function workEditDialogFactory($mdDialog) {
    return {
      show: showDialog
    };

    function showDialog($event, work) {
      var dialog = {
        targetEvent: $event,
        templateUrl: 'app/work/work-edit-dialog.html',
        locals: {
          work: work
        },
        controller: WorkEditDialogController,
        controllerAs: 'vm'
      };

      return $mdDialog.show(dialog);
    }
  }

  /** @ngInject */
  function WorkEditDialogController($mdDialog, work) {
    var vm = this;

    vm.work = work;

    vm.close = close;
    vm.cancel = cancel;
    vm.addAuthor = addAuthor;
    vm.deleteAuthor = deleteAuthor;
    vm.addTitle = addTitle;
    vm.deleteTitle = deleteTitle;

    function close() {
      $mdDialog.hide(vm.work);
    }

    function cancel() {
      $mdDialog.cancel();
    }

    function addAuthor(field) {
      // TODO delegate creation to worksRepo
      var authorRef = {};
      vm.work[field].push(authorRef);
    }

    function deleteAuthor(field, authorRef) {
      var ix = vm.work[field].indexOf(authorRef);
      if (ix >= 0) {
        vm.work[field].splice(ix, 1);
      }
    }

    function addTitle() {
      // TODO delegate creation to worksRepo
      var title = {};
      vm.work.titles.push(title);
    }

    function deleteTitle(title) {
      var ix = vm.work.titles.indexOf(title);
      if (ix >= 0) {
        vm.work.titles.splice(ix, 1);
      }
    }
  }

})();
