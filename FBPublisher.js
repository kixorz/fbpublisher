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
	
	requestPermission: function requestPermission(permission) {
		var self = this;
		FB.login(function(response) {
			if(typeof response.authResponse !== 'undefined') {
				//refresh permissions and possibly publish
				self.getPermissions();
			}
		}, {
			scope: permission
		} );
	},
	
	getPermissions: function getPermissions() {
		var self = this;
		FB.api('/me/permissions/', function getPermissionsResponse(response) {
			self.permissions = response.data[0];
			self.publishPending();
		} );
	},
	
	hasPermission: function hasPermission(permission) {
		return typeof this.permissions[ permission ] !== 'undefined';
	},
	
	publish: function publish(action, obj, callback) {
		if(this.hasPermission('publish_actions')) {
			//publish immediately
			FB.api('/me/' + action, 'POST', obj, callback );
			return true;
		} else {
			//store to pending
			this.actions.push( {
				name: action,
				obj: obj,
				start_time: (new Date()).toISOString()
			} );
			//we don't have permission to publish, so we ask for it
			this.requestPermission('publish_actions');
			
			//TODO: handle callback?
			
			return false;
		}
	},
	
	publishPending: function publishPending() {
		if(this.actions.length > 0) {
			var batch = [];
			var actions = [];
			for(var i in this.actions) {
				var action = this.actions[i];
				var message = {
					method: 'POST',
					relative_url: 'me/' + action.name,
					start_time: action.start_time
				};
				for(var k in action.obj) {
					message[k] = action.obj[k];
				}
				batch.push( message );
				delete action;
			}
			
			FB.api('/', 'POST', {
				batch: batch
			}, function publishPendingResponse(response) {
				//TODO: perform callback for each request response
				console.log(response);
			} );
		}
	}
};