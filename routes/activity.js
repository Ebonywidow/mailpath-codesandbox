'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');
var axios = require('axios');
var FuelSoap = require('fuel-soap');
var moment = require('moment-timezone');
var sandyalexander  = require('./sandyalexander');

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {
    //var testJwtBody = req.body;
    console.log("Execute Start");
    //logData(testJwtBody);
    

    // example on how to decode JWT
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {

        // verification error -> unauthorized request
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            // decoded in arguments
            //var decodedArgs = decoded.inArguments[0];
            console.log('Execute -> Decoded JWT Sucess')

            insertQueueSfmcRecord(decoded, function (err, res) {
                if(err){
                    console.log('Queue not saved' + err);
                } else {
                    console.log('Queue saved' + res);
                }
            });

            insertActivitySfmcRecord(decoded, function (err, res) {
              if(err){
                    console.log('Record not saved' + err);
                } else {
                    console.log('Record saved' + res);
                }
            });
            
            sandyalexander.requestBin(decoded);
            //logData(req);
            res.send(200, 'Execute');
        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Publish');
};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Validate');
};

function insertActivitySfmcRecord(decoded, fn){
    var values = decoded.inArguments[0];
    
    var data = { 
        grant_type: 'client_credentials',
        client_id: process.env.SfmcClientId,
        client_secret: process.env.SfmcClientSecret,
        account_id: process.env.accountID,
    };
    
    var config = {
        method: 'post',
        url: process.env.SfmcAuthUrl+'v2/token',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };
    
    var today = new Date();
    today = moment.tz(today, process.env.TZ);

    axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));

        var insData = [
            {
                "keys":{
                        "ActivityName": values.summaryactivityname
                },
                "values":{
                        "JourneyActive": true,
                        "ActiveDate": today.format()
                }
            }
        ];

        console.log('insData ------>'+JSON.stringify(insData));

        var configs = {
	        method: 'POST',
            url: process.env.SfmcRestUrl+'hub/v1/dataevents/key:'+process.env.SfmcActivityDEExternalKey+'/rowset',
            headers: { 
		        'Content-Type': 'application/json',
		        'Authorization': 'Bearer '+response.data.access_token
            },
            data : insData
    	};
	
        axios(configs)
        .then(function (response) {
            fn('',response);
        })
        .catch(function (error) {
            console.log('Something went wrong for updating Mailpath Activity!!! '+error);
            let resp = {};
            fn(error,resp);
        });
    })
    .catch(function (error) {
        console.log('Getting Access token for Mailpath Activity: '+error);
        let resp = {};
        fn(error,resp);
    });

    /*var optionsV1 = {
        auth: {
        clientId: process.env.SfmcClientId, 
        clientSecret: process.env.SfmcClientSecret
        }
        , soapEndpoint: process.env.SfmcSoapUrl+'/Service.asmx'
    };

    var optionsV2 = {
    auth: {
        clientId: process.env.SfmcClientId, 
        clientSecret: process.env.SfmcClientSecret,
        authVersion: Number(process.env.AuthVersion),
        authUrl: process.env.SfmcAuthUrl+'v2/token/',
        authOptions:{
            authVersion: Number(process.env.AuthVersion)
        }
    }
    , soapEndpoint: process.env.SfmcSoapUrl+'/Service.asmx'
    };

    var options = process.env.AuthVersion == "2" ? optionsV2 : optionsV1;
    var client = new FuelSoap(options);

    var today = new Date();
    today = moment.tz(today, process.env.TZ);

    var co = {
        "CustomerKey": process.env.SfmcActivityDEExternalKey,
        "Keys":{
            "Key":[
                {"Name":"ActivityName","Value":values.summaryactivityname}
            ]
        },
        "Properties":[
            {"Property":
                [
                    {"Name":"JourneyActive","Value": true},
                    {"Name":"ActiveDate","Value":today.format() }
                ]
            }
        ]
    };

    var uo = {
        SaveOptions: [{"SaveOption":{PropertyName:"DataExtensionObject",SaveAction:"UpdateAdd"}}]
    };
    
    client.update('DataExtensionObject',co,uo, function(err, response){
        fn(err,response);
    });*/
}

function insertQueueSfmcRecord(decoded, fn){
    var values = decoded.inArguments[0];

    var data = { 
        grant_type: 'client_credentials',
        client_id: process.env.SfmcClientId,
        client_secret: process.env.SfmcClientSecret,
        account_id: process.env.accountID,
    };
    
    var config = {
        method: 'post',
        url: process.env.SfmcAuthUrl+'v2/token',
        headers: { 
            'Content-Type': 'application/json'
        },
        data : data
    };
    
    axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
        
        var insData = { 
            "items": [{
                "ContactKey": values.contactKey,
                "MappedData" : values.mappedFieldsForQueue,
                "ActivityName": values.summaryactivityname
            }]
        };
        console.log('insData ------>'+JSON.stringify(insData));

        var configs = {
	        method: 'POST',
            url: process.env.SfmcRestUrl+'data/v1/async/dataextensions/key:'+process.env.SfmcQueueDEExternalKey+'/rows',
            headers: { 
		        'Content-Type': 'application/json',
		        'Authorization': 'Bearer '+response.data.access_token
            },
            data : insData
    	};
	
        axios(configs)
        .then(function (response) {
            fn('',response);
        })
        .catch(function (error) {
            console.log('Something went wrong for updating Mailpath Queue!!! '+error);
            let resp = {};
            fn(error,resp);
        });
    })
    .catch(function (error) {
        console.log('Getting Access token for Mailpath Queue: '+error);
        let resp = {};
        fn(error,resp);
    });

    /*var optionsV1 = {
        auth: {
        clientId: process.env.SfmcClientId, 
        clientSecret: process.env.SfmcClientSecret
        }
        , soapEndpoint: process.env.SfmcSoapUrl+'/Service.asmx'
    };

    var optionsV2 = {
    auth: {
        clientId: process.env.SfmcClientId, 
        clientSecret: process.env.SfmcClientSecret,
        authVersion: Number(process.env.AuthVersion),
         : process.env.SfmcAuthUrl+'v2/token',
        authOptions:{
            authVersion: Number(process.env.AuthVersion)
        }
    }
    , soapEndpoint: process.env.SfmcSoapUrl+'/Service.asmx'
    };

    var options = process.env.AuthVersion == "2" ? optionsV2 : optionsV1;
    var client = new FuelSoap(options);

    var co = {
        "CustomerKey": process.env.SfmcQueueDEExternalKey,
        "Keys":{
            "Key":[
                {"Name":"ActivityName","Value": values.summaryactivityname}
            ]
        },
        "Properties":[
            {"Property":
                [
                    {"Name":"ContactKey","Value": values.contactKey},
                    {"Name":"MappedData","Value": values.mappedFieldsForQueue}
                ]
            }
        ]
    };

    console.log("This is getting pushed to the queue DE: " + JSON.stringify(co));

    var uo = {
        SaveOptions: [{"SaveOption":{PropertyName:"DataExtensionObject",SaveAction:"UpdateAdd"}}]
    };
    
    client.update('DataExtensionObject',co,uo, function(err, response){
        fn(err,response);
    });*/
}