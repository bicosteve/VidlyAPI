const express = require("express");

require("./db/mongoose");
const movieRouter = require("./routers/movies");
const userRouter = require("./routers/users");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(movieRouter);
app.use(userRouter);

app.listen(port, () => {
	console.log(`Server running in ${port}...`);
});
