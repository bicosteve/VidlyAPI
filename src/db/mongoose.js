const mongoose = require("mongoose");
require("dotenv").config();

const DB = async () => {
	try {
		await mongoose.connect(process.env.DB_URL, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
		});
		console.log("Db connected ...");
	} catch (error) {
		console.log(error.message);
	}
};

module.exports = DB;
