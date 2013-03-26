var FBPublisher = {
	permissions: {},
	
	init: function init() {
		var self = this;
		FB.Event.subscribe('auth.authResponseChange', function authResponseChange(response) {
			switch(response.status) {
				case 'connected':
					self.getPermissions();
				break;
				
				case 'not_authorized':
				default:
				break;
			}
		} );
	},
	
	getPermissions: function getPermissions() {
		var self = this;
		FB.api('/me/permissions/', function getPermissionsResponse(response) {
			self.permissions = response.data[0];
		} );
	},
	
	hasPermission: function hasPermission(permission) {
		return typeof self.permissions[ permission ] !== 'undefined';
	},
	
	publish: function publish(action, url) {
		
	},
	
	pump: function pump() {
		//check if we have publish_actions permission
		if( hasPermission( 'publish_actions' ) ) {
			console.log('we have this permission');
		} else {
		}
	}
};