const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const Movie = require("../models/movies");
const auth = require("../middleware/auth");
const { movieCreationMail, movieDeletionMail } = require("../mail/mail");

const router = express.Router();

//multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, ".uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(undefined, true);
  }
  return cb(undefined, false);
};

const upload = multer({
  destination: storage,
  limits: {
    fileSize: 1000000,
  },
  fileFilter: fileFilter,
});

router.post("/", auth, upload.single("image"), async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();

  const movie = new Movie({
    ...req.body,
    image: buffer,
    user: req.user._id,
  });

  try {
    await movie.save();
    movieCreationMail(req.user.email, req.body.name.bold());
    res.status(201).send({ msg: "Movie saved!" });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/", async (req, res) => {
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

router.get("/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Movie.findById(_id);
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch("/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ["name", "actor", "genre", "image"];
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

router.delete("/:id", auth, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).send();
    }
    movieDeletionMail(req.user.email, movie.name);
    res.status(200).send(movie);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
