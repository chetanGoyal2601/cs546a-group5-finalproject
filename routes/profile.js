let express = require("express");
let xss = require("xss");
let router = express.Router();
let data = require("../data");
let bcrypt = require("bcryptjs");
let profileFetch = data.profile;
var passwordValidator = require("password-validator");
var schema = new passwordValidator();

schema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(20) // Maximum length 20
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(2) // Must have at least 2 digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123"]); // Blacklist these values

// Get signup page
router.get("/signup", function (req, res, next) {
  try {
    if (checkLog(req)) {
      res.redirect("/");
    } else {
      res.render("profile/signup", {
        title: "SignUp",
        isUserLoggedIn: req.session.user ? true : false,
      });
    }
  } catch (e) {
    res.status(e.code || 500).render("profile/signup", {
      title: "SignUp",
      error: e.message || "Internal server error occured while signing up",
      isUserLoggedIn: req.session.user ? true : false,
    });
  }
});

router.post("/signup", async function (req, res) {
  let name = xss(req.body.name);
  let password = xss(req.body.password);
  let confirm_password = xss(req.body.confirm);
  let workex = Number(xss(req.body.work));
  let email = xss(req.body.email);
  let aspUni = xss(req.body.uni);

  try {
    if (!name) {
      throw { code: 400, message: "Name must be present" };
    } else if (name.length < 5 || name.length > 100) {
      throw {
        code: 400,
        message: "Enter a Name with more than 4 and less than 100 characters",
      };
    }
    if (!password) {
      throw { code: 400, message: "You must provide a password" };
    }
    if (schema.validate(password) == false) {
      throw {
        code: 400,
        message:
          "Please Enter Valid Password: Password Should be Minumum of length 8, Must have uppercase letters,Must have lowercase letters,Must have at least 2 digits,Should not have spaces",
      };
    }
    if (!email) {
      throw { code: 400, message: "You must provide a email post" };
    }
    if (!validateEmail(email)) {
      throw { code: 400, message: "Enter email only with valid characters" };
    }
    email = email.toLowerCase();
    if (workex !== 0) {
      if (!workex || workex == null || workex == undefined) {
        throw {
          code: 400,
          message: "Please enter 0 if you dont have work experience",
        };
      }
    }
    if (typeof workex === "string") {
      throw { code: 400, message: "workex should be a number" };
    }
    if (workex < 0 || workex > 100) {
      throw {
        code: 400,
        message: "Please enter 0 if you dont have work experience",
      };
    }

    let usercheck = await profileFetch.checkUser(email, password);
    if (usercheck) {
      throw { code: 400, message: "User already exists" };
    }
    console.log("Hello1");
    await profileFetch.createUser(name, email, aspUni, workex, password);
    console.log("Hello1");
    return res.redirect("/login?msg=Congratulations, you are user now");
  } catch (e) {
    res.status(e.code || 500).render("profile/signup", {
      title: "SignUp",
      error: e.message || "Internal server error occured while signing up",
      isUserLoggedIn: req.session.user ? true : false,
    });
  }
});

// Get login page
router.get("/login", function (req, res) {
  try {
    if (req.session.user) {
      res.redirect("/posts");
    } else {
      res.render("profile/login", {
        title: "Login",
        msg: req.query.msg,
        isUserLoggedIn: req.session.user ? true : false,
      });
    }
  } catch (e) {
    res.status(e.code || 500).render("profile/login", {
      title: "Login",
      error: e.message || "Internal server error occured while getting posts",
      isUserLoggedIn: req.session.user ? true : false,
    });
  }
});

