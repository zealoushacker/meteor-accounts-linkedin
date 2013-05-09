Accounts.oauth.registerService('linkedin', 2, function(query) {

  var accessToken = getAccessToken(query);
  var identity = getIdentity(accessToken);

  return {
    serviceData: {
      id: identity.id,
      accessToken: accessToken,
      email: identity.email,
      username: identity.login
    },
    options: {profile: { name: identity.name }}
  };
});

var getAccessToken = function (query) {
  var config = Accounts.loginServiceConfiguration.findOne({service: 'github'});
  if (!config)
    throw new Accounts.ConfigError("Service not configured");

  var result = Meteor.http.post(
    "https://api.linkedin.com/uas/oauth2/accessToken", {
      headers: {
        Accept: 'application/json'
      },
      params: {
        grant_type: 'authorization_code',
        code: query.code,
        client_id: config.clientId,
        client_secret: config.secret,
        redirect_uri: Meteor.absoluteUrl("_oauth/linkedin?close")
      }
    });

  if (result.error) { // if the http response was an error
    throw new Error("Failed to complete OAuth handshake with LinkedIn. " +
                    "HTTP Error " + result.statusCode + ": " + result.content);
  } else if (result.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with LinkedIn. " + result.data.error);
  } else {
    return result.data.access_token;
  }
};

var getIdentity = function (accessToken) {
  var result = Meteor.http.get(
    "https://api.linkedin.com/v1/people/~", {
      params: {oauth2_access_token: accessToken}
    });
  if (result.error) {
    throw new Error("Failed to fetch identity from LinkedIn. " +
                    "HTTP Error " + result.statusCode + ": " + result.content);
  } else {
    return result.data;
  }
};
