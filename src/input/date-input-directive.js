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
            require: 'ngModel',
            restrict: 'A',
            priority: 10000,
            link: link
        };

        function link(scope, el, attrs, ngModelCtrl) {
            console.log(scope, el, attrs, ngModelCtrl);

            var DATE_REGEXP = '^(?:[0-9]|/)*$';
            var regex = new RegExp(DATE_REGEXP);
            var lastValidValue;
            var maxInputLength = 15;
            console.log(ngModelCtrl.$parsers);
            ngModelCtrl.$parsers.unshift(parseViewValue);
            console.log(ngModelCtrl.$parsers);
            ngModelCtrl.$viewChangeListeners.push(function() {
                //console.log(ngModelCtrl.$viewValue, ngModelCtrl.$modelValue);
            });
            //
            //scope.$watch(ngModelCtrl.$viewValue, function() {
            //    console.log(ngModelCtrl.$viewValue, ngModelCtrl.$modelValue);
            //});

            ngModelCtrl.$validators.maxValidator = function(modelValue, viewValue) {
                console.log(modelValue, viewValue);
                return !angular.isUndefined(modelValue);
            };

            /**
             * Parse the view value.
             */
            function parseViewValue(value) {
                var cursorPosition;

                if (angular.isUndefined(value)) {
                    value = '';
                }

                var empty = ngModelCtrl.$isEmpty(value);
                if (empty) {
                    lastValidValue = '';
                    //ngModelCtrl.$modelValue = undefined;
                }
                else {
                    if (regex.test(value) && (value.length <= maxInputLength)) {
                            lastValidValue = (value === '') ? null : value;
                    }
                    else {
                        cursorPosition = el[0].selectionStart - (value.length - (lastValidValue ? lastValidValue.toString().length : 0));
                        // Render the last valid input in the field
                        ngModelCtrl.$setViewValue(lastValidValue);
                        ngModelCtrl.$render();
                        //reset the cursor
                        el[0].setSelectionRange(cursorPosition, cursorPosition);
                    }
                }
                var thing = validateViewValue(value);
                ngModelCtrl.$setValidity('dateValidator', thing);

                return lastValidValue;
            }

            function validateViewValue(viewValue) {
                if (angular.isNumber(viewValue)) {
                    // presumably timestamp to date object
                    viewValue = new Date(viewValue);
                }

                if (!viewValue) {
                    return null;
                } else if (angular.isDate(viewValue) && !isNaN(viewValue)) {
                    return viewValue;
                } else if (angular.isString(viewValue)) {
                    return isValidDate(viewValue);
                } else {
                    return true;
                }
            }


            var isValidDate = function (string, canBeEmpty) {
                if (typeof string !== 'string') {
                    return false;
                } else if (canBeEmpty && string.trim() === '') {
                    return true;
                } else {
                    //splits the string date into [days, months, year]
                    var splitDate = string.split('/');
                    var dateToCheck = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
                    //used to check that the days and the months don't overflow, if they do then the date is not valid
                    if (!dateToCheck || dateToCheck.getMonth() !== Number(splitDate[1]) - 1 || dateToCheck.getDate() !== Number(splitDate[0])) {
                        return false;
                    }
                    return !isNaN(dateToCheck.getTime());
                }
            };

        }
        
    }

})();
