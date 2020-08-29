const express = require("express");

const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/users", async (req, res) => {
	const user = new User(req.body);

	try {
		await user.save();
		const token = await user.generateAuthToken();
		res.status(201).send({ user: user, token: token });
	} catch (error) {
		res.status(500).send(error);
	}
});

router.post("/users/login", async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.username, req.body.password);
		const token = await user.generateAuthToken();
		res.status(200).send({ user, token });
	} catch (error) {
		res.status(400).send(error);
	}
});

router.post("/users/logout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token;
		});

		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send(e);
	}
});

router.post("/users/logoutAll", auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send("Logged out!");
	} catch (e) {
		res.status(500).send(e);
	}
});

router.get("/users", auth, async (req, res) => {
	try {
		const users = await User.find({});

		if (!users) {
			return res.status(404).send();
		}
		res.status(200).send(users);
	} catch (error) {
		res.status(500).send();
	}
});

router.get("/users/me", auth, async (req, res) => {
	res.send(req.user);
});

router.get("/users/:id", auth, async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		if (!user) {
			return res.status(404).send();
		}
		res.status(200).send(user);
	} catch (error) {
		res.status(500).send();
	}
});

router.patch("/users/:id", auth, async (req, res) => {
	const _id = req.params.id;
	const updates = Object.keys(req.body);
	const allowed = ["username", "email", "password"];
	valid = updates.every((update) => {
		return allowed.includes(update);
	});

	if (!valid) {
		return res.status(400).send("Not allowed");
	}

	try {
		const user = await User.findById(_id);

		if (!user) {
			return res.status(404).send("Not found");
		}

		updates.forEach((update) => {
			user[update] = req.body[update];
		});

		await user.save();
		res.status(200).send(user);
	} catch (error) {
		res.status(500).send(error);
	}
});

router.delete("/users/:id", auth, async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);

		if (!user) {
			return res.status(404).send();
		}
		res.status(200).send(user);
	} catch (error) {
		res.status(500).send(error);
	}
});

module.exports = router;
