//inventory.js used to initially create database modified so some comments might be removed
var db = require("mysql");
var ask = require("inquirer");

var connection = db.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "", //I need that ;)
    database: "BamazonDB"
});
connection.connect(function(err) {
    if (err) throw err;
    console.log("Welcome you are connected to the bamazonDB as id + " + connection.threadId);
    checkUser();
});
var accessPW = "thisDOT"; //you'll need this if you don't want the bamazon law team coming after you
var PWattAllowed = 3;

function checkUser() {
    if (PWattAllowed === 0) {
        console.log("We have your IP address, the cops are on their way you criminal!!! How dare you try hack Bamazon");
    } else {
        ask.prompt([{
            message: "Who is using this program?",
            type: "list",
            choices: ["Patrick", "CJ", "Hannah", "Dustin"], //I don't know who's gonna grade it ;)
            name: "user"
        }]).then(function(name) {
            ask.prompt([{
                message: "Welcome " + name.user + " please enter the password",
                type: "input",
                name: "guess"
            }]).then(function(name) {
                if (name.guess === accessPW) {
                    console.log("Access granted");
                    managerHome();
                } else {
                    PWattAllowed--;
                    console.log("Access Denied", PWattAllowed, "attempts left");
                    checkUser();
                }
            });
        });
    }
}

function managerHome() {
    ask.prompt([{
        message: "What would you like to do today?",
        type: "list",
        choices: ["View Inventory", "Add more Products", "View low Inventory", "Replenish Stock"],
        name: "managerChoice"
    }]).then(function(name) {
        switch (name.managerChoice) {
            case "View Inventory":
                displayUpdates();
                break;
            case "Add more Products":
                createProduct();
                break;
            case "View low Inventory":
                displayUpdates(0);
                break;
            case "Replenish Stock":
                displayUpdates(0, 1);
                ask.prompt([{
                    message: "Which item by item_id would you like to update?",
                    type: "input",
                    name: "selection"
                }]).then(function(name) {
                    updateStock(name);
                });
                break;
        }
    });
}
//function to add products from inventory.js
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
    //there is probably a smarter way to do this, but this is working so I am gonna run with it
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
//displays the info once itemed successfully added, reused in manager.js with some js trickery to change its output
//this might seem a little convoluted but I wanted to reuse this function as much as possible
function displayUpdates(check, check2) {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var index = 0; index < res.length; index++) {
            //was using a for key in res[index] loop nested in this loop but the print out was too sloppy
            if (check !== 0) { //if not check param display all
                console.log(res[index].department_name, res[index].product_name, res[index].price, res[index].quantity);
            } else {
                if (res[index].quantity < 5) { // if check param passed display low
                    console.log("This product is running low");
                    console.log(res[index].item_id, res[index].department_name, res[index].product_name, res[index].price, res[index].quantity);
                }
            }
        } // ends var index for loop
        if (check2 !== 1) { // if a check2 param passed don't reset instead call next function in the switch on ln74
            managerHome(); //start the whole process over
        }
    }); // ends mysql call
}
var idToUpdate; //the only 2 global vars needed, since the accessPW and PWattAllowed were just for fun
var amount = 0;

function updateStock(name) {
    idToUpdate = name.selection;
    connection.query("SELECT * FROM products WHERE item_id=?", [idToUpdate], function(err, res) {
        if (err) throw err;
        amount = res[0].quantity;
    }); //ends mysql query
    ask.prompt([{
        message: "How many would you like to add?",
        type: "input",
        name: "amount"
    }]).then(function(name) {
        connection.query("UPDATE products SET quantity= " + (amount + parseInt(name.amount)) + " WHERE item_id= " + idToUpdate, function(err, res) {
            if (err) throw err;
            console.log("We've updated the inventory, thanks for being on top of it");
            managerHome();
        });
    });
}