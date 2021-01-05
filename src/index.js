const express = require("express");
require("dotenv").config();

const DB = require("./db/mongoose");

const app = express();
const port = process.env.PORT || 4000;

DB();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/movies", require("./routers/movies"));
app.use("/users", require("./routers/users"));

app.listen(port, () => {
	console.log(`Server running in ${port}...`);
});
