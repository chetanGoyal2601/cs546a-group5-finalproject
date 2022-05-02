const universityFinderRoutes = require('./universityFinder');
const constructorMethod = (app) => {
  app.use('/', universityFinderRoutes);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
