//                    IMPORT MODULES
//======================================================
const getUserByEmail = require('./helpers.js');
const cookieParser = require('cookie-parser');
var express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');

var cookieSession = require('cookie-session')



app.use(cookieSession({
  name: 'session',
  secret: 'superSecretePassword',

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


//                  USER INFORMATION
//=======================================================
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("jkl", 1)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password:  bcrypt.hashSync("asd", 1)
  }
}

//               FIND USER OBJECT BY ID
//========================================================
function findUserObjectById(id) {
let findUserByID = users[id];
return findUserByID;
};

// NEW FUNCTION Users Can Only See Their Own Shortened URLs
//========================================================
function urlsForUser(id){
  let results = {};
  for(key in urlDatabase){
    if (urlDatabase[key].userID === id)
    results[key] = (urlDatabase[key]);
  } 
  return results;
}

// This means that the /urls page should not display URLs unless the user is logged in. It should instead display a message or prompt suggesting that they login or register first.

// This also means that the /urls page will need to filter the entire list in the urlDatabase by comparing the userID with the logged-in user's ID. This filtering process should happen before the data is sent to the template for rendering.

// Similarly, this also means that the /urls/:id page should display a message or prompt if the user is not logged in, or if the the URL with the matching :id does not belong to them.

// Create a function named urlsForUser(id) which returns the URLs where the userID is equal to the id of the currently logged in user.

//                  PROVIDES TWO URLS
//========================================================

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//                  DELETE FUNCTION?
//========================================================
app.get("/urls/:shortURL/delete", (req, res) => {
  
  res.redirect("/urls");
});

//                  DELETE URL FUNCTION
//========================================================
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  // MAKE SOMETHING THAT DELETES IF YOU'RE LOGGED IN BUT CANNOT DELETED OTHERWISE
  if (req.session["id"] === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  } 
  res.redirect("/urls");
});

//               EDIT URL NAME FUNCTION
//========================================================
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = {longURL: req.body.longURL, userID: req.session["id"]};
  res.redirect("/urls");
});

//                    LOGIN FUNCTION
//=========================================================
// PROBLEM

app.post("/login", (req, res) => {
 
  let email = req.body.email;
  let password = req.body.password;
  let user = getUserByEmail(email, users);

  if (bcrypt.compareSync(password, user.password)){ //something here is wrong
      req.session["id"] = user.id;
      res.redirect("/urls");
    } 
    res.status(400).send("Error: Something went wrong");
});

//                    LOGOUT FUNCTION
//==========================================================
app.post("/logout", (req, res) => {
  user_id = req.body.user_id;
  req.session["id"] = null;
  res.redirect("/urls");
});

//                       LOGIN PAGE
//==========================================================
app.get("/loginFile", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: findUserObjectById(req.session["id"]) };
  res.render("loginFile", templateVars);
});

//          THIS CLEARS COOKIES THEN LOGS USER OUT
//==========================================================
app.post("/logout", (req, res) => {
  user_id = req.body.user_id;
  req.session["id"] = user_id;
  res.redirect("/urls");
});

//    CREATE USER POST INFORMATION (USING REGISTRATION)
//==========================================================
function checkDuplicateEmail(email){
  for(let key in users){
    if(users[key].email===email){
      return true;
    }
  }
  return false;
}




app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password ===""){
    res.status(400).send("Error: Email or password not entered");
  } else if (checkDuplicateEmail(req.body.email)) {
    res.status(400).send("Error: User email already exists");
  } else{
    //registers the new user and redirect it to the url page
    let newUser = {
      id: generateRandomString(), 
      email: req.body.email, 
      password: bcrypt.hashSync(req.body.password, 10)
    };
    users[newUser.id] = newUser;
    req.session["id"] = newUser.id;
    res.redirect("/urls");
  }
});



//                GET REGISTRATION TEMPLATE
//===========================================================
app.get("/register", (req, res) => {
  // let templateVars = { urls: urlDatabase, user_id: findUserObjectById(req.cookies["id"]) };
  res.render("registration");
});




const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 1);



//         GENERATES RANDOM SHORT STRING FUNCTION FOR URL
//===========================================================
app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["id"]};
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls/new", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user_id: findUserObjectById(req.session["id"]),
    users: users 
  };
  if (req.session["id"] === undefined)
  {
    res.redirect("/loginFile");
  }
  res.render("urls_new", templateVars);
});

//      SAYS HELLO ON WITH JUST "/" ON URL FUNCTION
//============================================================

app.get("/", (req, res) => {
  res.redirect("/urls"); // THIS REDIRECTS YOU TO THE HOMEPAGE
});


//          ADDS COOKIES FOR user_id FUNCTION
//============================================================
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user_id: findUserObjectById(req.session["id"]),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  console.log(urlDatabase);
  res.render("urls_show", templateVars);
});

//               GENERATES LONG URL FUNCTION
//============================================================
app.get("/u/:shortURL", (req, res) => {
  console.log(req.params);
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  res.redirect(longURL);
});

//         HOMEPAGE SETUP (VARIABLES FOR PAGE SETTINGS?)
// ===========================================================

app.get("/urls", (req, res) => {
  let userID = req.session["id"];
  if (userID === undefined){
    //res.status(400).send("Error: Something went wrong");
  }
  let userCreatedUrls = urlsForUser(userID);
  let templateVars = { urls: userCreatedUrls, user_id: findUserObjectById(req.session["id"])};
  res.render("urls_index", templateVars);
});

function generateRandomString() {
  Math.random().toString(36).slice(-6);
  return Math.random().toString(36).slice(-6);

};

//                 SERVER LISTENING FUNCTION
//=================================================================
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

