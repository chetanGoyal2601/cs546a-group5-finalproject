const commentsRoutes = require("./comments");
const profileRoutes = require("./profile");
const universityRoutes = require("./universityList");
const universityFinderRoutes = require("./universityFinder");
const postRoutes = require("./posts");
const individualUniversityRoutes = require("./individualUniversity");
const express = require("express");
const router = express.Router();

const constructorMethod = (app) => {
  app.get("/", async (req, res) => {
    res.render("pages/intro", {
      userAuth: false,
      title: "Welcome to Educapedia",
    });
  });

  app.use("/", universityFinderRoutes);

  app.use("/", profileRoutes);

  app.use("/comments", commentsRoutes);

  app.use("/", universityRoutes);

  app.use("/", postRoutes);
  app.use("/", individualUniversityRoutes);

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Page Not found" });
  });
}

module.exports = constructorMethod;
