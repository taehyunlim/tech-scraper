// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// Create the Note schema
var ArticleSchema = new Schema({
	// id
	id: {
		type: String,
		required: true,
		unique: true
	},
	// Just a string
  	title: {
  		type: String,
  		required: true
	},
	// Just a string
	link: {
		type: String,
		required: true
  	},
  	// Just a string
  	tag: {
  		type: String,
  		required: true
  	},
  	// Just a string
  	excerpt: {
  		type: String
  	},
  	// Just a string
  	time: {
  		type: String,
  		required: true
  	},
  	// This only saves one note's ObjectId, ref refers to the Note model
  	note: {
  		type: Schema.Types.ObjectId,
  		ref: "Note"
  	}
});

// Remember, Mongoose will automatically save the ObjectIds of the notes
// These ids are referred to in the Article model

// Create the Note model with the NoteSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the Note model
module.exports = Article;
