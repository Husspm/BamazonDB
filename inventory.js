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
        createProduct();
    }
});

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
        //addProduct(name);
        testValues(name);
    });
}
//testing the values before attempting to update the database, any info missing will return to the createProduct function
function testValues(product) {
    console.log("Testing your values...");
    //there is probably a smarter way to do this, but this is mostly working so I am gonna run with it
    var passedTestOne = true;
    var passedTestTwo = false;
    for (var key in product) {
        if (product[key] === "" || product[key] === undefined) {
            passedTestOne = false;
            console.log(key + " is a required field");
        } else {
            passedTestTwo = true;
        }
    }
    if (passedTestOne && passedTestTwo) {
        console.log("Tests Passed, content can now be added to the inventory list");
        addProduct(product);
    } else {
        console.log("Some information was missing, please try again");
        createProduct();
    }
}
//function to add info gathered from createProduct function that passed testValues function and add it to the db
function addProduct(product) {
    connection.query("INSERT INTO products SET ?", new Product(product.name, product.department, product.price, product.quantity),
        function(err, result) {
            if (err) throw err;
            //if no error occured tell user the item was added and display inventory
            if (!err)
                console.log("Your item has been added. Thank You!");
            displayUpdates();
        });
}
//contructor for adding items into the db
function Product(name, department, price, quantity) {
    this.product_name = name;
    this.department_name = department;
    this.price = price;
    this.quantity = quantity;
    return this; //return to caller 
}
//displays the info once itemed successfully added
function displayUpdates() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var index = 0; index < res.length; index++) {
            //was using a for key in res[index] loop nested in this loop but the print out was too sloppy
            console.log(res[index].department_name, res[index].product_name, res[index].price, res[index].quantity);
        } // ends var index for loop
        createProduct(); //start the whole process over
    }); // ends mysql call
}