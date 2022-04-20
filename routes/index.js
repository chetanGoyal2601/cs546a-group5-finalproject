// const profileRoutes = require("./profile");
// const universityRoutes = require("./university");
// const postsRoutes = require("./posts");
// const commentsRoutes = require("./comments");

const constructorMethod = (app) => {
  //   app.use("/", userRoutes);
  //   app.use("/private", privateRoutes);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
