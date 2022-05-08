let mongoCollections = require("../config/mongoCollections");
let profile = mongoCollections.profiles;
let bcrypt = require("bcrypt");
let saltRounds = 12;
let { ObjectId } = require("mongodb");
var passwordValidator = require("password-validator");
var schema = new passwordValidator();

// Add properties to it
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

//password Validation function
  function validatePassword(password) {
    var decimal=  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/;
    if(password.match(decimal))
              {
                  return true;
              }
        else
              {
                 return false;
              }
  }

// Function to validate email with atleast 5 characters in the name
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

async function createUser(name, email, aspiringUniversity, workEx, password) {
  //email = email.toLowerCase();
  try {
    let newProfile = {};
    newProfile = validateUserDetails(name, email, aspiringUniversity, workEx);

    //check if email already in DB
    let allUsers = await getAllUsers();
    allUsers.forEach((user) => {
      if (user.email.trim() === newProfile.email)
        throw {
          code: 400,
          message:
            "Email already exists in database, please enter a different email address.",
        };
    });

    //password validation
    if (!password) throw { code: 400, message: "You must provide a password" };
    if (validatePassword(password) == false) {
      throw {
        code: 400,
        message:
          "Please Enter Valid Password: 1. Password Should be between 8 to 20 characters\n2. Have at least one uppercase letter\n3. Have at least one lowercase letter\n4. Must have at least 1 digits\n5. and one special character",
      };
    }
    newProfile.hashedPassword = bcrypt.hashSync(password, saltRounds);

    newProfile.favouriteUniversities = [];

    let profileCollection = await profile();
    let insertInfo = await profileCollection.insertOne(newProfile);
    if (insertInfo.insertedCount === 0) {
      throw "Cannot add that user";
    }
    let id = insertInfo.insertedId;

    let user = await getUserById(id.toString());
    user._id = user._id.toString();
    return user;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

//Checked
async function getUserById(id) {
  try {
    idValidation(id);
    let user = await profile();
    //var newId = convertObject(id);
    let getUser = await user.findOne({ _id: ObjectId(id) });
    // console.log(ObjectId(id))
    // console.log(getUser)
    getUser._id = getUser._id.toString();
    if (!getUser) throw "No User with that id";
    return getUser;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}
//Checked
async function getAllUsers() {
  try {
    let userget = await profile();
    let getAllUser = await userget.find({}).toArray();
    for (var i = 0; i < getAllUser.length; i++) {
      getAllUser[i]._id = getAllUser[i]._id.toString();
    }
    if (!getAllUser) throw { code: 400, message: "User does not exists!" };
    return getAllUser;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

//Checking user while login
async function checkUser(email, password) {
  try {
    if (!validateEmail(email)) throw { code: 400, message: "Invalid Email id" };
    email = email.toLowerCase();

    //password validation
    if (!password) throw { code: 400, message: "You must provide a password" };
    if (validatePassword(password) === false) {
      throw {
        code: 400,
        message:
          "Please Enter Valid Password: 1. Password Should be between 8 to 20 characters\n2. Have at least one uppercase letter\n3. Have at least one lowercase letter\n4. Must have at least 1 digits\n5. and one special character",
      };
    }

    let user = await profile();
    let getuser = await user.find({}).toArray();
    let userFound = false;
    for (var i = 0; i < getuser.length; i++) {
      if (
        getuser[i].email.trim() === email &&
        bcrypt.compareSync(password, getuser[i].hashedPassword)
      ) {
        userFound = true;
      }
    }
    if (userFound) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

async function updatePassword(id, newPassword) {
  try {
    let user = await profile();
    let getuser = await user.findOne({ _id: ObjectId(id) });
    if (!getuser) {
      throw { code: 400, message: "No such user exists!" };
    }
    if (!newPassword)
      throw { code: 400, message: "You must provide a password" };

    if (validatePassword(newPassword) == false) {
      throw {
        code: 400,
        message:
          "Please Enter Valid Password: 1. Password Should be between 8 to 20 characters\n2. Have at least one uppercase letter\n3. Have at least one lowercase letter\n4. Must have at least 1 digits\n5. and one special character",
      };
    }
    //console.log(schema.validate(newPassword), "Helloooo");
    let hashedPassword = bcrypt.hashSync(newPassword, saltRounds);
    if (bcrypt.compareSync(hashedPassword, getuser.hashedPassword)) {
      return true;
    }
    let profileUpdate = await profile();
    let updatedInfo = await profileUpdate.updateOne(
      { _id: ObjectId(id) },
      { $set: { hashedPassword: hashedPassword } }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw { code: 400, message: "No update occured!" };
    }
    return true;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

async function updateUser(id, newUserData) {
  try {
    idValidation(id);
    userDetailsToUpdate = validateUserDetails(
      newUserData.name,
      newUserData.email,
      newUserData.aspiringUniversity,
      newUserData.workEx
    );

    let profileUpdate = await profile();

    let user = await profile();
    let getuser = await user.findOne({ _id: ObjectId(id) });
    if (
      userDetailsToUpdate.name === getuser.name &&
      userDetailsToUpdate.email === getuser.email &&
      userDetailsToUpdate.aspiringUniversity === getuser.aspiringUniversity &&
      userDetailsToUpdate.workEx === getuser.workEx
    ) {
      return true;
    }
    let updatedInfo = await profileUpdate.updateOne(
      { _id: ObjectId(id) },
      { $set: userDetailsToUpdate }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw { code: 400, message: "No update occured!" };
    }
    return true;
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

function idValidation(id) {
  if (!id) throw { code: 400, message: "You must provide an id to search for" };
  if (typeof id !== "string")
    throw { code: 400, message: "Id must be a string" };
  if (id.trim().length === 0)
    throw { code: 400, message: "Id cannot be an empty string or just spaces" };
  id = id.trim();
  if (!ObjectId.isValid(id)) throw { code: 400, message: "invalid object ID" };
}

function validateUserDetails(name, email, aspiringUniversity, workEx) {
  try {
    if (!name) throw "Must Provide name";
    if (name.trim().length === 0)
      throw { code: 400, message: "User Name cannot be empty" };
    name = name.trim();
    if (name.trim().length < 5 || name.trim().length > 100)
      throw {
        code: 400,
        message: "User Name has to be between 5 to 100 characters",
      };
    name = name.trim();

    //email validation
    if (!validateEmail(email)) throw { code: 400, message: "Invalid Email id" };
    email = email.toLowerCase();

    if (typeof workEx !== "number") throw "Work Experience should be a number";
    if (workEx !== 0) {
      if (!workEx) {
        throw {
          code: 400,
          message: "Please enter 0 if you dont have work experience",
        };
      }
    }
    if (workEx < 0 || workEx > 100)
      throw {
        code: 400,
        message: "Work should be a valid number greater than or equal to zero.",
      };

    if (!aspiringUniversity) {
      aspiringUniversity = "";
    }

    return {
      name: name,
      email: email,
      aspiringUniversity: aspiringUniversity,
      workEx: workEx,
      // to remove hashedPassword: hashPassword,
    };
  } catch (e) {
    throw {
      code: e.code || 500,
      message: e.message || "Internal Server Error Occured",
    };
  }
}

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  checkUser, //all good
  updateUser,
  updatePassword,
};
