// let ORM = require("./lib/myorm");
const Product = require("./lib/product");
const User = require("./lib/user");
const Order = require("./lib/order");
const LineItem = require("./lib/line_item");
const UI = require("./lib/ui");
// const mysql = require('mysql');

// const Table = require("cli-table");


// let dollarAmountFormat = price => parseFloat(price).toFixed(2).replace(/./g, function(c, i, a) {
// 		return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
// });

// let callback1 = function(results) {
// 	// console.log("in callback1");
// 	if (!Array.isArray(results)) results = [results];
// 	// results.forEach(result => console.log(instanceof result));
// 	let columns = Object.keys(results[0]).filter(key => !key.match(/(params|relation|idKey)/))
// 	let table = new Table({
// 		head: columns,
// 		// colAligns: columns.map(column=> !column.match(/price/i) ? 'left': 'right')
// 		colAligns: columns.map(column=> 'right')
// 	})
// 	// console.log(table.options.colAligns);
// 	// results.forEach(record => table.push(Object.keys(record).filter(key => !key.match(/(params|relation|idKey)/)).map(key=> key.match(/price/i) ? "$" + dollarAmountFormat(record[key]): record[key])));
// 	results.forEach(record => table.push(columns.map(key=> key.match(/price/i) ? "$" + dollarAmountFormat(record[key]): record[key])));
// 	console.log(table.toString());
// 	// results.slice(0,1).forEach(result => {
// 	// 	result.stock_quantity += 500;
// 	// 	console.log("result in callback: ", result)
// 	// 	result.update();
// 	// });
// 	// results.filter(result => result.product_name && result.product_name.match(/Xena Warrior/)).map(result => {
// 	// 	result.product_name = "Xena: Warrior Princess, Season 1";
// 	// 	result.price = 24.99,
// 	// 	result.stock_quantity += 1024;
// 	// 	result.update();
// 	// });
// }

let callback1 = require("./lib/tableprint");
// const dbName = "bamazon";

// let pool = mysql.createPool({
// 	connectionLimit: 10,
// 	host: "localhost",
// 	port: 3306,
// 	user: 'semlak',
// 	password: '',
// 	database: dbName
// });

// let Product = new ORM(pool, "products");
// let Product = new Product1(pool);
// console.log(Product);
let callback = function(blah) {
	console.log("result from callback:");
	console.log(blah);
}
// Product.find(callback1);
// Product.findById(4, callback);

let userOrdersParams = {
	where: {
			// department_name: "Computers"
			"user.email": "xena@gmail.com",
			"user.role" : "customer"
		}
	,
	join: [
		{
			type: "inner",
			leftModel: User,
			targetModel: Order,
			thisKey: "id",
			targetKey: "user_id"
		},
		{
			type: "inner",
			leftModel: Order,
			targetModel: LineItem,
			thisKey: "id",
			targetKey: "order_id"
		},
		{
			type: "inner",
			leftModel: LineItem,
			targetModel: Product,
			thisKey: "item_id",
			targetKey: Product.idKey
		}

	],
	calc: [{
		// text: "? * ? as totalPrice",
		text: "line_item.quantity * line_item.unit_price as totalPrice",
		values: []
		// values: ["line_item.quantity", "line_item.unit_price"]
	}, {
		// text: "? + 10 as otherQuantity",
		text: "line_item.quantity * line_item.unit_price *  .90 as DiscountPrice",
		// discountPrice for demonstration purposes
		values: []
		// values: ["line_item.quantity"]
	}

	],
	columns:[
		"user_order.id as OrderID",
		"products.item_id as ItemNum",
		"products.product_name",
		"department_name",
		"products.price"
	]
}



User.find(userOrdersParams, callback1)

let params = {
	where: {
		"product_name": "Hotel California"
	}
}
Product.find(params, callback1)



let userData = {
	email: "xena4@gmail.com",
	role: "Warrior Princess"
}
// let user = new User(userData);
// user.save();
User.find(null, callback1);

// // User.find(null, callback1);
// // Product.find(params, callback1)
// // Product.findOne(params, callback1)
User.findById(5, function(user) {
	user.role = "customer";
	user.update();
})

User.findOne(null, callback1);
Order.findOne(null, callback1);
LineItem.findOne(null, callback1);

params = {
	join: [{
			type: "inner",
			leftModel: LineItem,
			targetModel: Product,
			thisKey: "item_id",
			targetKey: "item_id"
	}]
}

LineItem.findOne(params, callback1);
LineItem.find(params, callback1);
params.where = {
	"unit_price": 11.29
}


let ui = new UI();
Product.find(null, ui.goUser.bind(ui));
// // Product.listenForEnd();

// // // Product.findById(7, callback1);

// // let product = new Product({product_name: "Xena Warrior Princess", department_name: "DVDs", price: 27.99, stock_quantity: 5023});
// // product.save();
