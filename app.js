const express = require("express");
const app = express();
const session = require("express-session");
const configRoutes = require("./routes");
const static = express.static(__dirname + "/public");

const exphbs = require("express-handlebars");
app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(
  session({
    name: "AuthCookie",
    secret: "This is a secret of Group-5",
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: 60000 },
  })
);

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});