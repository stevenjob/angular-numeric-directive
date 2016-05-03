/**
 * Modified version of Numeric directive.
 * https://github.com/epeschier/angular-numeric-directive
 *
 * Numeric only input. Limits input to:
 * - max value: maximum input value. Default undefined (no max).
 * - min value: minimum input value. Default undefined (no min).
 * - decimals: number of decimals. Default 2.
 * - formatting: apply thousand separator formatting. Default true.
 */
(function () {
    'use strict';

    angular
        .module('application.utilities.input')
        .directive('numeric', numericInput);

    numericInput.$inject = ['$locale'];

    function numericInput($locale) {

        return {
            link: link,
            scope: {
                decimalSeparator: '@?',
                groupSeparator: '@?',
                max: '=?',
                min: '=?',
                decimals: '=?'
            },
            require: 'ngModel',
            restrict: 'A'
        };

        function link(scope, el, attrs, ngModelCtrl) {

            var decimalSeparator = scope.decimalSeparator || $locale.NUMBER_FORMATS.DECIMAL_SEP;
            var groupSeparator = scope.groupSeparator || $locale.NUMBER_FORMATS.GROUP_SEP;

            // Create new regular expression with decimal separator.
            // dont need to change this as current decimal seperator is replaced on comparison with this
            var NUMBER_REGEXP = '^\\-?(\\d+|(\\d*(\\.\\d*)))$';
            var regex = new RegExp(NUMBER_REGEXP);

            var formatting = true;
            var maxInputLength = 15;            // Maximum input length. Default max ECMA script.
            var maxDisplayValue;                // Max display value that the user will see. ng-model will never be greater than this. Default undefined.
            var min = 0;                            // Minimum value. Default undefined.
            var decimals = 2;                   // Number of decimals. Default 2.
            var lastValidValue;                 // Last valid value.

            // Create parsers and formatters.
            ngModelCtrl.$parsers.push(parseViewValue);
            ngModelCtrl.$parsers.push(minValueParser);
            ngModelCtrl.$parsers.push(maxValueParser);
            ngModelCtrl.$formatters.push(formatViewValue);

            el.bind('blur', onBlur);        // Event handler for the leave event.
            el.bind('focus', onFocus);      // Event handler for the focus event.

            // Put a watch on the min, max and decimal value changes in the attribute.
            scope.$watch('min', onMinChanged);
            scope.$watch(attrs.maxDisplayValue, onMaxChanged);
            scope.$watch('decimals', onDecimalsChanged);
            scope.$watch(attrs.formatting, onFormattingChanged);

            // Setup decimal formatting.
            if (decimals > -1) {
                ngModelCtrl.$parsers.push(function (value) {
                    return (value) ? round(value) : value;
                });
                ngModelCtrl.$formatters.push(function (value) {
                    return (value) ? formatPrecision(value) : value;
                });
            }

            ngModelCtrl.$validators.maxValidator = function(modelValue, viewValue) {
                    return angular.isUndefined(modelValue) || angular.isUndefined(scope.max) || modelValue <= scope.max;
            };

            function onMinChanged(value) {
                if (!angular.isUndefined(value)) {
                    min = parseFloat(value);
                    lastValidValue = minValueParser(ngModelCtrl.$modelValue);
                    ngModelCtrl.$setViewValue(formatPrecision(lastValidValue));
                    ngModelCtrl.$render();
                }
            }

            function onMaxChanged(value) {
                if (!angular.isUndefined(value)) {
                    maxDisplayValue = parseFloat(value);
                    maxInputLength = calculateMaxLength(maxDisplayValue);
                    lastValidValue = maxValueParser(ngModelCtrl.$modelValue);
                    ngModelCtrl.$setViewValue(formatPrecision(lastValidValue));
                    ngModelCtrl.$render();
                }
            }

            function onDecimalsChanged(value) {
                if (!angular.isUndefined(value)) {
                    decimals = parseFloat(value);
                    maxInputLength = calculateMaxLength(maxDisplayValue);
                    if (lastValidValue !== undefined) {
                        ngModelCtrl.$setViewValue(formatPrecision(lastValidValue));
                        ngModelCtrl.$render();
                    }
                }
            }

            function onFormattingChanged(value) {
                if (!angular.isUndefined(value)) {
                    formatting = (value !== false);
                    ngModelCtrl.$setViewValue(formatPrecision(lastValidValue));
                    ngModelCtrl.$render();
                }
            }

            /**
             * Round the value to the closest decimal.
             */
            function round(value) {
                var d = Math.pow(10, decimals);
                lastValidValue = Math.round(value * d) / d;
                return lastValidValue;
            }

            /**
             * Format a number with the thousand group separator.
             */
            function numberWithCommas(value) {
                if (formatting) {
                    var parts = value.toString().split(decimalSeparator);
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
                    return parts.join(decimalSeparator);
                }
                else {
                    // No formatting applies.
                    return value;
                }
            }

            /**
             * Format a value with thousand group separator and correct decimal char.
             */
            function formatPrecision(value) {
                if (!(value || value === 0)) {
                    return '';
                }
                var formattedValue = parseFloat(value).toFixed(decimals);
                formattedValue = formattedValue.replace('.', decimalSeparator);
                return numberWithCommas(formattedValue);
            }

            function formatViewValue(value) {
                return ngModelCtrl.$isEmpty(value) ? '' : '' + value;
            }

            /**
             * Parse the view value.
             */
            function parseViewValue(value) {
                var cursorPosition;

                if (angular.isUndefined(lastValidValue)) {
                    lastValidValue = ngModelCtrl.$viewValue;
                }

                if (angular.isUndefined(value)) {
                    value = '';
                }
                value = value.toString().replace(decimalSeparator, '.');

                // Handle leading decimal point, like ".5"
                if (value.indexOf('.') === 0) {
                    value = '0' + value;
                }

                // Allow "-" inputs only when min < 0
                if (value.indexOf('-') === 0) {
                    if (min >= 0) {
                        cursorPosition = el[0].selectionStart - (value.length - (lastValidValue ? lastValidValue.toString().length : 0));
                        value = lastValidValue;
                        ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
                        ngModelCtrl.$render();
                        el[0].setSelectionRange(cursorPosition, cursorPosition);
                    }
                    else if (value === '-') {
                        value = '';
                    }
                }

                // Allow "." only when decimals !== 0
                if (decimals === 0 && value.indexOf('.') > -1) {
                    cursorPosition = el[0].selectionStart - (value.length - (lastValidValue ? lastValidValue.toString().length : 0));
                    ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
                    ngModelCtrl.$render();
                    el[0].setSelectionRange(cursorPosition, cursorPosition);
                    return lastValidValue;
                }

                var empty = ngModelCtrl.$isEmpty(value);
                if (empty) {
                    lastValidValue = '';
                    //ngModelCtrl.$modelValue = undefined;
                }
                else {
                    if (regex.test(value) && (value.length <= maxInputLength)) {
                        if (value > maxDisplayValue) {
                            lastValidValue = maxDisplayValue;
                        }
                        else if (value < min) {
                            lastValidValue = min;
                        }
                        else {
                            lastValidValue = (value === '') ? null : parseFloat(value);
                        }
                    }
                    else {
                        cursorPosition = el[0].selectionStart - (value.length - (lastValidValue ? lastValidValue.toString().length : 0));
                        // Render the last valid input in the field
                        ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
                        ngModelCtrl.$render();
                        //reset the cursor
                        el[0].setSelectionRange(cursorPosition, cursorPosition);
                    }
                }

                return lastValidValue;
            }

            /**
             * Calculate the maximum input length in characters.
             * If no maximum the input will be limited to 16; the maximum ECMA script int.
             */
            function calculateMaxLength(value) {
                var length = 15;
                if (!angular.isUndefined(value)) {
                    length = Math.floor(value).toString().length;
                }
                if (decimals > 0) {
                    // Add extra length for the decimals plus one for the decimal separator.
                    length += decimals + 1;
                }
                if (min < 0) {
                    // Add extra length for the - sign.
                    length++;
                }
                return length;
            }

            /**
             * Minimum value validator.
             */
            function minValueParser(value) {
                if (!angular.isUndefined(min)) {
                    if (!ngModelCtrl.$isEmpty(value) && (value < min)) {
                        return min;
                    } else {
                        return value;
                    }
                }
                else {
                    return value;
                }
            }

            /**
             * Maximum value validator.
             */
            function maxValueParser(value) {
                if (!angular.isUndefined(maxDisplayValue)) {
                    if (!ngModelCtrl.$isEmpty(value) && (value > maxDisplayValue)) {
                        return maxDisplayValue;
                    } else {
                        return value;
                    }
                }
                else {
                    return value;
                }
            }


            /**
             * Function for handeling the blur (leave) event on the control.
             */
            function onBlur() {
                var value = ngModelCtrl.$modelValue;
                if (!angular.isUndefined(value)) {
                    // Format the model value.
                    ngModelCtrl.$viewValue = formatPrecision(value);
                    ngModelCtrl.$render();
                }
            }


            /**
             * Function for handeling the focus (enter) event on the control.
             * On focus show the value without the group separators.
             */
            function onFocus() {
                var value = ngModelCtrl.$modelValue;
                if (!angular.isUndefined(value)) {
                    ngModelCtrl.$viewValue = value.toString().replace('.', decimalSeparator);
                    ngModelCtrl.$render();
                }
            }
        }

    }

})();
