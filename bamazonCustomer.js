let ORM = require("./lib/myorm");
let Product = require("./lib/product");
const mysql = require('mysql');

const Table = require("cli-table");

let callback1 = function(results) {
	console.log("in callback1");
	if (!Array.isArray(results)) results = [results];

	let table = new Table({head: Object.keys(results[0]).filter(key => key != 'params')})
	results.forEach(record => table.push(Object.keys(record).filter(key => key != 'params').map(key=>record[key])));
	console.log(table.toString());
	// results.slice(0,1).forEach(result => {
	// 	result.stock_quantity += 500;
	// 	console.log("result in callback: ", result)
	// 	result.update();
	// });
	results.filter(result => result.product_name.match(/Xena Warrior/)).map(result => {
		result.product_name = "Xena: Warrior Princess, Season 1";
		result.price = 24.99,
		result.stock_quantity += 1024;
		result.update();
	});
}

const dbName = "bamazon";

let pool = mysql.createPool({
	connectionLimit: 10,
	host: "localhost",
	port: 3306,
	user: 'semlak',
	password: '',
	database: dbName
});

// let Product = new ORM(pool, "products");
// let Product = new Product1(pool);
// console.log(Product);
let callback = function(blah) {
	console.log("result from callback:");
	console.log(blah);
}
// Product.find(callback1);
// Product.findById(4, callback);

let params = {
	department_name: "Computers"
}

let User = new ORM(pool, "user");
// User.find(null, callback1);
// Product.find(params, callback1)
// Product.findOne(params, callback1)
Product.find(null, callback1);
// Product.findById(7, callback1);

let product = new Product({product_name: "Xena Warrior Princess", department_name: "DVDs", price: 27.99, stock_quantity: 5023});
// product.save();