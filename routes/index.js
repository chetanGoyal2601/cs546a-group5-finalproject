const profileRoutes = require("./profile");
// const universityRoutes = require("./university");
// const postsRoutes = require("./posts");
// const commentsRoutes = require("./comments");

const constructorMethod = (app) => {
     app.use("/", profileRoutes);
    //  app.use("/login", profileRoutes);
    //  app.use("/signup", profileRoutes);
    //  app.use("/profile", profileRoutes);
    //  app.use("/update_profile", profileRoutes);


  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