router.post("/login", async function (req, res) {
  let email = xss(req.body.email.toLowerCase().trim());
  let password = xss(req.body.password);

  try {
    if (!email) {
      throw { code: 400, message: "Email must be present" };
    }
    if (
      !email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      throw { code: 400, message: "Enter a Email only with valid characters" };
    }
    if (!password) {
      throw { code: 400, message: "You must provide a password" };
    }
    if (!schema.validate(password)) {
      throw { code: 400, message: "Enter password only with valid characters" };
    }
    let user = await checkvalid(req);
    if (user) {
      req.session.user = user._id;
      //return res.redirect('/profile');
      return res.send({ status: true, error: null });
    } else {
      throw { code: 400, message: "Invalid username/password" };
    }
  } catch (e) {
    res
      .status(e.code || 500)
      .json({ ErrorMessage: e.message || "Error Ocurred while logging!" });
  }
});

router.get("/profile", async function (req, res) {
  try {
    if (req.session.user) {
      let getuser = await profileFetch.getUserById(req.session.user);

      let uniArr = getuser.favouriteUniversities;

      if (uniArr.length == 0) {
        uniArr = null;
      }
      res.render("profile/userProfile", {
        title: "Profile",
        uniArr: uniArr,
        user: getuser,
        isUserLoggedIn: req.session.user ? true : false,
      });
    } else {
      res.redirect("/");
    }
  } catch (e) {
    res.status(e.code || 500).render("profile/userProfile", {
      title: "Profile",
      error: e.message || "Internal server error occured while getting posts",
      isUserLoggedIn: req.session.user ? true : false,
    });
  }
});

router.get("/update_profile", async function (req, res) {
  try {
    if (req.session.user) {
      let getuser = await profileFetch.getUserById(req.session.user);
      res.render("profile/updateProfile", {
        title: "Update Profile",
        user: getuser,
        isUserLoggedIn: req.session.user ? true : false,
      });
    } else {
      res.redirect("/login?msg=Please sign in to update your profile");
    }
  } catch (e) {
    res.status(e.code || 500).render("profile/updateProfile", {
      title: "Update Profile",
      error: e.message || "Internal server error occured while getting posts",
      isUserLoggedIn: req.session.user ? true : false,
    });
  }
});

router.post("/update_profile", async function (req, res) {
  let name = xss(req.body.name);
  let email = xss(req.body.email);
  let aspiringUniversity = xss(req.body.uni);
  let workEx = Number(xss(req.body.work));
  //console.log("Hello");

  try {
    if (!name) {
      throw { code: 400, message: "Name must be present" };
    }

    if (name.trim().length < 5 || name.trim().length > 100) {
      throw {
        code: 400,
        message: "Name with more than 4 and less than 100 characters",
      };
    }
    if (!aspiringUniversity) {
      throw { code: 400, message: "Aspiring University must be present" };
    }

    if (!email) {
      throw { code: 400, message: "You must provide a email post" };
    }

    if (!validateEmail(email)) {
      throw { code: 400, message: "Enter email only with valid characters" };
    }
    if (workEx !== 0) {
      if (!workEx || workEx == null || workEx == undefined) {
        throw {
          code: 400,
          message: "Please enter 0 if you dont have work experience",
        };
      }
    }
    if (typeof workEx == "string") {
      throw { code: 400, message: "Work Experience should be a number" };
    }
    if (workEx < 0 || workEx > 100) {
      throw {
        code: 400,
        message: "Please enter 0 if you dont have work experience",
      };
    }
    let update = { name, email, aspiringUniversity, workEx };
    //console.log(update);

    if (req.session.user) {
      let updateuser = await profileFetch.updateUser(req.session.user, update);

      if (updateuser) {
        return res.redirect("/profile");
      }
    }
  } catch (e) {
    errorMessage = e.message;
    let getuser = await profileFetch.getUserById(req.session.user);

    res.render("profile/updateProfile", {
      title: "Error",
      error: errorMessage,
      user: getuser,
      isUserLoggedIn: req.session.user != null ? true : false,
    });
  }
});

router.get("/update_password", async function (req, res) {
  try {
    if (req.session.user) {
      let getuser = await profileFetch.getUserById(req.session.user);
      res.render("profile/change_password", {
        title: "Update Profile",
        user: getuser,
        isUserLoggedIn: req.session.user != null ? true : false,
      });
    } else {
      res.redirect("/login?msg=Please sign in to update your profile");
    }
  } catch (e) {
    res.status(e.code || 500).json({
      ErrorMessage: e.message || "Error Ocurred while updating password!",
    });
  }
});

