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

var Publish = (function() {
  var fb_logged_in;

  function fbInit() {
    console.log('client_user.fb_logged_in ' + client_user.fb_logged_in);
    if (!client_user.fb_logged_in) {
      FB.login(function(response) {
        if (response.session) {
          fb_logged_in = true;
        } else {
          fb_logged_in = false;
        }
      }, {perms:''} ); // read_stream,publish_stream
    }
  }

  function sendRequest() {
    FB.ui({
      method: 'apprequests',
      message: 'Just scored ' + 13 + ' points ' +
        'on this game and would like to send a gift of 5 points and a bonus pirate.',
      data: {
        gift: {
          points: 5,
          badge: 1,
        }
      }
    });
  }
  
  function publishStory() {
    var loc = window.location;
    var url = loc.protocol + '//' + loc.host + '/pvn/show/' + 
      encodeURIComponent(FB.JSON.stringify({
        player: {
          id: 0,
          name: 'name',
        }
      }));
    FB.ui({
      method: 'stream.publish',
      attachment: {
        name: 'Watch Replay',
        caption: 'Score!',
        description: (
          'Check out my awesome game of pirate chess i played with a friend'
        ),
        href: url
      }
    });
  }


  return {
    publishStory: publishStory,
    sendRequest: sendRequest,
    fbInit: fbInit,
  };
})();
