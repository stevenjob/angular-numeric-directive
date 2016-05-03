angular
  .module('NumericExample', ['application.utilities.input', 'ui.bootstrap'])

  .controller('NumericCtrl', function ($scope) {
    var vm = this;

    vm.value = 12.34;

      $scope.dateOpen = function( $event) {
          $event.preventDefault();
          $event.stopPropagation();
          $scope.dateOpened = true;
      };

      $scope.clear = function(cb) {
          $scope.ngModel = '';

          if (cb) {
              cb();
          }
      };
  });