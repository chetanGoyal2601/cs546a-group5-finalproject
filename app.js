const express = require("express");
const app = express();
const session = require("express-session");
const configRoutes = require("./routes");
const static = express.static(__dirname + "/public");
// const dbConnection = require('./config/mongoConnection');

// async function main() {
//   const db = await dbConnection.connectToDb();
// }

// main();

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
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

app.use('/profile', (req, res, next) => {
  //console.log(req.session.id);
  if (!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
});

app.use('/update_profile', (req, res, next) => {
  console.log(req.session.user);
  if (!req.session.user) {
    return res.redirect('/');
  } else {
    next();
  }
});

app.use('/signup', (req, res, next) => {
 // console.log(req.session.id);
  if (req.session.user) {
    return res.redirect('/profile');
  } else {
    next();
  }
});

app.use('/login', (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/profile');
  } else { 
    next();
  }
});

// app.get('/logout',(req,res)=>
// {
// req.session.destroy((err)=>{
//   if(err) throw err;
//   res.redirect("/")
// })
// })

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
