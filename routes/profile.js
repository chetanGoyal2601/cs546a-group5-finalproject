const express = require("express");
const xss = require("xss");
const router = express.Router();
const data = require("../data");
const bcrypt = require("bcryptjs");
const profileFetch = data.profile;
var passwordValidator = require("password-validator");
var schema = new passwordValidator();

schema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(100) // Maximum length 100
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

function validateEmail(email) {
  const regexEmail = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;
  if (email.match(regexEmail)) {
    return true;
  } else {
    return false;
  }
}

// Function to check if user is validated
const checkLog = function (req) {
  if (req.session != undefined) {
    return !!req.session.user;
  } else {
    return false;
  }
};

//check password for update password
var checkpassword = async function (email, password) {
  const getuser = await profileFetch.getAllUsers();
  for (var i = 0; i < getuser.length; i++) {
    if (
      getuser[i].email == email &&
      bcrypt.compareSync(password, getuser[i].password)
    ) {
      return true;
    }
  }
  return false;
};

//Check if username and password entered are correct
var checkvalid = async function (req) {
  const email = xss(req.body.email.toLowerCase().trim());
  const password = xss(req.body.password);
  if (!email) throw "You must provide a User Name";
  if (email == undefined) throw "User Name not defined";
  if (email == null || email.length == 0) throw "User Name cannot be null";
  if (!email.match(/^[a-z0-9_@\.]+$/))
    throw "Enter a User Name only with valid characters";

  if (!password) throw "You must provide a password";
  if (password == null || password.length == 0) throw "Password cannot be null";
  if (password === undefined) throw "password not defined";
  if (password.length < 6 || password.length > 20)
    throw "enter a password with more than 6 characters or less than 20";
  if (!password.match(/^(?!\s*$).+/)) throw "Enter a valid password";

  const getuser = await profileFetch.getAllUsers();
  for (var i = 0; i < getuser.length; i++) {
    if (
      getuser[i].email == email &&
      bcrypt.compareSync(password, getuser[i].password)
    ) {
      return getuser[i];
    }
  }
  return false;
};

// router.get("/", async (req, res) => {
//   try {
//     //   if(req.session.user){
//     //     res.redirect('/profile');
//     //   }

//     res.render("profile/Intro", {});
//   } catch (e) {
//     res.status(400).render("profile/Intro", {});
//     return;
//   }
// });

// Get signup page
router.get("/signup", function (req, res, next) {
  if (checkLog(req)) {
    res.redirect("/");
  } else {
    res.render("profile/signup", {
      title: "SignUp",
      isUserLoggedIn: req.session.user != null ? true : false,
    });
  }
});

router.post("/signup", async function (req, res) {
    console.log(req.body)
    const name = xss(req.body.name);
    console.log(req.body)
    const password = xss(req.body.password);
    const confirm_password = xss(req.body.confirm);
    const workex = Number(xss(req.body.work));
    const email = xss(req.body.email);
    const aspUni = xss(req.body.uni);
    let errorMessage = null;
    try {
    if (!name) {
      errorMessage = "Name must be present";
    } else if (name == null) {
      errorMessage = "Name cannot be null";
    } else if (name == undefined) {
      errorMessage = "Name not defined";
    }

    // else if (name.length < 5 || name.length > 15) {
    //     errorMessage = "Enter a Name with more than 4 and less than 15 characters";
    // }

    // else if (!aspUni) {
    //     errorMessage = "aspUni must be present";
    // }
    // else if (aspUni == null) {
    //     errorMessage = "Name cannot be null";
    // }
    // else if (aspUni == undefined) {
    //     errorMessage = "Name not defined";
    // }
    else if (!password) {
      errorMessage = "You must provide a password post";
    } else if (password == null) {
      errorMessage = "password cannot be null";
    } else if (password == undefined) {
      errorMessage = "password not defined";
    } else if (schema.validate(password) == false) {
      throw "Please Enter Valid Password: Password Should be Minumum of length 8, Must have uppercase letters,Must have lowercase letters,Must have at least 2 digits,Should not have spaces";
    } else if ((password == confirm_password) == false) {
     
      errorMessage = "Password and Confrim Password must be same";
    } else if (password.length < 8 || password.length > 20) {
      errorMessage =
        "Enter a password with more than 8 and less than 20 characters";
    } else if (!password.match(/^(?!\s*$).+/)) {
      errorMessage = "Enter password only with valid characters";
    } else if (!email) {
      errorMessage = "You must provide a email post";
    } else if (email == null || email.length == 0) {
      errorMessage = "email cannot be null";
    } else if (email == undefined) {
      errorMessage = "email not defined";
    } else if (!validateEmail(email)) {
     
      errorMessage = "Enter email only with valid characters";
    } else if (!workex || workex == null || workex == undefined) {
      errorMessage = "Invalid workex parameters";
    } else if (typeof workex == "string") {
      errorMessage = "workex should be a number";
    } else if (workex < 1 || workex > 100) {
      errorMessage = "Invalid age";
    } else {
      errorMessage = null;
    }

    if (errorMessage == null) {
      const usercheck = await profileFetch.checkUser(email, password);
      if (usercheck) {
        errorMessage = "User already exists";
      }
    }

    if (errorMessage == null) {
      const adduser = await profileFetch.createUser(
        name,
        email,
        aspUni,
        workex,
        password
      );
      return res.redirect("/login?msg=Congratulations, you are user now");
    }
  } catch (e) {
    errorMessage = e;
  }
  //console.log(errorMessage);

  res.render("profile/signup", {
    title: "Error",
    error: errorMessage,
    isUserLoggedIn: req.session.user != null ? true : false,
  });
});

