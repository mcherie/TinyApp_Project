var express = require('express')
var app = express()
var PORT = 8080 // default port 8080

const cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
}

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

// This generates the randoms string for both the tiny app and userID 
function generateRandomString () {
  return Math.floor((1 + Math.random()) * 0x10000000).toString(36)
}

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.get('/urls', (req, res) => {
    let user_id = req.cookies.user_id;
    user = users[user_id]

  let templateVars = { 
        urls: urlDatabase,
        user: user
    }
  res.render('urls_index', templateVars) // redirect //
})

app.get('/urls/new', (req, res) => {
    let templateVars = {
        // username: req.cookies.username,
        user: user
    }
  res.render('urls_new', templateVars)
})


app.post('/urls', (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
//   let newShortURL = generateRandomString() // to generate a new random string ***** PUT THIS BACK!!!
  console.log(req.body)
  // console.log(newShortURL)
// THIS WHOLE COMMENTED PART IS IF I WANT TO DO A FIX OF ADDING HTTP AT THE BEGINNING IF THE CLIENT DIDN'T
    // const formattedURL = function(incomingLongURL) {
    //     let something 
    //     if (incomingLongURL.startsWith("http")) {
    //         return incomingLongURL; 
    //     } else {
    //         return "http://" + incomingLongURL
    //     }
    // } 
    // let newLongURL = formattedURL(incomingLongURL)

// I can declare a new variable here to use, then replace the req.body.longURL later with incomingLongURL
    // const incomingLongURL = req.body.longURL 
    const newShortURL = generateRandomString();
    const userID = generateRandomString();
    urlDatabase[newShortURL] = {} // to add this new info into the urlDatabase PUT THIS BACK!!!

// Creation of the new object url id
const newUserRandomID = generateRandomString()

    urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID
};
// Insertion of new person to the object
res.cookie("user_id", newUserRandomID)
console.log(res.cookie)
// username: req.cookies.username
console.log(urlDatabase) // just for me to see if it got added to the database
  res.redirect('/urls/' + newShortURL) // to redirect to the page which shows his newly created tiny URL
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = req.body.longURL
  res.redirect(longURL)
})


app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    // username: req.cookies.username,
    user: user
}
  res.render('urls_show', templateVars)
})


app.post('/urls/:shortURL/delete', (req, res) => {
    delete urlDatabase[req.params.shortURL]
    if (req.cookies.user_id) { // if the are logged in
        res.redirect('/urls/')
    } else { // if they are not loggged in, then bring them to the log in page
        res.redirect('/login')
    }
})


app.post('/urls/:shortURL/update', (req, res) => {
    const shortURL = req.params.shortURL
    const newLongURL = req.body.longURL
    urlDatabase[shortURL] = newLongURL // to add this new info into the urlDatabase
    // urlDatabase[req.params.shortURL] = req.body.longURL
    console.log("string", res.cookie.user_id);
    console.log("req part", req.cookies);
    if (req.cookies.user_id) { // if they are logged in, they can continue
        res.redirect('/urls/') 
    } else { // if they are not logged in go back to login
        res.redirect('/login')
    }
})


app.post('/login', (req, res) => {

    const email = req.body.email
    // const password = req.body.password
    const user = doesUserExist(email)
    // let user = users[user_id]
    if (!user) {
        res.status(403);
        res.send("User cannot be found");
    } else if (user) {
            if (req.body.password !== user["password"]) {
            res.status(403);
            res.send("Password incorrect");
        }
    }  
    // res.cookie("username", username)
    res.cookie("user_id", user.id)
    res.redirect('/urls/') // to redirect to the page which shows his newly created tiny URL
})


app.post('/logout', (req, res) => {
    // res.clearCookie("username");
    res.clearCookie("user_id");
    res.redirect('/login') 
})

app.get('/register', (req, res) => {
    let templateVars = {
        // shortURL: req.params.shortURL,
        // longURL: urlDatabase[req.params.shortURL],
        // username: req.cookies.username,
        // user: users[user.id]
    }
    res.render('urls_register.ejs', templateVars)
})

// Dry function to look up if email exists
const doesUserExist = (email) => {
    let user = false;
    Object.values(users).forEach((element) => {
        if ( email.toLowerCase() === element.email.toLowerCase()) {
            user = element;
        } 
    })  
    return user;
}


app.post('/register', (req, res) => {
    // __________________________________________
    
    const email = req.body.email
    const password = req.body.password

    if (email === "" || password === "") {
        res.status(400);
        res.send("Status code error ;p Email or Password can not be empty");
    } else if (doesUserExist(email)) {
        res.status(400);
        res.send("Status code error ;p User already exists");
    } else {
    // Creation of new person
        const newUserRandomID = generateRandomString()

        const eachUser = {
        id: newUserRandomID,
        email,
        password,
    };
// Insertion of new person to the object
    users[newUserRandomID] = eachUser;
    res.cookie("user_id", newUserRandomID)
    console.log(res.cookie)
    // username: req.cookies.username
    res.redirect('/urls/')
    }
})


app.get('/login', (req, res) => {
    let templateVars = {
        // shortURL: req.params.shortURL,
        // longURL: urlDatabase[req.params.shortURL],
        // username: req.cookies.username,
        // urls: urlDatabase,
        // user: user
    }
    res.render('urls_login.ejs', templateVars)
})













app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
})



