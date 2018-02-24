'use strict';
const Table = require("cli-table");

let dollarAmountFormat = price => parseFloat(price).toFixed(2).replace(/./g, function(c, i, a) {
		return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
});

module.exports = function(results) {
	if (!Array.isArray(results)) results = [results];
	let columns = Object.keys(results[0]).filter(key => !key.match(/(params|relation|idKey)/))
	let table = new Table({
		head: columns,
		// colAligns: columns.map(column=> !column.match(/price/i) ? 'left': 'right')
		colAligns: columns.map(column=> 'right')
	})
	// if (results.length > 0) console.log( typeof results[0], results[0].hasOwnProperty("totalPrice"))
	// if (results.length > 0 && typeof results[0] === "object" &&  results[0].hasOwnProperty("totalPrice")) {
	// 	// add total row for order
	// 	let totalCost = results.map(lineItem=> lineItem.totalPrice).reduce((a, b) =>a+b);
	// 	console.log("order total cost: " , totalCost);
	// 	results.push({productName: "Total Order:", totalPrice: totalCost})

	// }
	results.forEach(record => table.push(columns.map(key=> key.match(/price/i) ? "$" + dollarAmountFormat(record[key]): record[key])));
	console.log(table.toString());
}
