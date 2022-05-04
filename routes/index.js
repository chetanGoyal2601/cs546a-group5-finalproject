const commentsRoutes = require("./comments");
const profileRoutes = require("./profile");
const universityFinderRoutes = require("./universityFinder");
const express = require("express");
const router = express.Router();

const constructorMethod = (app) => {
  app.get("/", async (req, res) => {
    res.render("pages/intro", { userAuth: false });
  });

  app.use("/", universityFinderRoutes);

  app.use("/", profileRoutes);

  app.use("/comments", commentsRoutes);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;

///ajsjdans
