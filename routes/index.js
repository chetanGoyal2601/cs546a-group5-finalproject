const commentsRoutes = require("./comments");
const universityFinderRoutes = require("./universityFinder");
const express = require("express");
const router = express.Router();

const constructorMethod = (app) => {
  app.get("/", async (req, res) => {
    res.render("pages/intro", { userAuth: true });
  });
  app.use("/", universityFinderRoutes);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });

  app.use("/comments", commentsRoutes);
};

module.exports = constructorMethod;
