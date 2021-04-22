'use strict';
// Module Dependencies
// -------------------
var express         = require('express');
var bodyParser      = require('body-parser');
var errorhandler    = require('errorhandler');
var http            = require('http');
var path            = require('path');
var request         = require('request');
var routes          = require('./routes');
var mcapp           = require('./routes/app');
var activity        = require('./routes/activity');
var sfmc            = require('./routes/sfmc');
var sandyalexander  = require('./routes/sandyalexander');
var configJSON = require('./public/config-json');

var app = express();
if (process.env.Development === undefined ) {
    require('dotenv').config();
}

app.get('/config.json', function(req, res) {
    // Journey Builder looks for config.json when the canvas loads.
    // We'll dynamically generate the config object with a function
    return res.status(200).json(configJSON(req));
});

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({type: 'application/jwt'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ type: 'application/json', limit: '50mb', extended: true }));
//app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.methodOverride());
//app.use(express.favicon());

app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

// HubExchange Routes
app.get('/', routes.index );
app.post('/login', routes.login );
app.post('/logout', routes.logout );

// JB Activity Routes
app.post('/journeybuilder/save/', activity.save );
app.post('/journeybuilder/validate/', activity.validate );
app.post('/journeybuilder/publish/', activity.publish );
app.post('/journeybuilder/execute/', activity.execute );

//MC App route
app.get('/mcapp', (_request, response) => {response.render('home/home.html');});
app.get('/mcapp/login', mcapp.login);
app.get('/mcapp/logout', mcapp.logout);
app.post('/mcapp/requestBin', mcapp.requestBin);

// SFMC routes
app.get('/sfmc/dataextensionrows', sfmc.dataextensionrows);
app.get('/sfmc/derowsforapp', sfmc.derowsforapp);
app.get('/sfmc/queuederowsforapp', sfmc.queuederowsforapp);
app.get('/sfmc/getdename', sfmc.getdename);
app.post('/sfmc/validatefolder', sfmc.createFolder);
app.post('/create/staticde/', sfmc.staticDataExtension);
app.post('/create/staticdequeue/', sfmc.staticDataExtensionQueue);
app.post('/create/staticdesync/', sfmc.staticDataExtensionSync);
app.post('/sfmc/saveactivity', sfmc.saveactivity);
app.get('/queuestatus', sfmc.queuestatus);
app.get('/sync', sfmc.sync);

// Sandy Alexander routes
app.get('/sandyalexander/products', sandyalexander.products);
app.post('/sandyalexander/message', sandyalexander.message);
app.post('/sandyalexander/saveactivity', sandyalexander.saveActivity);
app.get('/sandyalexander/dashboardData', sandyalexander.dashboardData);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});