const inquirer = require("inquirer");
const Order = require("./order");
const LineItem = require("./line_item");
let tablePrint = require("./tableprint");



let formatPrice = price => parseFloat(price).toFixed(2).replace(/./g, function(c, i, a) {
    		return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
	});

let orderPrint = results => {
	console.log("results in orderPrint:", results);
	// just add total row to results:
	let totalCost = results.map(lineItem=> lineItem.totalCost).reduce((a, b) =>a+b);
	console.log("order total cost: " , totalCost);
	results.push({productName: "Total Order:", totalPrice: totalCost})
	tablePrint(results);
}


module.exports = class UI {
	constructor() {
		this.product_data = [];
		this.xena = "Xena";
		this.orderItems = [];
		this.order = null;
	}
	selectItems(data) {
		// function will run recursively, continually prompting the user if they want to select something else, and then quanity
		let validQuantity = (x) => {
			let n = parseInt(x);
			// console.log(n, n>0, n < 10000);
			return (n > 0 && n < 100000);
		}
		let questions = [
		{
			name: "selectedItem",
			type: 'list',
			message: "Please select an item to purchase",
			// choices: items.map(item => 'In Department ' + item.department_name + ", " + item.product_name)
			choices: this.product_data.map(item => ({
				name: item.product_name + " ($" + formatPrice(item.price) + ")",
				value: item
			}))
		},
		{
			message: "Great, how many of those items would you like to buy?",
			name: "quantity",
			type: "input",
			validate: validQuantity,
			when: function( answers) {
				return answers.selectedItem;
			}
		},
		{
			message: "Would you like to select another item?",
			type: "confirm",
			name: "continueShopping"
		}];
		inquirer.prompt(questions).then(function(answers) {
			this.orderItems.push(answers);
			// if (this.order == null) {
			// 	this.order = new Order();
			// }
			// let line_item = new LineItem({
			// 	item_id: answers.selectedProduct.item_id,
			// 	price: answers.selectedProduct.price,
			// 	quantity: answers.quantity
			// });
			// this.orderItems.push(line_item);
			console.log("selection output:\n\n\n", answers);
			if (answers.continueShopping)  {
				this.selectItems(data);
			}
			else {
				console.log("orderItems", this.orderItems);
				this.checkout();
			}
		}.bind(this));
	}
	checkout() {
		let questions = [{
			message: "Are you ready to submit your order?",
			type: "confirm",
			name: "submit"
		}];
		inquirer.prompt(questions).then(function(answers) {
			if (answers.submit) {
				console.log("in confirm branch");
					let lineItems = this.orderItems.map(item => {
						console.log("preparing item", item);
						let lineItem = new LineItem({
							item_id: item.selectedItem.item_id,
							unit_price: item.selectedItem.price,
							quantity: parseFloat(item.quantity)
						});
						console.log("created lineItem: " , lineItem);
						return lineItem;
					})
				this.order = new Order({user_id: 1});

				try {
					this.order.submit(lineItems, tablePrint);

				}
				catch (err) {
					console.log("Sorry. Unable to fill that order")
				}
			}
			else {
				console.log("not submitting order")
			}
		}.bind(this))
	}

	goUser(data) {
		this.product_data = data;
		let me = this;
		// console.log("this0", this);
		const questions = [
		{
			name: 'playerName',
			type: 'input',
			message: "Welcome to my amazing online store! Please tell me your name:",
			validate: function(value) {
				if (value.length) {
					return true;
				}
				else {
					return "Please enter at least something for a name."
				}
			},
		},
		{
			name: 'email',
			type: 'input',
			message: "Email address:",
			validate: function(value) {
				if (value.length) {
					return true;
				}
				else {
					return "Please enter at least something for your email."
				}
			},
		}];

		inquirer.prompt(questions).then(function(answers) {
			console.log(answers);
			// console.log("this1", this);

			// console.log("me", me);
			me.selectItems();

			// if (answers.playGame === "Yes") {
			// 	app = new HangmanApp(answers.playerName, 10, "tolkien")
			// 	screen.app = app;
			// 	app.startGame();
			// 	// let game = app.game;
			// 	// console.log("game", app.game);
			// 	keypressGame(app.game);

			// }
			// else {
			// 	console.log("Okay. Exiting app...");
			// 	screen.down(10, false);
			// }
		}.bind(this));
	}


}