'use strict';

let stringify = require('json-stringify');


const validTableNames = {
	"products": true,
	"user": true,
	"line_item": true,
	"user_order": true
};

const mysql = require('mysql');
// let Product = new ORM('products')
// const relation = 'products';
const dbName = 'bamazon';
// const idKey = 'item_id'

let pool = mysql.createPool({
	connectionLimit: 10,
	host: "localhost",
	port: 3306,
	user: 'semlak',
	password: '',
	database: dbName
});



module.exports = class ORM {
	constructor(params) {
		// if (!validTableNames[relation]) throw "Relation + '" + relation + "' is not a valid relation for this ORM."
		// this.pool = connectionPool;
		// this.relationName = relation;
		// this.idKey = this.relationName === 'products' ? "item_id" : "id";
		Object.keys(params).forEach(key=> this[key] = params[key]);
		this.params = params;
	}


	save(callback) {
		console.log("trying to save")
		let me =this;
		pool.getConnection(function(err, connection) {
			let sqlStatement = 'insert into ' + me.relation + ' SET ?';
			connection.query(sqlStatement, me.params, function(err, results, fields) {
				if (err) console.log(err);
				console.log("results", results);
				console.log("sqltext: " ,this.sql);
				if (typeof callback === "function") {
					// the rersults will be an object that says fieldCount, affectedRows, insertID, and some other stuff
					callback(results);
				}
			})
		})
	}

	static insert(connection, rows, callback) {
		// this is inserting multiple records at once
		if (rows.length < 1) {
			callback([]);
			return ;
		}

		let me = this;

		let columnNames = Object.keys(rows[0]).filter(key => key != this.idKey && key != "params" && key != "relation" && key != "idKey");
		// get array of array of values, where each sub-array is a tupple of values for an individual row
		let columnValues = rows.map(row => columnNames.map(key => row[key]));


		// pool.getConnection(function(err, connection) {
			let sqlInitialQueryText = 'insert into ' + me.relation + " (" + columnNames.join(", ") + ") values ?"  ;
			let options = {
				sql: sqlInitialQueryText,
				timeout: 10000,
				values: [columnValues]
			}
			console.log("\n\n\nQuery options: " , stringify(options));
			connection.query(options, function(err, results, fields) {
				if (err) {
					console.log("error in bulk insert", err);
					return connection.rollback(function() {
						console.log("error1. Rolling back")
						// throw err;
					});

				}
				else {
					// results.forEach(result => console.log("result", result));
					console.log("results: ", results);
					// results contains fieldCount, affectedRows, insertId for one of the elements, serverStatus, warningCount, messagae, protocol, changedRows
					if (typeof callback === "function" )  callback(null, results);

				}
			})
		// }.bind(this))
	}

	update(callback) {
		let me =this;
		pool.getConnection(function(err, connection) {
			let updates = Object.assign({}, me.params);
			// update anything where the this[key] is not equal to the params[key]
			Object.keys(updates).forEach(key => {
				if (updates[key] === me[key]) {
					delete updates[key]
				}
				else {
					updates[key] = me[key]
				}
			});

			if (updates[me.idKey]) delete updates[me.idKey];

			if (Object.keys(updates).length < 1) {
				// console.log ("No updates to make");
			}
			else {
				let sqlStatement = 'update ' + me.relation + ' SET ? where ' + me.idKey + ' = ?';
				connection.query(sqlStatement, [updates, me.params[me.idKey]], function(err, results, fields) {
					if (err) console.log(err);
					console.log("results", results);
					console.log("query text: ", this.sql)
				})
			}

		})
	}




	remove(callback) {
		let params = {};
		params[me.idKey] = this[me.idKey];
		Product.remove(params, callback);
	}

	static newMe(params) {

	}

	static remove(params, callback) {

	}

	static deleteMany(params, callback) {

	}

	static deleteOne(params, callback) {

	}
	static relationName() {
		return this.relation;
	}

	static find(params, callback) {
		// callback should expect an an array of recordObjects
		let me = this;
		// console.log(this);


		pool.getConnection(function(err, connection) {

			let whereClauseKeys = params && params.where ? Object.keys(params.where) : [];
			let calcFields = params && params.calc ?  params.calc: [];
			let joinClauses = params && params.join ? params.join: [];

			// console.log("whereClauseKeys", whereClauseKeys)
			// console.log("joinClauses", joinClauses)
			// console.log("calcFields", calcFields)
			let sqlWhereClause = whereClauseKeys.length < 1 ? "" :
				"where " + whereClauseKeys.map(key =>[key,  "=", "?"].join(" ")).join(" and ");
			let sqlWhereClauseValues = whereClauseKeys.map(key => params.where[key]);
			// console.log("sqlWhereClause", sqlWhereClause)
			// console.log("sqlWhereClauseValues", sqlWhereClauseValues)

			let sqlJoinClause = joinClauses.map(joinInfo => [
					joinInfo.type,
					"join",
					joinInfo.targetModel.relation ,
					"on" ,
					joinInfo.leftModel.relation +"."+ joinInfo.thisKey ,
					"=" ,
					joinInfo.targetModel.relation +"."+ joinInfo.targetKey
				].join(" ")
			).join(" ");
			// console.log("sqlJoinClause", sqlJoinClause)


			let sqlCalcFieldsClause = calcFields.map(obj =>  obj.text);
			// console.log("sqlCalcFieldsClause", sqlCalcFieldsClause)
			let sqlCalcPlaceHolderValues = [].concat.apply([], calcFields.map(obj => obj.values))
			// console.log("sqlCalcPlaceHolderValues", sqlCalcPlaceHolderValues)
				// the [].concat.apply([], arrayOfArays) flattens an array of arrays
				// https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays-in-javascrip

			let rowColumnsToGet = params && params.columns ? params.columns: []
			// console.log("rowColumnsToGet", rowColumnsToGet)
			let sqlInitialQueryText = [
				'select',
				[rowColumnsToGet, sqlCalcFieldsClause].filter(arr=> arr.length>0).join(", ") || "*",
				"from",
				me.relation,
				sqlJoinClause,
				sqlWhereClause
			].join(" ")
			let sqlOptions = [].concat.apply([],[sqlCalcPlaceHolderValues, sqlWhereClauseValues]);
			// console.log("sqlInitialQueryText", sqlInitialQueryText)
			// console.log("sqlOptions", sqlOptions)
			// if pararms is empty, sql statement needs no query clause

			 // (joinClauseKeys.type || " inner ") + whereClauseKeys.map(key => key + " = ?").join(", ");

			// + ' where ' + Object.keys(params).map(key => key + " = ?").join(", ");
			let options = {
				sql: sqlInitialQueryText,
				timeout: 10000,
				values: sqlOptions
			}
			// console.log("query options", options);
			// return;
			connection.query(options, function(err, results) {
					// console.log("this.sql", this.sql)
					if (err) {
						console.log("err", err);
						throw err;
					}
					else if (results.length < 1) {
						throw "No record with with specified params  found in '" + me.relation + "' relation.";
					}
					if (typeof callback === "function") {
						// convert each result into Product type
						// let items = results.map(result => new Product(result));
						// console.log(results);
						// callback(results);
						// return;
						let items = results.map(result => me.newMe(result));
						callback(items);
					}
					else {
						console.log("results:", results);
					}
					connection.release();
					// list();

				})
		}.bind(this));
	}

	static join(params, callback) {
		/*joins results from the current model with model(s) passed in params
			sampleParms = {
				thisObj
			}
		*/

	}

	static findOne(params, callback) {
		// just call the find function, but use the first result
		// callback should expect a single record Object rather than an array of recordObjects
		let newCallback = function(results) {
			callback(results[0]);
		}
		this.find(params, newCallback);
	}

	static findById(id, callback) {
		let me = this;
		// just call the findOne function,
		// callback should expect a single record Object rather than an array of recordObjects
		let params = {};
		params.where = {};
		params.where[me.idKey] = id;
		this.findOne(params, callback);
	}

	getPool() {
		return pool;
	}


}


module.exports.pool = pool;




let listenForEnd = () =>
	pool.on("release", function(connection) {
	 	console.log('Connection %d released', connection.threadId);
	 	// console.log("pool", pool);
	 	console.log("_connectionQueue", pool._connectionQueue.length)
	 	if (pool._connectionQueue.length < 1) {
	 		pool.end();
	 	}

});

module.exports.listenForEnd = listenForEnd;
