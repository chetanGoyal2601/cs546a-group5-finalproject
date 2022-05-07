const profileRoutes = require("./profile");
const universityFinderRoutes = require("./universityFinder");
const postRoutes = require("./posts");
const express = require("express");
const router = express.Router();

const constructorMethod = (app) => {
  app.get("/", async (req, res) => {
    res.render("pages/intro", {
      isUserLoggedIn: req.session.user != null ? true : false,
      title: "Welcome to Educapedia",
    });
  });

  app.use("/", universityFinderRoutes);

  app.use("/", profileRoutes);

  app.use("/", postRoutes);

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Page Not found" });
  });
};

module.exports = constructorMethod;
