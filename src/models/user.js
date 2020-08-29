const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		minlength: 5,
	},
	email: {
		type: String,
		unique: true,
		required: true,
		lowercase: true,
		trim: true,
		validator(value) {
			if (!validator.isEmail(value)) {
				throw new Error("Email is invalid");
			}
		},
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 5,
	},
	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
});

//user methods; finding by credentials
userSchema.statics.findByCredentials = async (username, password) => {
	const user = await User.findOne({ username: username });
	if (!user) {
		throw new Error("Unable to log in!");
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error("Unable to log in!");
	}

	return user;
};

//generating auth tokens
userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, "secret");

	user.tokens = user.tokens.concat({ token: token });
	await user.save();

	return token;
};

//harsh password before saving
userSchema.pre("save", async function (next) {
	const user = this;

	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 8);
	}

	next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
