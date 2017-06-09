// Dependencies:
// Express 
var express = require("express");
// Snatches HTML from URLs
var request = require("request");
// Scrapes our HTML
var cheerio = require("cheerio");
// MongoDB
var mongoose = require("mongoose");
// Body Parser
var bodyParser = require("body-parser");

// Requring Models
var Article = require("./models/Article.js");
var Note = require("./models/Note.js");

// Set mongoose to leverage built in JS ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use body parser in the app
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with Mongoose 
mongoose.connect("mongodb://localhost/techscraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error:", error);
});

// Once logged into mongodb through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
            "Grabbing article titles and bodies\n" +
            "from techcrunch frontpage" +
            "\n***********************************\n");

////////////////
//// ROUTES ////
////////////////

// A GET request to scrape the site
app.get("/scrape", function(req, res){
  // First, grab the body of the html with Request
  request("https://www.techcrunch.com/", function(error, response, html) {
    // Then, load html into Cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    // With Cheerio, find each class and tag to store
    $("li.river-block").each(function(i, element) {
      // Save relevant data-attr per element (this)
      var link = $(this).attr("data-permalink");
      var title = $(this).attr("data-sharetitle");
      var id = $(this).attr("id");
      var tag = $(this).find("a.tag").find("span").text();
      var excerpt = $(this).find("p.excerpt").text();
      var time = $(this).find("time").attr("datetime");

      // Empty result object
      var result = {};
      // Add the desired elements and save them as prperties of the result object
      result = {
        id: id,
        link: link,
        title: title,
        tag: tag,
        excerpt: excerpt,
        time: time
      }
      // Using model, create a new entry
      var entry = new Article(result);

      entry.save(function(err,doc) {
        if (err) { console.log(err); }
        else {
          console.log(doc);
        }
      });

    });
  }); 
  // Tell the browser that the scraping is complete
  res.send("scrape complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/all", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) { console.log(error); }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by its ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in db.
  Article.findOne({ "id": req.params.id })
  // And then populate all of the notes associated with it
  .populate("note")
  // Now, execute the query
  .exec(function(error, doc) {
    // Log any errors
    if (error) { console.log(error); }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);
  // And save the new note in the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) { console.log(error); }
    // Otherwise
    else {
      res.json(doc);
      // Use the article id to find and update its note
      Article.findOneAndUpdate({ "id": req.params.id }, {"note": doc._id})
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) { console.log(err); }
        else {
          // Otherwise, console log it to the node console
          console.log(doc);
          //// Otherwise, send the document to the browser
          //res.json(doc);
        }
      });
    }
  });
});

//// Making a request call for techcrunch home. The page's HTML is saved as the callback's third argument
// request("https://www.techcrunch.com/", function(error, response, html) {

//   // Load the HTML into cheerio and save it to a variable
//   // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
//   var $ = cheerio.load(html);
//   // An empty array to save the data that we'll scrape
//   var result = [];
//   // With cheerio, find each p-tag with the "title" class
//   // (i: iterator. element: the current element)

//   $("li.river-block").each(function(i, element) {

//     // Save the text of the element (this) in a "title" variable
//     var link = $(this).attr("data-permalink");

//     // In the currently selected element, look at its child elements (i.e., its a-tags),
//     // then save the values for any "href" attributes that the child elements may have
//     //var link = $(element).children().attr("href");

//     // Save these results in an object that we'll push into the result array we defined earlier
//     result.push({
//       link: link
//     });

//   });

//   // Log the result once cheerio analyzes each of its selected elements
//   console.log(result);
// });

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});

