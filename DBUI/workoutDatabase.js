// This is code similar to prior assignments, setting basic requirements
var express = require("express");
var app = express();
var bodyParser = require("body-parser"); 
var handlebars = require("express-handlebars").create({defaultLayout: "main"});

// I am creating the pool here rather than a seperate file
var mysql = require("mysql");
// Connect to the pool with the last four of my ONID
var pool = mysql.createPool({   
    connectionLimit : 10,
    host  : 'classmysql.engr.oregonstate.edu',
    user  : 'cs290_grierm',
    password: '5882',
    database: 'cs290_grierm'
});

// Set to the same port (last 4 of my OSUID)
var port = 5882

// More of the basic set up to establish connections
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.set("port", port);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set the folder for static files - mentioned in Greg's video
app.use(express.static("public"));

// This function will reset the table when we enter this URL
// Based off code given in a prior lesson
app.get('/resetTable',function(req,res,next){
    var context = {};
    pool.query("DROP TABLE IF EXISTS workouts", function(err){
        var createString = "CREATE TABLE workouts("+
        "id INT PRIMARY KEY AUTO_INCREMENT,"+
        "name VARCHAR(255) NOT NULL,"+
        "reps INT,"+
        "weight INT,"+
        "date DATE,"+
        "lbs BOOLEAN)";
        pool.query(createString, function(err){
            res.render('home', context);
        })
    });
});

// This will select all items from the workouts table
app.get('/', function(req, res, next){
    var context = {};
    pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
        next(err);
        return;
    }

    // Remember each parameter as we go through the rows
    var parameters = [];

    // Iterate through all of the rows 
    for(var row in rows){
        var itemToAdd = {'name': rows[row].name, 
                    'reps': rows[row].reps, 
                    'weight': rows[row].weight, 
                    'date':rows[row].date, 
                    'id':rows[row].id};
        // Either uses pounds or kilograms if pounds is not checked
        if(rows[row].lbs){
            itemToAdd.lbs = "lbs";
        }else{
            itemToAdd.lbs = "kg";
        }
        // Then push to add the parameters 
        parameters.push(itemToAdd);
    }
    context.results = parameters;

    // Now we render the table to display it
    res.render('home', context);
    })
});


//This is the insert function
app.get('/insert',function(req,res,next){
  var context = {};
  // Make sure to use ? to avoid potential SQL injection attacks (based on prior lecture)
   pool.query("INSERT INTO `workouts` (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)",
   // All of the required fields for our database 
   [req.query.exercise,
    req.query.reps, 
    req.query.weight, 
    req.query.date, 
    req.query.unitCheck], 
    function(err, result){
        if(err){
          next(err);
          return;
        }         
        context.inserted = result.insertId;
        res.send(JSON.stringify(context));
  });
});

// This will delete the workout databse
app.get('/delete', function(req, res, next) {
    var context = {};    
    // Needs an id for the delete
    pool.query("DELETE FROM `workouts` WHERE id = ?",
        [req.query.id], 
        function(err, result) {
            if(err){
                next(err);
                return;
            }
    });
});

// Update workout table function
app.get('/updateTable',function(req, res, next){
    var context = {};
    // Selects the ids we would like to update
    pool.query('SELECT * FROM `workouts` WHERE id=?',
        [req.query.id], 
        function(err, rows, fields){
            if(err){
                next(err);
                return;
            }
            // Holds the paramaters we want to keep track of
            var parameters = [];

            for(var row in rows){
                // Adds the items
                var addItem = {'name': rows[row].name, 
                            'reps': rows[row].reps, 
                            'weight': rows[row].weight, 
                            'date':rows[row].date, 
                            'lbs':rows[row].lbs,
                            'id':rows[row].id,};
                // Pushes those items
                parameters.push(addItem);
            }
        // Uses the update table page to update it
        context.results = parameters[0];
        res.render('updateTable', context);
    });
});

// Update exercise function
app.get('/updateExercise', function(req, res, next){
    var context = {};
    // Needs the ids and uses the ? for security
    pool.query("SELECT * FROM `workouts` WHERE id=?",
        [req.query.id], 
        function(err, result){
            // Check if there is an error
            if(err){
                next(err);
                return;
            }
            if(result.length == 1){                
                var current = result[0];
                // If the check box is checked set it to 1 for yes
                // Otherwise set it to 0 for no
                if(req.query.unitCheck === "on"){
                    req.query.unitCheck = "1";
                }else{
                    req.query.unitCheck = "0";
                }
                // This query will update based on what is already there or what it will be updated to
                // This makes it so we don't override values
                pool.query('UPDATE `workouts` SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?',
                [req.query.exercise || current.name, 
                req.query.reps || current.reps, 
                req.query.weight || current.weight, 
                req.query.date || current.date, 
                req.query.unitCheck, 
                req.query.id],
                // Checking for errors
                function(err, result){
                    if(err){
                        next(err);
                        return;
                    }
                    // Select everything from workouts
                    pool.query('SELECT * FROM `workouts`', function(err, rows, fields){     
                        // Check for errors
                        if(err){
                            next(err);
                            return;
                        }
                        var parameters = [];
                        // Same idea as when we add to the table
                        // Go through each row to get the elements
                        for(var row in rows){
                            var addItem = {'name': rows[row].name,
                            'reps': rows[row].reps,
                            'weight': rows[row].weight, 
                            'date':rows[row].date, 
                            'id':rows[row].id};
                            

                            // Use pounds if checked, otherwise use kilograms
                            if(rows[row].lbs){
                                addItem.lbs = "lbs";
                            }else{
                                addItem.lbs = "kg";
                            }
                            // Pushes the items to be displayed
                            parameters.push(addItem);
                        }
                        // Renders and displays the data
                        context.results = parameters;
                        res.render('home', context);
                    });
                });
            }
    });
});

// 404 error handling
app.use(function(req, res){
	res.status(404);
	res.render("404");
});
// Server error handling
app.use(function(err, req, res, next){
    // Log the error
	console.log(err.stack);
	res.status(500);
	res.render("500");
});

// States which port is being used
app.listen(app.get("port"), function(){
	console.log("Express started on port" + port + 'press control c to quit');
});