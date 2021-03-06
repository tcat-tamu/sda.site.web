(function () {
  'use strict';

  angular
    .module('sdaAdmin')
    .factory('personEditDialog', personEditDialogFactory);

  /** @ngInject */
  function personEditDialogFactory($mdDialog) {
    return {
      show: showDialog
    };

    function showDialog($event, person) {
      var dialog = {
        targetEvent: $event,
        templateUrl: 'app/person/person-edit-dialog.html',
        locals: {
          person: person
        },
        controller: PersonEditDialogController,
        controllerAs: 'vm'
      };

      return $mdDialog.show(dialog);
    }
  }

  /** @ngInject */
  function PersonEditDialogController(peopleRepo, $mdDialog, person) {
    var vm = this;

    vm.person = person;
    vm.nameRoles = [
        // { value: 'canonical', label: 'Canonical Name' },
        { value: 'pseudonym', label: 'Pseudonym' },
        { value: 'maiden', label: 'Maiden Name' },
        { value: 'designation', label: 'Honorary Designation' },
        { value: 'nickname', label: 'Nickname' },
        { value: 'phonetic', label: 'Phonetic Name' }
    ]

    vm.close = close;
    vm.cancel = cancel;
    vm.addName = addName;
    vm.deleteName = deleteName;

    function close() {
      $mdDialog.hide(vm.person);
    }

    function cancel() {
      $mdDialog.cancel();
    }

    function addName() {
      var name = peopleRepo.createName();
      vm.person.altNames.push(name);
    }

    function deleteName(name) {
      var ix = vm.person.altNames.indexOf(name);
      if (ix >= 0) {
        vm.person.altNames.splice(ix, 1);
      }
    }
  }

})();
