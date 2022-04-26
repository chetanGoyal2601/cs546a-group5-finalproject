const commentsRoutes = require("./comments");
const express = require("express");
const router = express.Router();

const constructorMethod = (app) => {
  app.get("/", async (req, res) => {
    //if (req.session.user) {
    res.render("pages/intro");
    // } else {
    //   res.render("posts/login");
    // }
  });

  app.use("/comments", commentsRoutes);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
