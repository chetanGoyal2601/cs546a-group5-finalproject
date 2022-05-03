const universityRoutes =  require('./universityList')

const constructorMethod = (app) => {
  app.use('/', universityRoutes);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