router.post("/update_password", async function (req, res) {
  let getuser = await profileFetch.getUserById(req.session.user);
  //console.log(getuser);
  let email = getuser.email;
  let Curr_password = xss(req.body.password);
  let password = xss(req.body.new_password);
  let confirm_password = xss(req.body.confirm);

  try {
    //console.log(email, Curr_password, password, "test1111");
    if (!Curr_password) {
      throw "You must provide a Current password";
    }
    if (Curr_password === password) {
      throw "Please enter new password which is other than old password";
    }
    if (!password) {
      throw "You must provide a New password";
    }
    if (schema.validate(password) === false) {
      throw "Please Enter Valid Password: Password Should be Minumum of length 8, Must have uppercase letters,Must have lowercase letters,Must have at least 2 digits,Should not have spaces";
    }
    if (!confirm_password) {
      throw "Please enter confirm passowrd";
    }
    if (password !== confirm_password) {
      throw "Password and Confrim Password must be same";
    }
    if (!schema.validate(password)) {
      throw "Enter password only with valid characters";
    }
    //console.log(email, Curr_password, password, "test2222");
    if ((await checkpassword(email, Curr_password)) === false) {
      throw "Invalid Current Password";
    }

    if (req.session.user) {
      await profileFetch.updatePassword(req.session.user, password);
      if (password) {
        return res.redirect("/profile");
      }
    }
  } catch (e) {
    errorMessage = e.message;
    res.render("profile/change_password", {
      title: "Error",
      error: errorMessage,
      user: getuser,
      isUserLoggedIn: req.session.user ? true : false,
    });
  }
});

router.get("/logout", function (req, res) {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (e) {
    res
      .status(e.code || 500)
      .json({ ErrorMessage: e.message || "Error Ocurred while logout!" });
  }
});

function validateEmail(email) {
  try {
    if (!email) throw { code: 400, message: "You must provide a Email" };
    let regexEmail =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.toLowerCase().match(regexEmail)) {
      return true;
    }
    return false;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

// Function to check if user is validated
let checkLog = function (req) {
  try {
    if (req.session != undefined) {
      return req.session.user;
    } else {
      return false;
    }
  } catch (e) {
    throw e;
  }
};

//check password for update password
var checkpassword = async function (email, password) {
  try {
    let getuser = await profileFetch.getAllUsers();
    for (var i = 0; i < getuser.length; i++) {
      if (
        getuser[i].email == email &&
        bcrypt.compareSync(password, getuser[i].hashedPassword)
      ) {
        //console.log(email, password, "test2");
        return true;
      }
    }
    return false;
  } catch (e) {
    throw e;
  }
  //console.log(email, password, "test1");
};

//Check if username and password entered are correct
var checkvalid = async function (req) {
  try {
    let email = xss(req.body.email.toLowerCase().trim());
    let password = xss(req.body.password);
    if (!email) throw "You must provide a User Name";
    if (email == undefined) throw "User Name not defined";
    if (email == null || email.length == 0) throw "User Name cannot be null";
    if (
      !email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    )
      throw {
        code: 400,
        message: "Enter a User Name only with valid characters",
      };

    if (!password) throw { code: 400, message: "You must provide a password" };

    if (password.length < 8 || password.length > 20)
      throw {
        code: 400,
        message: "enter a password with more than 6 characters or less than 20",
      };
    if (!schema.validate(password))
      throw {
        code: 400,
        message: "Enter a valid password",
      };

    let getuser = await profileFetch.getAllUsers();
    for (var i = 0; i < getuser.length; i++) {
      if (
        getuser[i].email == email &&
        bcrypt.compareSync(password, getuser[i].hashedPassword)
      ) {
        return getuser[i];
      }
    }
    return false;
  } catch (e) {
    throw e;
  }
};

module.exports = router;
