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
			//TODO: handle cancelation
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
			FB.api('/me/' + action, 'POST', obj, callback);
			return true;
		} else {
			//add current timestamp
			if(typeof obj.start_time === 'undefined') {
				obj['start_time'] = (new Date()).toISOString().replace(/\..+/g, '+0000');
			}
			//store to pending
			this.actions.push( {
				name: action,
				obj: obj,
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
				var body = [];
				for(var k in action.obj) {
					body.push(encodeURI(k + '=' + action.obj[k]));
				}
				message['body'] = body.join('&');
				batch.push( message );
				delete this.actions[i];
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