// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var ParseDashboard = require('parse-dashboard');
var Parse = require('parse/node');
//!! ejs jade view engine
//!! express router
//!! index.js 裡不能有app.get
//!! 做一個express router的架構 
//!! 寫一個前端網頁，傳資料到parse server 再存到 mongo 
//!! angular boost calendar 
//!! var ejs = require('ejs');
//!! 寫一個簡單的表單 傳DB , 在query到網頁

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;


var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'TimYi',
  masterKey: process.env.MASTER_KEY || 'master', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);
var allowInsecureHTTP = false;
var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": "http://localhost:1337/parse",
      "appId": "TimYi",
      "masterKey": "master",
      "appName": "Parse Example"
    }
  ]
},allowInsecureHTTP);
// link to dashboard
// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

// Parse Server plays nicely with the rest of your web routes
/*
app.get('/', fun(nctioreq, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});
*/
// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  //res.sendFile(path.join(__dirname, '/public/test.html'));
var GameScore = Parse.Object.extend("GameScore");
var gameScore = new GameScore();

gameScore.set("score", 1337);
gameScore.set("playerName", "Sean Plott");
gameScore.set("cheatMode", false);

gameScore.save(null, {
  success: function(gameScore) {
    // Execute any logic that should take place after the object is saved.
    //alert('New object created with objectId: ' + gameScore.id);
    console.log("save object complete");
    res.end();
  },
  error: function(gameScore, error) {
    // Execute any logic that should take place if the save fails.
    // error is a Parse.Error with an error code and message.
    //alert('Failed to create new object, with error code: ' + error.message);
    console.log("save fail " + error.message);
    res.end();
  }
});
});


// 404 Error
app.use(function(req,res){
  res.send("404 Error");
});

// app.use(function(req, res) {
//     res.status(404).end('error');
// });

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
