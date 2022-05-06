const express = require("express");
const app = express();
const static = express.static(__dirname + "/public");
const configRoutes = require("./routes");
const exphbs = require("express-handlebars");

const hbs = exphbs.create({
  defaultLayout: "main",

  // create custom helper
  helpers: {
    listChecker: function (elementList, v, options) {
      for (const e of elementList) {
        if (e.toString() === v) {
          return options.fn(this);
        }
      }
      return options.inverse(this);
    },
    userChecker: function (v1, v2, options) {
      //console.log(v1);
      //console.log(v2);
      if (v1 === v2) {
        return options.fn(this);
      }
    },
  },
});

app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
