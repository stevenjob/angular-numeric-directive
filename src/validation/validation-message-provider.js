(function() {

	'use strict';

	angular
		.module('application.utilities.validation')
		.service('messageProvider', messageProvider);

	function messageProvider() {

		return {
			maxValidator: 'Number is too big'
		};
	}

})();
