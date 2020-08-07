const express = require("express");

require("./db/mongoose");
const Movie = require("./models/movies");

const app = express();

const port = process.env.PORT || 4000;

app.use(express.json());

app.post("/movies", async (req, res) => {
	const movie = new Movie(req.body);

	try {
		await movie.save();
		res.status(201).send(movie);
	} catch (error) {
		res.status(500).send(error);
	}
});

app.get("/movies", async (req, res) => {
	try {
		const movies = await Movie.find({});
		if (!movies) {
			return res.status(404).send();
		}
		res.status(200).send(movies);
	} catch (error) {
		res.status(500).send(error);
	}
});

app.get("/movies/:id", async (req, res) => {
	const _id = req.params.id;

	try {
		task = await Movie.findById(_id);
		if (!task) {
			return res.status(404).send();
		}
		res.status(200).send(task);
	} catch (error) {
		res.status(500).send(error);
	}
});

app.patch("/movies/:id", async (req, res) => {
	const updates = Object.keys(req.body);
	const allowed = ["name", "actor", "genre"];
	const validOps = updates.every((update) => {
		return allowed.includes(update);
	});

	if (!validOps) {
		return res.status(400).send("Unauthorized!");
	}

	try {
		const movie = await Movie.findById(req.params.id);

		if (!movie) {
			return res.status(404).send("Not found!");
		}

		updates.forEach((update) => {
			movie[update] = req.body[update];
		});
		await movie.save();

		res.status(200).send(movie);
	} catch (error) {
		res.status(500).send(error);
	}
});

app.delete("/movies/:id", async (req, res) => {
	try {
		const movie = await Movie.findByIdAndDelete(req.params.id);

		if (!movie) {
			return res.status(404).send();
		}
		res.status(200).send(movie);
	} catch (error) {
		res.status(500).send(error);
	}
});

app.listen(port, () => {
	console.log(`Server running in ${port}...`);
});
