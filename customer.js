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
        console.log("Welcome to Bamazon");
        homeScreen();
    }
});

function homeScreen() {
    ask.prompt([{
        message: "What would you like to do?",
        type: "list",
        choices: ["see all", "see all in a department"],
        name: "choice"
    }]).then(function(name) {
        if (name.choice === "see all") {
            listAll();
        } else {
            ask.prompt([{
                message: "Choose a department",
                type: "list",
                choices: ["musical instruments", "computers", "video games"],
                name: "selection"
            }]).then(function(name) {
                narrowSearch(name);
            });
        }
    });
}
//both narrowSearch and listAll funnel into selectId()
function narrowSearch(department) {
    connection.query("SELECT * FROM products WHERE department_name=? ", [department.selection], function(err, res) {
        if (err) throw err;
        for (var index = 0; index < res.length; index++) {
            //was using a for key in res[index] loop nested in this loop but the print out was too sloppy
            console.log("ID number =", res[index].item_id, res[index].department_name, res[index].product_name, res[index].price, res[index].quantity);
        } // ends var index for loop
        selectId(); // putting this here seems to work in a .then fashion which connection.query doesnt seem to support
    }); // ends mysql call
}

function listAll() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var index = 0; index < res.length; index++) {
            //was using a for key in res[index] loop nested in this loop but the print out was too sloppy
            console.log("ID number =", res[index].item_id, res[index].department_name, res[index].product_name, res[index].price, res[index].quantity);
        } // ends var index for loop
        selectId(); // putting this here seems to work in a .then fashion which connection.query doesnt seem to support
    }); // ends mysql call
}

function selectId() {
    ask.prompt([{
        message: "Enter the id number of the item you are interested in",
        type: "input",
        name: "id"
    }]).then(function(name) {
        displayItemById(name);
    });
}
var cost = 0;
var amount = 0;
var idToUpdate;
var updateAmount = 0; //might not need this, (later...) don't

function displayItemById(selected) {
    connection.query("SELECT * FROM products WHERE item_id=?", [selected.id], function(err, res) {
        if (err) throw err;
        console.log(res[0].product_name, res[0].price, res[0].quantity);
        cost = res[0].price;
        amount = res[0].quantity;
        idToUpdate = selected.id;
        makePurchase();
    }); //ends mysql query
} //ends getSingleItem function

function makePurchase() {
    ask.prompt([{
        message: "How many would you like to purchase at " + cost + " ?",
        type: "input",
        name: "amount"
    }]).then(function(name) {
        if (name.amount > amount) {
            console.log("I'm sorry, we don't have enough in stock right now");
            ask.prompt([{
                message: "Would you like to purchase " + amount + " ?",
                type: "list",
                choices: ["yes", "no"],
                name: "answer"
            }]).then(function(name) {
                if (name.answer === "no") {
                    homeScreen();
                } else {
                    console.log("Your total is " + amount * cost);
                    console.log("Thank you for you're purchase, please come back soon!");
                    updateInventory(0);
                }
            });
        } else {
            console.log("total is " + name.amount * cost);
            console.log("Thank you for you're purchase, please come back soon!");
            updateInventory(amount - name.amount);
        }
    });
}

function updateInventory(amountToUpdate) {
    connection.query("UPDATE products SET quantity= " + amountToUpdate + " WHERE item_id= " + idToUpdate, function(err, res) {
        if (err) throw err;
        console.log("We've updated our inventory, thanks again for the purchase");
        homeScreen();
    });
}