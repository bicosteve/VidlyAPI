const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const User = require("../models/user");
const auth = require("../middleware/auth");
const { welcomeMail, unsubscribeMail } = require("../mail/mail");

const router = express.Router();

//multer config
const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, cb) {
		if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(undefined, true);
		}

		return cb(new Error("File type must be jpg,jpeg or png"));
	},
});

router.post("/", async (req, res) => {
	const user = new User(req.body);

	try {
		await user.save();
		welcomeMail(user.email, user.username);
		const token = await user.generateAuthToken();
		res.status(201).send({ user: user, token: token });
	} catch (error) {
		res.status(500).send(error);
	}
});

router.post("/login", async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.username, req.body.password);
		const token = await user.generateAuthToken();
		res.status(200).send({ user, token });
	} catch (error) {
		res.status(400).send(error);
	}
});

router.post("/logout", auth, async (req, res) => {
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

router.post("/logoutAll", auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send("Logged out!");
	} catch (e) {
		res.status(500).send(e);
	}
});

router.get("/", auth, async (req, res) => {
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

router.get("/me", auth, async (req, res) => {
	res.send(req.user);
});

router.post(
	"/me/profile",
	auth,
	upload.single("avatar"),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({ width: 150, height: 150 })
			.png()
			.toBuffer();
		req.user.avatar = buffer;
		await req.user.save();
		res.status(200).send({ message: "Image uploaded!" });
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	}
);

router.delete("/me/profile", auth, async (req, res) => {
	req.user.avatar = undefined;
	await req.user.save();
	res.status(200).send({ msg: "Image deleted!" });
});

router.get("/:id", auth, async (req, res) => {
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

router.patch("/:id", auth, async (req, res) => {
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

router.delete("/me", auth, async (req, res) => {
	try {
		await req.user.remove();
		unsubscribeMail(req.user.email, req.user.username);
		res.status(200).send("Deleted successfully!");
	} catch (error) {
		res.status(500).send(error);
	}
});

module.exports = router;
