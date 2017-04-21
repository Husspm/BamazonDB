var db = require("mysql");
var ask = require("inquirer");

var connection = db.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "qaz123wsx456",
    database: "BamazonDB"
});
connection.connect(function(err) {
    if (err) throw err;
    else {
        console.log("Welcome you are connected to the bamazonDB as id + " + connection.threadId);
        createItem();
    }
});
//contructor for adding items into the db
function Product(name, department, price, quantity) {
    this.product_name = name;
    this.department_name = department;
    this.price = price;
    this.quantity = quantity;
    return this;
}
//function to be called after successful connection
function createProduct() {
    ask.prompt([{
            type: "input",
            name: "name",
            message: "Enter the products name"
        },
        {
            type: "input",
            name: "department",
            message: "Enter the products department"
        },
        {
            type: "input",
            name: "price",
            message: "Enter the cost of the item"
        },
        {
            type: "input",
            name: "quantity",
            message: "Enter how many to add"
        }
    ]).then(function(name) {
        addProduct(name);
    });
}
//function to actually add info gathered from createProduct function and add it to the db
function addProduct(product) {
    connection.query("INSERT INTO products SET ?", new Item(product.name, product.department, product.price, product.quantity),
        function(err, result) {
            if (err) throw err;
            //if no error occured tell user the item was added
            if (!err)
                console.log("Your item has been added. Good luck!");
            displayUpdates();
        });
}
//displays the info once itemed successfully added
function displayUpdates() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var index = 0; index < res.length; index++) {
            for (var key in res[index]) {
                console.log(key.toUpperCase() + " " + res[index][key]);
            } // ends key in res[index] loop
        } // ends var index for loop
    }); // ends mysql call
    createProduct(); //start the whole process over
}