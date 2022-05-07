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
      bcrypt.compareSync(password, getuser[i].hashedPassword)
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
  if (password.length < 8 || password.length > 20)
    throw "enter a password with more than 6 characters or less than 20";
  if (!password.match(/^(?!\s*$).+/)) throw "Enter a valid password";

  const getuser = await profileFetch.getAllUsers();
  for (var i = 0; i < getuser.length; i++) {
    if (
      getuser[i].email == email &&
      bcrypt.compareSync(password, getuser[i].hashedPassword)
    ) {
      return getuser[i];
    }
  }
  return false;
};



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

    const name = xss(req.body.name);
 
    const password = xss(req.body.password);
    const confirm_password = xss(req.body.confirm);
    const workex = Number(xss(req.body.work));
    const email = xss(req.body.email);
    const aspUni = xss(req.body.uni);
   
    try {
      if (!name) {
        throw "Name must be present";
      }  if (name == null) {
        throw "Name cannot be null";
      }  if (name == undefined) {
        throw "Name not defined";
      }
  
      else if (name.length < 5 || name.length > 15) {
          throw  "Enter a Name with more than 4 and less than 15 characters";
      }
       if (!password) {
        throw "You must provide a password";
      }  if (password == null) {
        throw "password cannot be null";
      }  if (password == undefined) {
        throw "password not defined";
      }  if (schema.validate(password) == false) {
        throw "Please Enter Valid Password: Password Should be Minumum of length 8, Must have uppercase letters,Must have lowercase letters,Must have at least 2 digits,Should not have spaces";
      }  if ((password == confirm_password) == false) {
        throw "Password and Confrim Password must be same";
      }  if (password.length < 8 || password.length > 20) { 
        throw "Enter a password with more than 8 and less than 20 characters";
      }  if (!password.match(/^(?!\s*$).+/)) {
        throw "Enter password only with valid characters";
      }  if (!email) {
        throw "You must provide a email post";
      }  if (email == null || email.length == 0) {
        throw "email cannot be null";
      }  if (email == undefined) {
        throw "email not defined";
      }  if (!validateEmail(email)) {
        throw "Enter email only with valid characters";
      } 
       if (workex !==0){
        if(!workex || workex == null || workex == undefined)
         {
          throw "Please enter 0 if you dont have work experience";
    }
  }
      if (typeof workex == "string") {
      throw "workex should be a number";
      }  if (workex < 0 || workex > 100) {
        throw "Please enter 0 if you dont have work experience";
      } 
     
        const usercheck = await profileFetch.checkUser(email, password);
        if (usercheck) {
          throw "User already exists";
        }
      
        const adduser = await profileFetch.createUser(
          name,
          email,
          aspUni,
          workex,
          password
        );
        return res.redirect("/login?msg=Congratulations, you are user now");
  
    } catch (e) {
      errorMessage = e;
      res.render("profile/signup", {
        title: "Error",
        error: errorMessage,
        isUserLoggedIn: req.session.user != null ? true : false,
      });
    }
});