// Get login page
router.get("/login", function (req, res) {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("profile/login", {
      title: "Login",
      msg: req.query.msg,
      isUserLoggedIn: req.session.user != null ? true : false,
    });
  }
});

router.post("/login", async function (req, res) {
 
  const email = xss(req.body.email.toLowerCase().trim());

  const password = xss(req.body.password);
  let errorMessage = null;
  if (!email) {
    errorMessage = "Email must be present";
  } else if (email == null) {
    errorMessage = "Email cannot be null";
  } else if (email == undefined) {
    errorMessage = "Email not defined";
  } else if (!email.match(/^[a-z0-9_@\.]+$/)) {
    errorMessage = "Enter a Email only with valid characters";
  } else if (!password) {
    errorMessage = "You must provide a password";
  } else if (password == null) {
    errorMessage = "password cannot be null";
  } else if (password == undefined) {
    errorMessage = "password not defined";
  } else if (password.length < 6 || password.length > 15) {
    errorMessage =
      "Enter a password with more than 4 and less than 15 characters";
  } else if (!password.match(/^(?!\s*$).+/)) {
    errorMessage = "Enter password only with valid characters";
  } else {
    errorMessage = null;
  }
  if (errorMessage == null) {
    const user = await checkvalid(req);

    if (user) {

      req.session.user = user._id;
      //return res.redirect('/profile');
      return res.send({ status: true, error: null });
    }
    errorMessage = "Invalid username/password";
  }
  res.send({ status: false, error: errorMessage });
  //res.status(400).redirect('/login')
});

router.get("/profile", async function (req, res) {
  if (req.session.user) {
    const getuser = await profileFetch.getUserById(req.session.user);

    let uniArr = getuser.favouriteUniversities;

    if (uniArr.length == 0) {
      uniArr = null;
    }
    res.render("profile/userProfile", {
      title: "Information",
      uniArr: uniArr,
      user: getuser,
      isUserLoggedIn: req.session.user != null ? true : false,
    });
  } else {
    res.redirect("/");
  }
});

router.get("/remove_profile", async function (req, res) {
  if (req.session.user) {
    await profileFetch.deleteUser(req.session.user._id);
    req.session.destroy();
    res.redirect("/logout");
  } else {
    res.redirect("/login?msg=Please sign in to delete your account");
  }
});

router.get("/update_profile", async function (req, res) {
  if (req.session.user) {
    const getuser = await profileFetch.getUserById(req.session.user);
    res.render("profile/updateProfile", {
      title: "Update Profile",
      user: getuser,
      isUserLoggedIn: req.session.user != null ? true : false,
    });
  } else {
    res.redirect("/login?msg=Please sign in to update your profile");
  }
});

