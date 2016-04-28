/**
 * Directive to add an input with the numeric directive applied and the default options on it.
 */
(function () {
    'use strict';

    angular
        .module('application.utilities.input')
        .directive('dateInput', dateInput);

    function dateInput() {

        return {
            scope: {
                templateModel: '=ngModel'
            },
            require: 'ngModel',
            templateUrl: './views/shared/utilities/input/views/date-input.html',
            restrict: 'E'
        };
        
    }

})();
