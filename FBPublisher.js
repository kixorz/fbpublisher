var FBPublisher = {
	actions: [],
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
			console.log(response, self.permissions);
		} );
	},
	
	hasPermission: function hasPermission(permission) {
		return typeof this.permissions[ permission ] !== 'undefined';
	},
	
	publish: function publish(action, obj, callback) {
		this.actions.push( {
			name: action,
			obj: obj,
			callback: typeof callback !== 'function' ? function(){} : callback
		} );
	},
	
	pump: function pump() {
		//check if we have publish_actions permission
		if(this.hasPermission('publish_actions')) {
			if(this.actions.length > 0) {
				var batch = [];
				var actions = [];
				for(var i in this.actions) {
					var action = this.actions[i];
					batch.push( {
						method: 'POST',
						relative_url: 'me/' + action.name,
						//TODO: add object keys
						callback: action.callback
					} );
				}
				
				FB.api('/', 'POST', {
					batch: batch
				}, function(response){ console.log(response); });
			}
		} else {
			
		}
	}
};