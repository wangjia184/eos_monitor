const process = require('process');
const express = require('express');
const winston = require('winston');
const path = require('path');
const auth = require("basic-auth");
const fs = require('fs');


const DB = require('./db.js');

var exports = module.exports = {};

// parse command line
var basicAuthUsername, basicAuthPassword;
var args = process.argv.slice(2);
for( var i = 0; i < args.length; i++){
	var arg = args[i];
	if( arg.indexOf('--user=') == 0 ){
		basicAuthUsername = arg.substr('--user='.length);
	} 
	else if( arg.indexOf('--pass=') == 0 ){
		basicAuthPassword = arg.substr('--pass='.length);
	}
}


const app = express();

app.use( [ basicAuth, express.static(path.resolve(__dirname, 'www')) ]);
app.get('/api/aggregation_per_day', function (req, res) {
    if( basicAuth(req, res) ){
        DB.aggregatePerWindow(function(error, result){
            if(error){
                res.end(JSON.stringify(error));
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result, null, 4));
            }
        });
    }    
})

app.listen(8080, function () {
    winston.log('Web server started');
});


function basicAuth(req, res, next){
    var credentials = auth(req);
    if( basicAuthUsername != null &&
    	basicAuthPassword != null &&
    	basicAuthUsername.length > 0 &&
    	basicAuthPassword.length > 0){

    	if (credentials === undefined || 
	        credentials.name !== basicAuthUsername || 
	        credentials.pass !== basicAuthPassword) {
	        res.set("WWW-Authenticate", "Basic realm=Authorization Required")
	        res.status(401).end();
	        return false;
	    }

    }
    
    if( typeof(next) === 'function' )
        next(); 
    return true;
}
