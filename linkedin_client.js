Meteor.loginWithLinkedin = function (options, callback) {
  // support both (options, callback) and (callback).
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  var config = Accounts.loginServiceConfiguration.findOne({service: 'linkedin'});
  if (!config) {
    callback && callback(new Accounts.ConfigError("Service not configured"));
    return;
  }

  var state = Random.id();

  var scope = (options && options.requestPermissions) || [];
  var flatScope = _.map(scope, encodeURIComponent).join('+');

  var loginUrl =
        'https://api.linkedin.com/uas/oauth2/authorization' +
        '?response_type=code' +
        '&client_id=' + config.clientId +
        '&scope=' + flatScope +
        '&redirect_uri=' + Meteor.absoluteUrl('_oauth/linkedin?close') +
        '&state=' + state;

  Accounts.oauth.initiateLogin(state, loginUrl, callback);
};
