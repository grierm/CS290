var express = require("express");

// Need this for checking posts
var bodyParser = require("body-parser");
var app = express();
var handlebars = require("express-handlebars").create({defaultLayout: "main"});
var port = 5882

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.set("port", port);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// This gets the request information and puts it in a table
app.get("/", function(req, res){
	var qParams = [];
	for (var p in req.query) {
        // Puts the parameter name and value in a table
		qParams.push({"name": p, "value": req.query[p]});
	}
	var context = {};
    context.dataList = qParams;
    // Renders table to the page
	res.render("get", context);
});

// Code for post request
app.post("/", function(req, res){
	var qParams = [];
	for (var p in req.query){
        // Puts the parameter name and value in a table
		qParams.push({"name": p, "value": req.query[p]});
	}
    var bParams = [];
	for (var b in req.body) 
    {
		bParams.push({"name": b, "value": req.body[b]});
	}
	var fill = {};
	fill.queryList = qParams;
    fill.bodyList = bParams;
    // Renders table to the page
	res.render("post", fill);
});

// Used to check 404 error
app.use(function(req, res){
	res.status(404);
	res.render("404");
});

// Used to check for 500 error
app.use(function(err, req, res, next){
	console.log(err.stack);
	res.status(500);
	res.render("500");
});

// Logs which port we are running on
app.listen(app.get("port"), function(){
	console.log("Express started on port " + port);
});

/*
  }
  "author": "Max Grier",
  "license": "ISC",
  "dependencies": {
    "body-parser": "^1.16.1",
    "express": "^4.14.1",
    "express-handlebars": "^3.0.0",
    "express-session": "^1.11.3",
    "forever": "^2.0.0",
    "mysql": "^2.8.0"
  }
  */