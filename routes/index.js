const profileRoutes = require("./profile");
const universityFinderRoutes = require("./universityFinder");
const postRoutes = require("./posts");
const express = require("express");
const path = require("path");

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

  //for accessing unknown routes
  app.use("*", (request, response) => {
    response.status(404).sendFile(path.resolve("static/page-not-found.html"));
  });

  //for invalid URL
  app.use(function (error, request, response, next) {
    response.status(404).sendFile(path.resolve("static/page-not-found.html"));
  });
};

module.exports = constructorMethod;
