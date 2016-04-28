/**
 * Directive to add an input with the numeric directive applied and the default options on it.
 */
(function () {
    'use strict';

    angular
        .module('application.utilities.input')
        .directive('numericInput', numericInput);

    function numericInput() {

        return {
            scope: {
                max: '=?',
                min: '=?',
                decimals: '=?',
                templateModel: '=ngModel'
            },
            require: 'ngModel',
            templateUrl: './views/shared/utilities/input/views/numeric-input.html',
            restrict: 'E',
            link: function (scope) {
                scope.$watch('max', function (value) {
                    scope.max = value;
                });
            }
        };
        
    }

})();
