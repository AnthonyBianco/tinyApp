//                    IMPORT MODULES
//======================================================
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//                  USER INFORMATION
//=======================================================
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
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
  if (req.cookies["id"] === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  } 
  res.redirect("/urls");
});

//               EDIT URL NAME FUNCTION
//========================================================
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = {longURL: req.body.longURL, userID: req.cookies["id"]};
  res.redirect("/urls");
});

//                    LOGIN FUNCTION
//=========================================================
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  for (key in users) {
  if  (users[key].email === email) {
    if (users[key].password === password){
      res.cookie("id", key);
      res.redirect("/urls/new");
      } 
    }
  }
  res.status(400).send("Error: Something went wrong");
//   If a user with that e-mail cannot be found, return a response with a 403 status code.
// If a user with that e-mail address is located, compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.
// If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
});

//                    LOGOUT FUNCTION
//==========================================================
app.post("/logout", (req, res) => {
  user_id = req.body.user_id;
  res.clearCookie("id", user_id);
  res.redirect("/urls");
});

//                       LOGIN PAGE
//==========================================================
app.get("/loginFile", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: findUserObjectById(req.cookies["id"]) };
  res.render("loginFile", templateVars);
});

//          THIS CLEARS COOKIES THEN LOGS USER OUT
//==========================================================
app.post("/logout", (req, res) => {
  user_id = req.body.user_id;
  res.clearCookie("id", user_id);
  res.redirect("/urls");
});

//    CREATE USER POST INFORMATION (USING REGISTRATION)
//==========================================================
app.post("/register", (req, res) => {
  
  let newUser = {
      id: generateRandomString(), 
      email: req.body.email, 
      password: req.body.password
    }

   
   for (key in users){
    if (req.body.email.length === 0 || req.body.password.length === 0){
      res.status(400).send("Error: Email or password not entered");
    } else if (users[key].email === newUser.email) {

      res.status(400).send("Error: User email already exists");
    } 
  }
  
  users[newUser.id] = newUser;
  res.cookie("id", newUser.id);
  res.redirect("/urls");

});

//                GET REGISTRATION TEMPLATE
//==========================================================
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: findUserObjectById(req.cookies["id"]) };
  res.render("registration", templateVars);
});



//         GENERATES RANDOM SHORT STRING FUNCTION FOR URL
//===========================================================
app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  console.log(req.cookies);
  shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["id"]};
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls/new", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user_id: findUserObjectById(req.cookies["id"]),
    users: users 
  };
  if (req.cookies["id"] === undefined)
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
    user_id: findUserObjectById(req.cookies["id"]),
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
  let userID = req.cookies["id"];
  if (userID === undefined){
    //res.status(400).send("Error: Something went wrong");
  }
  let userCreatedUrls = urlsForUser(userID);
  let templateVars = { urls: userCreatedUrls, user_id: findUserObjectById(req.cookies["id"])};
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