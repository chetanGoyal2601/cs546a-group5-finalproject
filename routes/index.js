const postRoutes = require("./posts");
const individualUniversityRoutes = require("./individualUniversity");

const constructorMethod = (app) => {
  app.use("/", postRoutes);
  app.use("/", individualUniversityRoutes);

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Page Not found" });
  });
};

module.exports = constructorMethod;
