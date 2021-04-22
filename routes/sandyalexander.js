'use strict';
var util = require('util');

// Deps
var Path = require('path');
var util = require('util');
var http = require('https');
var FuelSoap = require('fuel-soap');
var moment = require('moment-timezone');
var request = require('request');

// Returns all Products by client
exports.products = function(req, res){
    var customerId = req.query.customerId;

    var url = `${process.env.SandyApiUrl}/api/customer/${customerId}?api-version=1.0` ;
    
    request(
        {
            url : url,
            headers : {
                "Content-type": "application/json",
                "ApiKey": "14E1BD70-4360-4813-9187-AB22D41F9585"
            }
        },
        function (error, response, body) {
            if(error){
                console.log(error);
            }

            res.status(200).json(JSON.parse(body));
        }
    );
};

//Sends message to sandy alexander with context info
exports.message = function(req, resp){

    var type = req.body.type;
    var reqBody = {};

    var datetime = new Date();
    datetime = moment.tz(datetime, process.env.TZ);

    if(type == "new") {
        var reqBody = {
            supportRequestId : 0,
            userName : 'Corrida Grill',
            clientDateTime : datetime,
            customerId : 1,
            context : 'New Product Request',
            activityName : '',
            productId : 1
        };
    } else if (type == "contact") {
        var reqBody = {
            supportRequestId : 0,
            userName : 'Corrida Grill',
            clientDateTime : datetime,
            customerId : 1,
            context : 'Dashboard Contact',
            activityName : '',
            productId : 1
        };
    } else {
        var reqBody = {
            supportRequestId : 0,
            userName : 'Corrida Grill',
            clientDateTime : datetime,
            customerId : 1,
            context : 'Product Changes',
            activityName : '',
            productId : req.body.prodId
        };
    }
 
    var url = `${process.env.SandyApiUrl}/email/send`;
        
    request(
        {
            method: 'POST',
            url : url,
            headers : {
                "Content-type": "application/json",
                "ApiKey": "14E1BD70-4360-4813-9187-AB22D41F9585"
            },
            body: reqBody,
            json: true
        },
        function (error, response) {
            if (error) return resp.status(200).send(error);
            console.log("error: " + error);
            console.log("response: " + JSON.stringify(response));
            return resp.status(200).send(response);
         });
};

exports.dashboardData = function(req, res){

    var url = `${process.env.SandyApiUrl}/api/journey?api-version=1.0`;

    request(
        {
            url : url,
            headers : {
                "Content-type": "application/json",
                "ApiKey": "14E1BD70-4360-4813-9187-AB22D41F9585"
            }
            
        },
        function (error, response, body) {
            if(error){
                console.log(error);
            }

            res.status(200).json(JSON.parse(body));
        }
    );
};


exports.requestBin = (data) => {
    if(process.env.requestBin){
        var url = process.env.requestBin;
      
        request(
            {
                method: 'POST',
                url : url,
                headers : {
                    "Content-type": "application/json",
                    "ApiKey": process.env.SandyApiKey
                },
                body : data,
                json : true
            },
            function (error, res, body) {
                if(body.errors){
                    console.log("RequestBin Error=" + body.errors);                
                }
                console.log("RequestBin Complete");
                //res.status(200).json(JSON.parse(body));
            }

        );
    }
};

exports.saveActivity = function(data)
{
    
    //var data = JSON.stringify(req.body);
    //var data = req.body;
    console.log('insData '+JSON.stringify(data));

    data.Keys.SfmcEnterpriseId = process.env.SfmcEnterpriseId;
    data.Keys.SfmcBusinessUnitId = process.env.accountID;
    console.log("Save activity: " + data);
    var url = `${process.env.SandyApiUrl}/api/SaveActivity`;

    request(
        {
            method: 'POST',
            url : url,
            headers : {
                "Content-type": "application/json",
                "ApiKey": "14E1BD70-4360-4813-9187-AB22D41F9585"
            },
            body : data,
            json : true
        },
        function (error, response, body) {
            if(body.errors){
                console.log("SaveActivity Error=" + body.errors);                
            }
            //res.status(200).json(JSON.parse(body));
        }

    );

};