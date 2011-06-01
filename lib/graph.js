process.on('uncaughtException', function(err) {
  console.log(err);
});

var base_url = 'pirateninjachess.com/chess';

function str_from_req(req)
{
    return "req: method="+req.method+" httpVersion="+req.httpVersion+" url="+req.url+"\nheaders="+util.dir(req.headers) +"\nbody="+req.body;
}


function dict_from_keyvals_str(str, delim) {
  var res = [];
  for(var i = 0; i < str.length; ++i) {
    var tmp = str[i].split(delim);
    res[tmp[0]] = unescape(tmp[1]);
  }
  return res;
}

function fbinfo_from_cookie(c) {
  if(c) {
    console.log('cookie: ' + c);
    var d = c.substring(c.indexOf('=')+2,c.length-1);
    var e = d.split('&');
    return dict_from_keyvals_str(e,'=');
  }
}

exports.fbinfo_from_cookie = fbinfo_from_cookie;

// url=/cheevo_update?cheevo=&score=
function params_from_url(url)
{
  var a = url.split('?')
  if(a.length <= 0)
  return null;
  var b = a[1].split('&')
  return dict_from_keyvals_str(b,'=');
}


function post_handler(request, callback) {
  var body = '';

  if (request.method == 'POST')  {
    request.addListener('data', function(chunk)	{
      body+= chunk;
    });

    request.addListener('end', function()	{
      sys.debug(body); 
      callback(body);
    });
  };
}

var user_info = [];

// use this to query data from open graph
function graph_get(path,end_cb) {
  //    sys.debug('graph_get:' + path);
  data = '';
  https.get(
    { 
      host: 'graph.facebook.com', 
      path: path 
    }, 
    function(res) {
      res.on(
        'data',
        function(d) {
          data += d;
        }
      );
      res.on(
        'end',
        function () 
        {
          end_cb(data); 
        }
      );
    }
  ).on(
    'error', 
    function(e) {
      console.error(e);
    }
  );
}

function graph_post(path, body, end_cb) {
  sys.debug('graph_post:' + path + ' body: ' + body);
  var data = '';
  var graph_req = https.request(
    { 
      host: 'graph.facebook.com', 
      method: 'POST',
      path: path
    }, 
    function(res) {
      res.on(
        'data',
        function(d) {
          //sys.debug('graph data:'+d);
          data += d;
        }
      );
      res.on(
        'end',
        function () 
        {
          end_cb(data); 
        }
      );
    }
  )
  graph_req.on(
    'error', 
    function(e) {
      console.error(e);
    }
  );
  graph_req.end(body);
}


function og_action_get(res, action_name, access_token) 
{
  graph_get(
    '/me/superfbrps:'+action_name+'?access_token='+escape(access_token), 
    function(d) {
      sys.debug('og_action_get:'+d);
      res.end  ('og_action_get:'+d);
    } 
  );
}

function og_action_create(res, action_name, object_name, access_token)
{
  var body = 'to='+escape(base_url)+'/og/'+object_name+'.shtml'+'&'
  + 'access_token='+escape(access_token);

  graph_post(
    '/me/chess_ext:'+action_name,
    body,
    function(d) {
      sys.debug('og_action_create:'+action_name+':'+d);
      res.end  ('og_action_create:'+action_name+':'+d);
    } 
  );
}

function og_score_set(res, score, access_token, app_secret)
{
  var body =
  'score='+escape(score)
  + '&access_token='+escape(access_token)
  + '&client_secret='+app_secret;

  graph_post(
    '/me/games.scores?',
    body,
    function(d) {
      sys.debug('og_score_set:'+score+':'+d);
      res.end  ('og_score_set:'+score+':'+d);
    } 
  );
}

function og_score_delete_all(access_token)
{
}

function getCheevos(fb_info, res) {
  graph_get(
    '/me/games.achieves?access_token='+escape(fb_info.access_token),
    function (data) {
      console.log('data: ' + data);
      res.end(data);
    }
  );
  return;
}

function addCheevo(fb_info, res, cheevo) {
  var cheevo_url = escape(base_url + '/chess/cheevo/' + cheevo +'.shtml');
  var path = '/me/games.achieves?';
  var body = 'achievement='+cheevo_url+'&access_token='+escape(fb_info.access_token)+'&client_secret='+Server.fb_app_info.chess.secret;
  var graph_req = graph_post(
    path,
    body,
    function(d) {
      sys.debug('og achieves response:'+d);
      res.end('og achieves response: '+cheevo+' response: '+d);
      getCheevos(fb_info, res);
    }
  );
}

function handler(fb_info, res, cmd_str) {
  var cmds = cmd_str.split(' ');
  var cmd = cmds[0];
  switch(cmd) {
    case 'addcheevo':
      addCheevo(fb_info, res, cmds[1]);
      break;
    case 'addaction':
      //og_action_create(res,params.action,params.object,fb_info.access_token);
      og_action_create(res,cmds[1],cmds[2],fb_info.access_token);
  }
}

function req_handler(command, req, res)
{
  var fb_info = { access_token : 0 };
  
  if('cheevo_grant' == command) {
    // TODO: check list of available cheevos
    sys.debug('cheevo_update');

    var params = params_from_url(req.url);
    var cheevo = params.cheevo;
    var cheevo_url = escape('pirateninjachess.com/chess/cheevo/' + cheevo + '.shtml');
    var path = '/me/games.achieves?';
    var body = 'achievement='+cheevo_url+'&access_token='+escape(fb_info.access_token)+'&client_secret='+Server.fb_app_info.app_secret;
    var graph_req = graph_post(
      path,
      body,
      function(d) {
        sys.debug('og achieves response:'+d);
        res.end('og achieves response: '+cheevo+' response: '+d);
      }
    );
    return;
  }
  else if('cheevo_get' == command) {
    graph_get(
      '/me/games.achieves?access_token='+escape(fb_info.access_token),
      function (data) {
        res.end(data);
      }
    );
    return;
  }
  else if('action_grant' == command) {
    // TODO: check list of available actions
    sys.debug('action_grant');
    var params = params_from_url(req.url);
    og_action_create(res,params.action,params.object,fb_info.access_token);
    return;
  }
  else if('action_get' == command) {
    // TODO: check list of available actions
    sys.debug('action_get');
    var params = params_from_url(req.url);
    og_action_get(res,params.action,fb_info.access_token);
    return;
  }
  else if('score_set' == command) {
    // https://graph.facebook.com/me/games.scores?
    sys.debug('score_set');
    var params = params_from_url(req.url);
    og_score_set(res,params.score,params.access_token,app_secret);
    return;
  }
  sys.debug('unkown command pathname is '+pathname+' root is ' + command);   
}



exports.handler = handler;
exports.addCheevo = addCheevo;

