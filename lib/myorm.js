'use strict';

const validTableNames = {
	"products": true,
	"user": true,
	"line_item": true,
	"user_order": true
};


module.exports = class ORM {
	constructor(connectionPool, relation) {
		if (!validTableNames[relation]) throw "Relation + '" + relation + "' is not a valid relation for this ORM."
		this.pool = connectionPool;
		this.relationName = relation;
		this.idKey = this.relationName === 'products' ? "item_id" : "id";

	}

	find(params, callback) {
		// callback should expect an an array of recordObjects
		let me = this;
		this.pool.getConnection(function(err, connection) {
			let sqlInitialQueryText = 'select * from ' + me.relationName;
			// if pararms is empty, sql statement needs no query clause
			let paramKeys = Object.keys(params|| {});
			let sqlWhereClause = paramKeys.length < 1? "" :  " where " + paramKeys.map(key => key + " = ?").join(", ");

			// + ' where ' + Object.keys(params).map(key => key + " = ?").join(", ");
			let options = {
				sql: sqlInitialQueryText + sqlWhereClause,
				timeout: 10000,
				values: paramKeys.map(key => params[key])
			}
			console.log("query options", options);
			connection.query(options, function(err, results) {
					if (err) console.log("err", err);
					else if (results.length < 1) {
						throw "No record with '" + me.idKey + "' equal to '" + id + "' found in '" + me.relationName + "' relation.";
					}
					if (typeof callback === "function") {
						callback(results);
					}
					else {
						console.log("results:", results);
					}
					connection.release();
					// list();

				})
		});
	}


	findOne(params, callback) {
		// just call the find function, but use the first result
		// callback should expect a single record Object rather than an array of recordObjects
		let newCallback = function(results) {
			callback(results[0]);
		}
		this.find(params, newCallback);
	}

	findById(id, callback) {
		// just call the findOne function,
		// callback should expect a single record Object rather than an array of recordObjects
		let params = {};
		params[this.idKey] = id;
		this.findOne(params, callback);
	}

}





let listenForEnd = () =>
	pool.on("release", function(connection) {
	 	console.log('Connection %d released', connection.threadId);
	 	// console.log("pool", pool);
	 	console.log("_connectionQueue", pool._connectionQueue.length)
	 	if (pool._connectionQueue.length < 1) {
	 		// pool.end();
	 	}

})