// Get login page
router.get("/login", function (req, res) {
  if (req.session.user) {
    res.redirect("/posts");
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

 try{
  if (!email) {
    throw "Email must be present";
  }  if (email == null) {
    throw "Email cannot be null";
  }  if (email == undefined) {
    throw "Email not defined";
  }  if (!email.match(/^[a-z0-9_@\.]+$/)) {
    throw "Enter a Email only with valid characters";
  }  if (!password) {
    throw "You must provide a password";
  }  if (password == null) {
    throw "password cannot be null";
  }  if (password == undefined) {
    throw "password not defined";
  }  if (password.length < 8 || password.length > 15) {
    throw "Enter a password with more than 8 and less than 20 characters";
  }  if (!password.match(/^(?!\s*$).+/)) {
    throw "Enter password only with valid characters";
  } 
    const user = await checkvalid(req);
    if (user) {

      req.session.user = user._id;
      //return res.redirect('/profile');
      return res.send({ status: true, error: null });
    }
    else{
      throw "Invalid username/password"
    }
  }
//   if (errorMessage == null) {
   

//     if (user) {

//       req.session.user = user._id;
//       //return res.redirect('/profile');
//       return res.send({ status: true, error: null });
//     }
//     errorMessage = "Invalid username/password";
//   }
// }
catch(e){
  res.status(400)
  res.send({ status: false, error: e });

}
});

router.get("/profile", async function (req, res) {
  try{
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
}
catch(e){
}
});


router.get("/update_profile", async function (req, res) {
  try{
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
}
catch(e){
}
});

router.post("/update_profile", async function (req, res) {
  const name = xss(req.body.name);
  const email = xss(req.body.email);
  const aspiringUniversity = xss(req.body.uni);
  const workEx = Number(xss(req.body.work));

  try {
    if (!name) {
      throw "Name must be present";
    }  if (name == null) {
      throw "Name cannot be null";
    }  if (name == undefined) {
      throw "Name not defined";
    }  if (name.trim().length < 5 || name.trim().length > 15) {
      throw "Name with more than 4 and less than 15 characters";
    }  if (!aspiringUniversity) {
      throw "Aspiring University must be present";
    }  if (aspiringUniversity == null) {
      throw "Aspiring University cannot be null";
    }  if (aspiringUniversity == undefined) {
      throw "Aspiring University is not defined";
    }
     if (!email) {
      throw "You must provide a email post";
    }  if (email == null || email.length == 0) {
      throw "email cannot be null";
    }  if (email == undefined) {
      throw "email not defined";
    }  if (!validateEmail(email)) {
      throw "Enter email only with valid characters";
    }
    if(workEx!==0){  
    if (!workEx || workEx == null || workEx == undefined) {
      throw "Please enter 0 if you dont have work experience";
    }
  }
      if (typeof workEx == "string") {
      throw "Work Experience should be a number";
    }  if (workEx < 0 || workEx > 100) {
      throw "Please enter 0 if you dont have work experience";
    }
        let update = { name, email, aspiringUniversity, workEx };
       
        if (req.session.user) {
          const updateuser = await profileFetch.updateUser(
            req.session.user,
            update
          );
  
          if (updateuser) {
            return res.redirect("/profile");
          }
        }
      
    } catch (e) {
      errorMessage = e;
      const getuser = await profileFetch.getUserById(req.session.user);
     
      res.render("profile/updateProfile", {
        title: "Error",
        error: errorMessage,
        user: getuser,
        isUserLoggedIn: req.session.user != null ? true : false,
      });
    }
});

router.get("/update_password", async function (req, res) {
  try{
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
}
catch(e){
}
});

router.post("/update_password", async function (req, res) {

    const getuser = await profileFetch.getUserById(req.session.user);
    const email = getuser.email;
    const Curr_password = xss(req.body.password);
    const password = xss(req.body.new_password);
    const confirm_password = xss(req.body.confirm);
  
    try{
      if (!Curr_password) {
        throw "You must provide a Current password";
      }  if (Curr_password == null) {
        throw "Current password cannot be null";
      }  if (Curr_password == undefined) {
        throw "Current password not defined";
      }
       if(Curr_password===password){
        throw "Please enter new password which is other than old password";
      }
       if (!password) {
        throw "You must provide a New password";
      }  if (password == null) {
        throw "New password cannot be null";
      }  if (password == undefined) {
        throw "New password not defined";
      }  if (schema.validate(password) == false) {
       
        throw "Please Enter Valid Password: Password Should be Minumum of length 8, Must have uppercase letters,Must have lowercase letters,Must have at least 2 digits,Should not have spaces";
      }  if (!confirm_password) {
        throw "Please enter confirm passowrd";
      }  if (confirm_password == null) {
        throw "Please enter confirm passowrd";
      }  if (confirm_password == undefined) {
        throw "Please enter confirm passowrd";
      }  if ((password == confirm_password) == false) {
     
        throw "Password and Confrim Password must be same";
      }  if (password.length < 8 || password.length > 20) {
        
        throw "Enter a password with more than 8 and less than 20 characters";
      }  if (!password.match(/^(?!\s*$).+/)) {
        throw "Enter password only with valid characters";
      }  if ((await checkpassword(email, Curr_password)) == false) {
        throw "Invalid Current Password";
      }
   
        let hashedPassword = password;
        let updatedUser = { hashedPassword };
  
        if (req.session.user) {
          const updateuser = await profileFetch.updateUser(
            req.session.user,
            updatedUser
          );
          if (updateuser) {
            return res.redirect("/profile");
          }
        }
    } catch (e) {
      errorMessage = e;
      res.render("profile/change_password", {
        title: "Error",
        error: errorMessage,
        user: getuser,
        isUserLoggedIn: req.session.user != null ? true : false,
      });
    }
});

router.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
