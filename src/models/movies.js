const mongoose = require("mongoose");
//const validator = require("validator");

const movieSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	year: {
		type: String,
		required: true,
		trim: true,
	},
	actor: {
		type: String,
		required: true,
	},
	genre: {
		type: String,
		default: "Action",
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	image: {
		type: Buffer,
	},
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
