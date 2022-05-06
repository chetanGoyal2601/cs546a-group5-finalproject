const commentsRoutes = require("./comments");
const profileRoutes = require("./profile");
const universityRoutes = require("./universityList");
const universityFinderRoutes = require("./universityFinder");
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

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
