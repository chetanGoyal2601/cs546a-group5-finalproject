const mongoCollections = require("../config/mongoCollections");
const profile = mongoCollections.profiles;
const bcrypt = require("bcrypt");
const saltRounds = 12;
const { ObjectId } = require("mongodb");
var passwordValidator = require("password-validator");
var schema = new passwordValidator();

// Add properties to it
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

// Function to validate email with atleast 5 characters in the name
function validateEmail(email) {
  const regexEmail = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;
  if (email.match(regexEmail)) {
    return true;
  } else {
    return false;
  }
}

//Checked
const convertObject = (id) => {
  if (!id) throw "Id parameter must be supplied";
  if (typeof id !== "string") throw "Id must be a string";
  try {
    let parsedId = ObjectId(id);
    return parsedId;
  } catch (e) {
    throw "Id not supported";
  }
};

async function createUser(name, email, aspiringUniversity, workEx, password) {
  email = email.toLowerCase();

  if (!name) throw "Must Provide name";
  if (name == undefined) throw "User Name not undefined";
  if (name == null || name.trim().length == 0) throw "User Name cannot be null";

  if (!email) throw "You must provide a Email";
  if (email == undefined) throw "Email not defined";
  if (email == null || email.length == 0) throw "Email cannot be null";
  if (!validateEmail(email)) throw "Invalid Email id";

  if (!password) throw "You must provide a password";
  if (password == null || password.length == 0) throw "Password cannot be null";
  if (password === undefined) throw "password not defined";

  if (schema.validate(password) == false) {
    throw "Please Enter Valid Password: Password Should be Minumum of length 8, Must have uppercase letters,Must have lowercase letters,Must have at least 2 digits,Should not have spaces";
  }

  if (!password.match(/^(?!\s*$).+/)) throw "Enter a valid password";

  // if (!aspiringUniversity) throw "You must provide a aspiringUniversity"
  // if (aspiringUniversity == null || aspiringUniversity.trim().length == 0) throw "aspiringUniversity cannot be null"
  // if (aspiringUniversity === undefined) throw "aspiringUniversity not defined"

  if (workEx == null || workEx == undefined || !workEx)
    throw "Pleae enter 0 if you dont have work experience";
  if (typeof workEx !== "number") throw "Work Experience should be a number";
  if (workEx < 0 || workEx > 100)
    throw "Please enter 0 if you dont have work experience";

  const allUsers = await getAllUsers();
  allUsers.forEach((user) => {
    if (user.email == email)
      throw "Email already exists in database, please enter correct email address";
  });

  const hashPassword = bcrypt.hashSync(password, 16);

  const newProfile = {
    name: name,
    email: email,
    aspiringUniversity: aspiringUniversity,
    workEx: workEx,
    password: hashPassword,
    favouriteUniversities: [],
  
  };

  try {
    const profileCollection = await profile();

    const insertInfo = await profileCollection.insertOne(newProfile);
    if (insertInfo.insertedCount === 0) {
      throw "Cannot add that user";
    }
    const id = insertInfo.insertedId;

    const user = await getUserById(id.toString());
    user._id = user._id.toString();
    return user;
  } catch (e) {}
}

//Checked
async function getUserById(id) {
  if (!id) throw "You should provide an ID";
  if (id.length == 0) throw "Id is blank";
  if (id == null) throw "Id cannot be null";
  if (id == undefined) throw "Id should be defined";
  if (typeof id != "string") throw "Id is not string";

  const user = await profile();
  //var newId = convertObject(id);
  const getUser = await user.findOne({ _id: ObjectId(id) });
  // console.log(ObjectId(id))
  // console.log(getUser)
  getUser._id = getUser._id.toString();
  if (getUser == null || getUser == undefined) throw "No User with that id";
  return getUser;
}

//Checked
async function getAllUsers() {
  const userget = await profile();
  const getAllUser = await userget.find({}).toArray();
  for (var i = 0; i < getAllUser.length; i++) {
    getAllUser[i]._id = getAllUser[i]._id.toString();
  }
  if (getAllUser == null || getAllUser == undefined)
    throw "User does not exists!";
  return getAllUser;
}

async function getfavUni() {
  const userget = await profile();
  const getfav = await userget.find({}).toArray();
  for (var i = 0; i < getfav.length; i++) {
    getAllUser[i]._id = getAllUser[i]._id.toString();
  }
  if (getAllUser == null || getAllUser == undefined)
    throw "User does not exists!";
  return getAllUser;
}

//Checking user for while login
async function checkUser(emailLower, password) {
  email = emailLower.toLowerCase();

  if (email == null) throw "Email cannot be null";
  if (email == undefined) throw "Email not defined";
  if (!email) throw "Provide an email to check";
  if (email == null || email.length == 0) throw "Email cannot be null";
  if (!validateEmail(email)) throw "Invalid Email id";

  if (!password) throw "You must provide a password";
  if (password == null) throw "Password cannot be null";
  if (password == undefined) throw "password not defined";
  if (password.length < 6 || password.length > 20)
    throw "enter a password with more than 6 characters or less than 20";
  if (!password.match(/^(?!\s*$).+/)) throw "Enter a valid password";

  const user = await profile();
  const getuser = await user.find({}).toArray();
  for (var i = 0; i < getuser.length; i++) {
    if (
      getuser[i].email == email &&
      bcrypt.compareSync(password, getuser[i].password)
    )
      return true;
  }
  if (!email || !password) throw "Either the email or password is invalid";
  return false;
}

async function updateUser(id, newUserData) {
  try {
    if (newUserData.password) {
      newUserData.password = bcrypt.hashSync(newUserData.password, 16);
    }
    const profileUpdate = await profile();
    let uu = await profileUpdate.updateOne(
      { _id: ObjectId(id) },
      { $set: newUserData }
    );
    return true;
  } catch (error) {
    return false;
  }
}

// async function deleteUser(_id) {
//     if (_id === undefined || _id === null) { throw "Id is undefined" }
//     if (_id.length === 0) { throw "Id is blank" }
//     if (typeof _id != 'string' || !_id.replace(/\s/g, "").length) throw 'Id should be string'
//     if (!ObjectId.isValid(_id)) { throw "Enter a valid object id" }
//     const profileCollection = await profile();
//     const deletionInfo = await profileCollection.deleteOne({ _id: ObjectId(_id) });
//     if (deletionInfo.deletedCount === 0) {
//         throw `Could not delete user with id of ${_id}`;
//     }
//     return true;
// }

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  checkUser,
  updateUser,
};
