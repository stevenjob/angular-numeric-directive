(function() {

	'use strict';

	angular
		.module('application.utilities.validation')
		.directive('validationMessages', validationMessages);

	validationMessages.$inject = ['messageProvider'];

	function validationMessages(messageProvider) {
		return {
		    restrict: 'E',
		    templateUrl: './views/shared/utilities/validation/views/validation-messages.html',
		    transclude: true,
		    replace: false,
		    scope: {
		        fieldErrors: '=?',
				fieldWarnings: '=?'
		    },
			controller: function($scope) {

				$scope.getMessageFromError = function(errorType) {
					return messageProvider[errorType];
				};

				$scope.getValidationClass = function () {
					if (($scope.fieldErrors) || (Object.keys($scope.form.$error).length)) {
						return 'validation-error';
					} else if ($scope.fieldWarnings) {
						return 'validation-warning';
					} else {
						return '';
					}
				};
			}
		};
	}

})();
