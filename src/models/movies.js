const mongoose = require("mongoose");
const validator = require("validator");

const Movie = new mongoose.model("Movie", {
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
});

module.exports = Movie;