router.post("/update_profile", async function (req, res) {
  const name = xss(req.body.name);
  const email = xss(req.body.email);
  const password = xss(req.body.password);
  const confirm_password = xss(req.body.confirm);
  const aspiringUniversity = xss(req.body.uni);
  const workEx = Number(xss(req.body.work));

  let errorMessage = null;
  if (!name) {
    errorMessage = "Name must be present";
  } else if (name == null) {
    errorMessage = "Name cannot be null";
  } else if (name == undefined) {
    errorMessage = "Name not defined";
  } else if (name.trim().length < 5 || name.trim().length > 15) {
    errorMessage = "Name with more than 4 and less than 15 characters";
  } else if (!aspiringUniversity) {
    errorMessage = "Aspiring University must be present";
  } else if (aspiringUniversity == null) {
    errorMessage = "Aspiring University cannot be null";
  } else if (aspiringUniversity == undefined) {
    errorMessage = "Aspiring University is not defined";
  }

  // else if (!password) {
  //     errorMessage = "You must provide a password";
  // }
  // else if (password == null) {
  //     errorMessage = "password cannot be null";
  // }
  // else if (password == undefined) {
  //     errorMessage = "password not defined";
  // }

  // else if (!confirm_password) {
  //     errorMessage = "Please enter confirm passowrd";
  // }
  // else if (confirm_password == null) {
  //     errorMessage = "Please enter confirm passowrd";
  // }
  // else if (confirm_password == undefined) {
  //     errorMessage = "Please enter confirm passowrd";
  // }

  //  else if (!password == confirm_password) {
  //         errorMessage = "Password and Confrim Password must be same";
  //     }
  // else if (password.length < 6 || password.length > 20) {
  //     errorMessage = "Enter a password with more than 6 and less than 20 characters";
  // }
  // else if (!password.match(/^(?!\s*$).+/)) {
  //     errorMessage = "Enter password only with valid characters";
  // }
  else if (!email) {
    errorMessage = "You must provide a email post";
  } else if (email == null || email.length == 0) {
    errorMessage = "email cannot be null";
  } else if (email == undefined) {
    errorMessage = "email not defined";
  } else if (!validateEmail(email)) {
    errorMessage = "Enter email only with valid characters";
  } else if (!workEx || workEx == null || workEx == undefined) {
    errorMessage = "Please enter 0 if you dont have work experience";
  } else if (typeof workEx == "string") {
    errorMessage = "Work Experience should be a number";
  } else if (workEx < 0 || workEx > 100) {
    errorMessage = "Please enter 0 if you dont have work experience";
  } else {
    errorMessage = null;
  }

  try {
    if (errorMessage == null) {
      let updatedUser = { name, email, aspiringUniversity, workEx };
      if (password) {
        updatedUser.password = password;
      }
      if (req.session.user) {
        const updateuser = await profileFetch.updateUser(
          req.session.user,
          updatedUser
        );

        if (updateuser) {
          // let sessionUser = req.session.user;
          // for (let key in updatedUser) {
          //     sessionUser[key] = updatedUser[key];
          // }
          // req.session.user = sessionUser;
          return res.redirect("/profile");
        }
      }
    }
  } catch (e) {
    errorMessage = e;
  }

  const getuser = await profileFetch.getUserById(req.session.user);
  //console.log(errorMessage);
  res.render("profile/updateProfile", {
    title: "Error",
    error: errorMessage,
    user: getuser,
    isUserLoggedIn: req.session.user != null ? true : false,
  });
});

router.get("/update_password", async function (req, res) {
  if (req.session.user) {
    const getuser = await profileFetch.getUserById(req.session.user);
    res.render("profile/change_password", {
      title: "Update Profile",
      user: getuser,
      isUserLoggedIn: req.session.user != null ? true : false,
    });
  } else {
    res.redirect("/login?msg=Please sign in to update your profile");
  }
});

router.post("/update_password", async function (req, res) {

    const getuser = await profileFetch.getUserById(req.session.user);
    const email = getuser.email;
    const Curr_password = xss(req.body.password);
    const password = xss(req.body.new_password);
    const confirm_password = xss(req.body.confirm);
  
      if (!Curr_password) {
      errorMessage = "You must provide a Current password";
    } else if (Curr_password == null) {
      errorMessage = "Current password cannot be null";
    } else if (Curr_password == undefined) {
      errorMessage = "Current password not defined";
    }
    else if(Curr_password===password){
    errorMessage = "Please enter new password which is other than old password";
    }
    else if (!password) {
      errorMessage = "You must provide a New password";
    } else if (password == null) {
      errorMessage = "New password cannot be null";
    } else if (password == undefined) {
      errorMessage = "New password not defined";
    } else if (schema.validate(password) == false) {
     
      errorMessage = "Please Enter Valid Password: Password Should be Minumum of length 8, Must have uppercase letters,Must have lowercase letters,Must have at least 2 digits,Should not have spaces";
    } else if (!confirm_password) {
      errorMessage = "Please enter confirm passowrd";
    } else if (confirm_password == null) {
      errorMessage = "Please enter confirm passowrd";
    } else if (confirm_password == undefined) {
      errorMessage = "Please enter confirm passowrd";
    } else if ((password == confirm_password) == false) {
   
      errorMessage = "Password and Confrim Password must be same";
    } else if (password.length < 6 || password.length > 20) {
      errorMessage =
        "Enter a password with more than 6 and less than 20 characters";
    } else if (!password.match(/^(?!\s*$).+/)) {
      errorMessage = "Enter password only with valid characters";
    } else if ((await checkpassword(email, Curr_password)) == false) {
      errorMessage = "Invalid Current Password";
    } else {
      errorMessage = null;
    }
    try {
    if (errorMessage == null) {
      let hashedPassword = password;
      let updatedUser = { hashedPassword };

      if (req.session.user) {
        const updateuser = await profileFetch.updateUser(
          req.session.user,
          updatedUser
        );

        if (updateuser) {
          // let sessionUser = req.session.user;
          // for (let key in updatedUser) {
          //     sessionUser[key] = updatedUser[key];
          // }
          // req.session.user = sessionUser;
          return res.redirect("/profile");
        }
      }
    }
  } catch (e) {
    errorMessage = e;
  }

  //console.log(errorMessage);
  res.render("profile/change_password", {
    title: "Error",
    error: errorMessage,
    user: getuser,
    isUserLoggedIn: req.session.user != null ? true : false,
  });
});

// router.get('/remove_profile', async function (req, res) {
//     if (req.session.user) {
//         await userFetch.deleteUser(req.session.user._id);
//         req.session.destroy();
//         res.redirect('/logout');
//     }
//     else {
//         res.redirect('/login?msg=Please sign in to delete your account');
//     }
// });

router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
