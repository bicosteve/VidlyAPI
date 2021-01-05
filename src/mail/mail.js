const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function welcomeMail(email, username) {
	await sgMail.send({
		to: email,
		from: "oloobico@gmail.com",
		subject: "Welcome To Vidly App",
		text: `We are happy to see you ${username}.  Thank you for subscribing`,
	});
}

async function unsubscribeMail(email, username) {
	await sgMail.send({
		to: email,
		from: "oloobico@gmail.com",
		subject: "Sorry to See You Leave",
		text: `We are sorry to see you go ${username}. Is there anyway we can change your mind?`,
	});
}

async function movieCreationMail(email, name) {
	await sgMail.send({
		to: email,
		from: "oloobico@gmail.com",
		subject: "Creation Successful",
		text: `You have created a collection ${name}.  Thank you for sharing!`,
	});
}

async function movieDeletionMail(email, name) {
	await sgMail.send({
		to: email,
		from: "oloobico@gmail.com",
		subject: "Movie deleted successfully!",
		text: `You have removed ${name}!`,
	});
}

module.exports = {
	welcomeMail,
	unsubscribeMail,
	movieCreationMail,
	movieDeletionMail,
};
