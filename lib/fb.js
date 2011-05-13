// Copyright 2004-present Facebook. All Rights Reserved.

// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

function getCurrentTime() {
  return (new Date()).getTime() / 1000.0;
}

var oauth_data = {};

var user_data = {};
var user_hash_to_id = {};

function userGetData(user_id, user_hash) {
  if (!user_hash_to_id[user_hash] || user_hash_to_id[user_hash] !== user_id) {
    return null;
  }
  var user = user_data[user_id];
  if (user && user._expires_time >= getCurrentTime()) {
    user_data[user_id] = undefined;
    user_hash_to_id[user_hash] = undefined;
    return null;
  }
  return user;
}

function generateHash(charcount) {
  var str = '';
  for (var ii = 0; ii < charcount; ++ii) {
    var hash = Math.floor(Math.random() * 16).toString(16);
    str += hash;
  }
  return str;
}

function userGetHash(user_id) {
  var user = user_data[user_id];
  var hash = user && user._hash;
  if (!hash) {
    do {
      hash = generateHash(16);
    } while (user_hash_to_id[hash]);
    user_hash_to_id[hash] = user_id;
    user_data[user_id] = {_hash : hash};
  }
  return hash;
}

function assembleQueryParams(path, params) {
  var query = [];
  for (param in params) {
    query.push([param, params[param]].join('='));
  }
  return path + (query.length ? '?' + query.join('&') : '');
}

function splitQueryParams(querystr) {
  var retdata = querystr;
  var split = querystr.split('&');
  if (split && split.length) {
    retdata = {};
    for (var ii = 0; ii < split.length; ++ii) {
      var subsplit = split[ii].split('=');
      if (subsplit && subsplit.length) {
        retdata[subsplit[0]] = subsplit[1] || '';
      }
    }
  }
  return retdata;
}

function graphApiCall(path, params, callback, method) {
  var options = {
    host: 'graph.' + oauth_data.facebook_host,
    port: 443,
    path: assembleQueryParams(path, params),
    'user-agent': 'node.js',
    method: method || 'GET'
  };

  var request = https.request(options, function(response) {
      if (response.statusCode != 200) {
        callback && callback({
          error: {
            type: 'HTTP Error',
            message: response.statusCode,
            path: options.path
          }
        });
        return;
      }
      response.setEncoding('utf8');
      response.on('data', function(chunk) {
          var retdata;
          try {
            retdata = JSON.parse(chunk);
          } catch (e) {
            retdata = splitQueryParams(chunk);
          }
          callback && callback(retdata);
        });
    });
  request.on('error', function(err) {
      callback && callback({
          error: {
            type: 'Communication Error',
            message: err,
            path: options.path
          }
        });
    });
  request.end();
}

function getUserID(cookies) {
  var user_id = cookies.get('user_id');
  var user_hash = cookies.get('user_hash');
  if (user_id && user_hash) {
    var user = userGetData(user_id, user_hash);
    return user && user.id;
  }
  return null;
}

function userGraphApiCall(cookies, path, params, method, callback) {
  if (!method) {
    method = 'get';
  }
  params.access_token = undefined;

  var user_id = cookies.get('user_id');
  var user_hash = cookies.get('user_hash');
  if (user_id && user_hash) {
    var user = userGetData(user_id, user_hash);
    params.access_token = user && user._access_token;
  }

  if (!params.access_token) {
    callback && callback({
        error: {
          type: 'OAuthException',
          message: 'Session expired or never created.'
        }
      });
  } else {
    graphApiCall(path, params, callback, method);
  }
}

function appGraphApiCall(path, params, method, callback) {
  if (!method) {
    method = 'get';
  }
  params.access_token = oauth_data.app_id + '|' + oauth_data.app_secret;
  graphApiCall(path, params, callback, method);
}

/**
 * OAuth
 */

function oauthSetup(app_id, app_secret, oauth_response_url, oauth_success_url, oauth_failure_url, facebook_host) {
  oauth_data.app_id = app_id;
  oauth_data.app_secret = app_secret;
  oauth_data.response_url = oauth_response_url;
  oauth_data.success_url = oauth_success_url;
  oauth_data.failure_url = oauth_failure_url;
  oauth_data.facebook_host = facebook_host || 'facebook.com';

  var params = {
    client_id: oauth_data.app_id,
    redirect_uri: oauth_data.response_url
  };
  oauth_data.dialog_url = assembleQueryParams('https://www.' + oauth_data.facebook_host + '/dialog/oauth', params);
}

function redirectResponse(res, redirect_url) {
  var header = {
    'Location': redirect_url,
    'Content-Type': 'text/plain'
  };

  res.writeHead(302, header);
  res.write('Redirecting to ' + redirect_url);
  res.end();
}

function oauthDialog(res) {
  redirectResponse(res, oauth_data.dialog_url);
}

function oauthProcessAccessTokenResponse(access_token, expires, res, cookies) {
  var expires_time = getCurrentTime() + expires;
  var params = {
    access_token: access_token
  };

  graphApiCall('/me', params, function(response) {
      if (response && !response.error) {
        var user_id = response.id;
        var user_hash = userGetHash(user_id);
        user_data[user_id] = response;
        user_data[user_id]._access_token = access_token;
        user_data[user_id]._expires_time = expires_time;
        user_data[user_id]._hash = user_hash;
        cookies.set('user_id', user_id);
        cookies.set('user_hash', user_hash);
        redirectResponse(res, oauth_data.success_url);
      } else {
        redirectResponse(res, oauth_data.failure_url);
      }
    });
}

function oauthProcessResponse(req, res, cookies) {
  parsed_url = url.parse(req.url, true);
  var params = {
    client_id: oauth_data.app_id,
    client_secret: oauth_data.app_secret,
    redirect_uri: encodeURI(oauth_data.response_url),
    code: parsed_url.query.code
  };

  graphApiCall('/oauth/access_token', params, function(response) {
      if (response && response.access_token) {
        oauthProcessAccessTokenResponse(response.access_token, response.expires || 0, res, cookies);
      } else {
        redirectResponse(res, oauth_data.failure_url);
      }
    });
}

exports.oauthSetup = oauthSetup;
exports.oauthDialog = oauthDialog;
exports.oauthResponse = oauthProcessResponse;
exports.api = userGraphApiCall;
exports.appApi = appGraphApiCall;
exports.userID = getUserID;
