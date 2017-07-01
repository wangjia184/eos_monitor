const path = require('path');
const process = require('process');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

var dir = path.resolve(__dirname, 'db');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

var db = null;
var dbFile = null;

var exports = module.exports = {};

exports.setup = function(name, callback){
	dbFile = path.resolve(dir, name + '.db');
	db = new sqlite3.Database(dbFile, function(){
		initializeDatabase(callback);
	});
}


function initializeDatabase(callback){
	var sql = `
		CREATE TABLE IF NOT EXISTS 'main'.'transaction' 
		(
		    'Hash' TEXT PRIMARY KEY NOT NULL COLLATE NOCASE,
		    'From' TEXT NOT NULL,
		    'BlockNumber' INTEGER DEFAULT 0 NOT NULL,
		    'Amount' REAL DEFAULT 0 NOT NULL,
		    'Window' INTEGER DEFAULT 0 NOT NULL
		);
		CREATE INDEX IF NOT EXISTS 'main'.'idx_transaction_From' ON 'transaction' ('From' ASC);
		CREATE INDEX IF NOT EXISTS 'main'.'idx_transaction_BlockNumber' ON 'transaction' ('BlockNumber' ASC);
		CREATE INDEX IF NOT EXISTS 'main'.'idx_transaction_Amount' ON 'transaction' ('Amount' ASC);
		CREATE INDEX IF NOT EXISTS 'main'.'idx_transaction_Window' ON 'transaction' ('Window' ASC);`;
	db.exec(sql, function(error, result){
		if(error){
			console.error('ERROR on creating database', error);
			process.emit("SIGINT");
			return;
		}

		sql = `SELECT BlockNumber FROM 'main'.'transaction' ORDER BY BlockNumber DESC LIMIT 1;`;
		db.get( sql, function( error, result) {
			if(error){
				console.error('ERROR on querying database', error);
				process.emit("SIGINT");
				return;
			}

			if( typeof callback === 'function' ){
				console.log('Database is opened');
				callback(dbFile, result && (result.BlockNumber - 1)) ;
			}
		});
	});
	
}


exports.close = function(){
	if(db){
		console.log("Database is closed");
		db.close();
		db = null;
		stmt = null;
	}
}


exports.insert = function(rows){

	if( db ){
		var sql = "REPLACE INTO 'main'.'transaction'( `Hash`, `From`, `BlockNumber`, `Amount`, `Window`) VALUES\n";
		var parameters = [];
		for( var i = 0; i < rows.length; i++){
			if( i > 0 ) sql += ",";
			sql += "( ?, ?, ?, ?, ?)";
			parameters.push(rows[i].Hash);
			parameters.push(rows[i].From);
			parameters.push(rows[i].BlockNumber);
			parameters.push(rows[i].Amount);
			parameters.push(rows[i].Window);
		}
		sql += ";";
		db.run( sql, parameters);
	}
}


exports.aggregatePerWindow = function(callback){

	var sql = "SELECT `Window`, SUM(Amount) AS `TotalAmount` FROM `main`.`transaction` GROUP BY `Window`  ORDER BY `Window` ASC";

	db.all(sql, callback);
}