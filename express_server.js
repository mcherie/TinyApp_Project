const express = require('express')
const bcrypt = require('bcrypt');

var app = express()
var PORT = 8080 // default port 8080

// const cookieParser = require('cookie-parser')
// app.use(cookieParser())

const cookieSession = require('cookie-session')
app.use(cookieSession({
    name: 'session',
    keys: ['lighthouse-labs'],
  
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

const passwordSalt = 10;

const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
    "userRandomID": {
      id: "aJ48lW", 
      email: "user@example.com", 
      password: bcrypt.hashSync("purple-monkey-dinosaur", passwordSalt)
    },
    "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: bcrypt.hashSync("dishwasher-funk", passwordSalt)
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

function urlsForUser(id) {
    let urls = {};

    for (let shortURL in urlDatabase) {
        let url = urlDatabase[shortURL];
        
        if (url.userId === id) {
            urls[shortURL] = url;
        }
    }

    return urls;
}

// const urlsForUser = id => {
//     const urlsForCurrentUser = {}
//     Object.keys(urlDatabase).forEach(key => {
//         const val = urlDatabase[key];

//         if (id === val.userID) {
//             const url = val.longURL;
//             const element = {};
//             element[key] = url;

//             Object.assign(urlsForCurrentUser, element)
//         }
//     })

//     console.log('\n', urlsForCurrentUser, '\n')

//     return urlsForCurrentUser
// }


app.get('/urls', (req, res) => {
    let user_id = req.session.user_id;

    // console.log("***************", user_id)

    let user = users[user_id]


    // console.log('\n', "************* : user : 1", '\n', users, '\n', urlDatabase, '\n')


    let templateVars = { 
        urls: urlsForUser(user_id),
        user: user
    }
    res.render('urls_index', templateVars) // redirect //
})

app.get('/urls/new', (req, res) => {
    let user_id = req.session.user_id;
    let user = users[user_id]

    if (!user) { // if they are not logged in, they can not continue
        res.redirect("/login");
    }

    let templateVars = {
        // username: req.cookies.username,
        user: user
    }
    res.render('urls_new', templateVars)
})


app.post('/urls', (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
//   let newShortURL = generateRandomString() // to generate a new random string ***** PUT THIS BACK!!!
//   console.log(req.body)
  // console.log(newShortURL)
console.log("_____________________POST('urls'_____________________________________")

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
    var newShortURL = generateRandomString();
    const userID = req.session.user_id;
    // urlDatabase[newShortURL] = {} // to add this new info into the urlDatabase PUT THIS BACK!!!

// Creation of the new object url id
// const newUserRandomID = generateRandomString()

    urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    userID
};
// Insertion of new person to the object
// res.cookie("user_id", userID)
req.session.user_id = userID;

// username: req.cookies.username
console.log(urlDatabase) // just for me to see if it got added to the database
  res.redirect('/urls/' + newShortURL) // to redirect to the page which shows his newly created tiny URL
})

app.get('/u/:shortURL', (req, res) => {
    const url = urlDatabase[req.params.shortURL]

    if (url) {
        res.redirect(url.longURL)
    } else {
        res.status(404).send("Short URL does not exist");
    }
})




app.get('/urls/:shortURL', (req, res) => {
    let user_id = req.session.user_id;

    let user = users[user_id];
    let shortURL = req.params.shortURL;
    let urlObject = urlDatabase[shortURL];
    let longURL = urlObject.longURL;
    let urlUserId = urlObject.userID;

    let templateVars = {
        shortURL: shortURL,
        longURL: longURL,
        urlUserId: urlUserId,
        user: user
    }

    res.render('urls_show', templateVars)
})

app.post('/urls/:shortURL/delete', (req, res) => {
    const userId = req.session.user_id;

    if (userId) { // if the are logged in
        // Get short url from DB
        const urlItem = urlDatabase[req.params.shortURL];

        console.log("\nItem to be deleted", urlItem)


        console.log("\nChecking User", userId, urlItem.userID)

        // Check if the url belongs to current user
        if (userId === urlItem.userID) {
            // Only allow deletion if user is logged in
            delete urlDatabase[req.params.shortURL]
        }

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
    // console.log("string", res.cookie.user_id);
    // console.log("req part", req.cookies);
    console.log("_____________________POST('/update'_____________________________________")
    
    const userID = req.session.user_id;
    // res.cookie("user_id", userID)
    req.session.user_id = userID


    urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userID: userID
    };
    // Insertion of new person to the object    

    if (req.session.user_id) { // if they are logged in, they can continue
        res.redirect('/urls/' + shortURL);
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
        const password = req.body.password;
        const hashedPassword = user["password"];

        if (bcrypt.compareSync(password, hashedPassword)) {
            // res.cookie("user_id", user.id)
            req.session.user_id = user.id;
            res.redirect('/urls/') // to redirect to the page which shows his newly created tiny URL
        } else {
            res.status(403);
            res.send("Password incorrect");
        }
    }
})


app.post('/logout', (req, res) => {
    // res.clearCookie("username");
    // res.clearCookie("user_id");
    res.session = null;
    user = null;
    res.redirect('/login');
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
    const hashedPassword = bcrypt.hashSync(password, passwordSalt);

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
            password: hashedPassword
        };

        // Insertion of new person to the object
        users[newUserRandomID] = eachUser;
        // res.cookie("user_id", newUserRandomID)
        // console.log(res.cookie)

        req.session.user_id = newUserRandomID;

        console.log(users);
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



